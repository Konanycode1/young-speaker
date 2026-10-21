import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isStaff } from "@/lib/permissions";

// Dépublie un témoignage déjà approuvé : il redevient privé, comme s'il
// n'avait jamais été partagé publiquement. Aucun motif requis : ce n'est pas
// un refus pour faute, juste un retrait de la visibilité publique.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const moderator = await getCurrentUser();
  if (!moderator || !isStaff(moderator.role)) return NextResponse.json({ error: "Permission insuffisante." }, { status: 403 });

  const { id } = await params;
  const participation = await db.challengeParticipation.findFirst({ where: { id, experienceStatus: "APPROVED" } });
  if (!participation) return NextResponse.json({ error: "Témoignage introuvable ou pas publié." }, { status: 404 });

  const updated = await db.challengeParticipation.update({ where: { id }, data: { experienceStatus: "PRIVATE" } });
  return NextResponse.json({ data: updated });
}
