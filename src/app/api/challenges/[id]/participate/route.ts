import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("join") }),
  z.object({
    action: z.literal("complete"),
    experience: z.string().trim().max(2000).optional(),
    experiencePublic: z.boolean().default(false),
  }),
]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour participer." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie les informations envoyées." }, { status: 400 });
  const { id } = await params;
  const now = new Date();
  const challenge = await db.challenge.findFirst({ where: { id, status: "ACTIVE", startsAt: { lte: now }, endsAt: { gte: now } } });
  if (!challenge) return NextResponse.json({ error: "Ce challenge n’est plus disponible." }, { status: 404 });

  const existing = await db.challengeParticipation.findUnique({ where: { userId_challengeId: { userId: user.id, challengeId: id } } });
  if (parsed.data.action === "join") {
    if (existing) return NextResponse.json({ data: existing });
    const participation = await db.challengeParticipation.create({ data: { userId: user.id, challengeId: id } });
    await db.notification.create({ data: { userId: user.id, type: "CHALLENGE_JOINED", title: "Challenge commencé", body: `Tu participes maintenant à « ${challenge.title} ».`, href: `/challenges/${challenge.slug}` } });
    return NextResponse.json({ data: participation }, { status: 201 });
  }

  if (!existing) return NextResponse.json({ error: "Commence d’abord le challenge." }, { status: 409 });
  if (existing.status === "COMPLETED") return NextResponse.json({ error: "Ce challenge est déjà terminé." }, { status: 409 });
  const completion = parsed.data;
  const badge = await db.badge.findUnique({ where: { slug: "challenge-master" } });
  const participation = await db.$transaction(async (transaction) => {
    const completed = await transaction.challengeParticipation.update({
      where: { id: existing.id },
      data: {
        status: "COMPLETED",
        completedAt: now,
        experience: completion.experience || null,
        experiencePublic: Boolean(completion.experience && completion.experiencePublic),
        experienceStatus: completion.experience && completion.experiencePublic ? "PENDING_REVIEW" : "PRIVATE",
        experienceRejectionReason: null,
      },
    });
    await transaction.profile.update({ where: { userId: user.id }, data: { totalPoints: { increment: challenge.points } } });
    if (badge) await transaction.userBadge.upsert({ where: { userId_badgeId: { userId: user.id, badgeId: badge.id } }, update: {}, create: { userId: user.id, badgeId: badge.id } });
    await transaction.notification.create({ data: { userId: user.id, type: "CHALLENGE_COMPLETED", title: "Challenge terminé 🎉", body: `Bravo ! Tu gagnes ${challenge.points} points.`, href: "/dashboard/badges" } });
    return completed;
  });
  return NextResponse.json({ data: participation });
}
