import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ currentPassword: z.string().min(8).max(72), newPassword: z.string().min(8).max(72) });
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  if (!(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) return NextResponse.json({ error: "Le mot de passe actuel est incorrect." }, { status: 400 });
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } });
  await db.session.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
