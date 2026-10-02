import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour réagir." }, { status: 401 });
  const { id } = await params;
  const participation = await db.challengeParticipation.findUnique({ where: { id }, include: { challenge: true } });
  if (!participation || participation.experienceStatus !== "APPROVED" || !participation.experiencePublic) {
    return NextResponse.json({ error: "Ce témoignage n’est pas disponible." }, { status: 404 });
  }
  // Sujets sensibles : la qualité du témoignage prime, pas les réactions.
  if (participation.challenge.sensitive) return NextResponse.json({ error: "Les réactions sont désactivées pour ce challenge." }, { status: 403 });

  const existing = await db.experienceReaction.findUnique({ where: { participationId_userId: { participationId: id, userId: user.id } } });
  if (existing) await db.experienceReaction.delete({ where: { id: existing.id } });
  else await db.experienceReaction.create({ data: { participationId: id, userId: user.id } });

  const count = await db.experienceReaction.count({ where: { participationId: id } });
  return NextResponse.json({ data: { count, reacted: !existing } });
}
