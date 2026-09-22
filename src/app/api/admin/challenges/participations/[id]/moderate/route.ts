import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve"), reason: z.string().optional() }),
  z.object({ action: z.literal("reject"), reason: z.string().trim().min(5).max(500) }),
]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const moderator = await getCurrentUser();
  if (!moderator) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (moderator.role !== "SUPER_ADMIN" && moderator.role !== "ADMIN" && moderator.role !== "MODERATOR") return NextResponse.json({ error: "Permission insuffisante." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Un motif d’au moins 5 caractères est requis pour refuser." }, { status: 400 });
  const { id } = await params;
  const participation = await db.challengeParticipation.findFirst({ where: { id, experienceStatus: "PENDING_REVIEW" }, include: { challenge: true } });
  if (!participation) return NextResponse.json({ error: "Témoignage introuvable ou déjà traité." }, { status: 404 });
  const approved = parsed.data.action === "approve";
  const rejectionReason = parsed.data.action === "reject" ? parsed.data.reason : null;
  const updated = await db.$transaction(async (transaction) => {
    const review = await transaction.challengeParticipation.update({ where: { id }, data: { experienceStatus: approved ? "APPROVED" : "REJECTED", experienceRejectionReason: rejectionReason } });
    await transaction.notification.create({ data: { userId: participation.userId, type: approved ? "CHALLENGE_EXPERIENCE_APPROVED" : "CHALLENGE_EXPERIENCE_REJECTED", title: approved ? "Ton témoignage est approuvé" : "Ton témoignage est à revoir", body: approved ? `Ton retour sur « ${participation.challenge.title} » peut être partagé avec la communauté.` : rejectionReason!, href: `/challenges/${participation.challenge.slug}` } });
    return review;
  });
  return NextResponse.json({ data: updated });
}
