import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canBlock, isStaff } from "@/lib/permissions";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("block"), reason: z.string().trim().min(5).max(500) }),
  z.object({ action: z.literal("unblock") }),
]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!isStaff(actor.role)) return NextResponse.json({ error: "Permission insuffisante." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Un motif d’au moins 5 caractères est obligatoire pour bloquer un compte." }, { status: 400 });
  const { id } = await params;
  if (id === actor.id) return NextResponse.json({ error: "Tu ne peux pas bloquer ton propre compte." }, { status: 400 });
  const target = await db.user.findUnique({ where: { id }, select: { id: true, role: true, deletedAt: true, blockedAt: true } });
  if (!target || target.deletedAt) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  if (!canBlock(actor.role, target.role)) return NextResponse.json({ error: "Tu n’as pas la permission de bloquer ce compte." }, { status: 403 });

  if (parsed.data.action === "block") {
    if (target.blockedAt) return NextResponse.json({ error: "Ce compte est déjà bloqué." }, { status: 409 });
    await db.$transaction([
      db.user.update({ where: { id }, data: { blockedAt: new Date(), blockedReason: parsed.data.reason, blockedById: actor.id } }),
      db.session.deleteMany({ where: { userId: id } }),
    ]);
    return NextResponse.json({ data: { id, blocked: true } });
  }
  if (!target.blockedAt) return NextResponse.json({ error: "Ce compte n’est pas bloqué." }, { status: 409 });
  await db.user.update({ where: { id }, data: { blockedAt: null, blockedReason: null, blockedById: null } });
  return NextResponse.json({ data: { id, blocked: false } });
}
