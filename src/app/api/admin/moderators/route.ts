import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ email: z.email().max(254), password: z.string().min(8).max(72), username: z.string().trim().min(3).max(30).regex(/^[\p{L}\p{N}._-]+$/u), displayName: z.string().trim().min(2).max(80) });

export async function POST(request: NextRequest) {
  const superAdmin = await getCurrentUser();
  if (!superAdmin) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (superAdmin.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Seul le super administrateur peut ajouter un modérateur." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie le nom, l’email, le pseudonyme et le mot de passe." }, { status: 400 });
  const { email, password, username, displayName } = parsed.data;
  try {
    const moderator = await db.user.create({ data: { email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: "MODERATOR", profile: { create: { username: username.toLowerCase(), displayName, interests: ["Modération", "Sécurité"] } } }, include: { profile: true } });
    return NextResponse.json({ data: { id: moderator.id, email: moderator.email, role: moderator.role, profile: moderator.profile } }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Cet email ou ce pseudonyme est déjà utilisé." }, { status: 409 });
    throw error;
  }
}
