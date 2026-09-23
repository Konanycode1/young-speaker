import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.email(),
  username: z.string().trim().min(3).max(30),
  newPassword: z.string().min(8).max(72),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie les informations saisies." }, { status: 400 });
  const { email, username, newPassword } = parsed.data;
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() }, include: { profile: true } });
  // Même message que l'email ou le pseudonyme soit erroné, pour ne pas révéler quel compte existe.
  if (!user || user.deletedAt || user.profile?.username.toLowerCase() !== username.toLowerCase()) {
    return NextResponse.json({ error: "Aucun compte ne correspond à cet email et ce pseudonyme." }, { status: 400 });
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  await db.session.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
