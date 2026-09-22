import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { LANGUAGE_ERROR, violatesLanguageRules } from "@/lib/moderation";

const schema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(72),
  username: z.string().trim().min(3).max(30).regex(/^[\p{L}\p{N}._-]+$/u),
  accountType: z.enum(["COMMENTER", "SPEAKER"]),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie les informations saisies." }, { status: 400 });
  const { email, password, username, accountType } = parsed.data;
  if (violatesLanguageRules(username)) return NextResponse.json({ error: LANGUAGE_ERROR }, { status: 422 });
  try {
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(password, 12),
        role: accountType === "SPEAKER" ? "YOUNG_SPEAKER" : "VISITOR",
        profile: { create: { username: username.toLowerCase(), displayName: username, interests: [] } },
      },
    });
    await createSession(user.id);
    return NextResponse.json({ data: { role: user.role } }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Cet email ou ce pseudonyme est déjà utilisé." }, { status: 409 });
    }
    return NextResponse.json({ error: "Impossible de créer le compte pour le moment." }, { status: 500 });
  }
}
