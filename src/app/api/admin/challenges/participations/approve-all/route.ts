import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isStaff } from "@/lib/permissions";

// Approuve en une fois tous les témoignages en attente. Ne concerne que les
// participations où le Young Speaker a explicitement coché « partager
// publiquement » (experienceStatus ne passe à PENDING_REVIEW que dans ce cas) :
// aucun consentement n'est contourné par ce bouton.
export async function POST() {
  const moderator = await getCurrentUser();
  if (!moderator || !isStaff(moderator.role)) return NextResponse.json({ error: "Permission insuffisante." }, { status: 403 });

  const pending = await db.challengeParticipation.findMany({ where: { experienceStatus: "PENDING_REVIEW", experience: { not: null } }, include: { challenge: { select: { title: true, slug: true } } } });

  let approved = 0;
  for (const participation of pending) {
    await db.$transaction(async (transaction) => {
      await transaction.challengeParticipation.update({ where: { id: participation.id }, data: { experienceStatus: "APPROVED" } });
      await transaction.notification.create({ data: { userId: participation.userId, type: "CHALLENGE_EXPERIENCE_APPROVED", title: "Ton témoignage est approuvé", body: `Ton retour sur « ${participation.challenge.title} » peut être partagé avec la communauté.`, href: `/challenges/${participation.challenge.slug}` } });
    });
    approved += 1;
  }

  return NextResponse.json({ data: { approved } });
}
