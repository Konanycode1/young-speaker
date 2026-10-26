import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { welcomeEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/mailer";
import { LANGUAGE_ERROR, violatesLanguageRules } from "@/lib/moderation";

const schema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(72),
  displayName: z.string().trim().min(2).max(60),
  accountType: z.enum(["COMMENTER", "SPEAKER"]),
});

// Le pseudonyme saisi (ex. « N'Guessan », « Marie Claire ») sert de nom affiché ;
// l'identifiant technique utilisé dans les URL (/speakers/<identifiant>) en est
// dérivé automatiquement, pour ne jamais bloquer l'inscription sur un format de
// pseudonyme pourtant légitime.
function slugifyUsername(value: string) {
  const base = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return base || "speaker";
}

async function uniqueUsername(displayName: string) {
  const base = slugifyUsername(displayName);
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    if (!(await db.profile.findUnique({ where: { username: candidate }, select: { id: true } }))) return candidate;
  }
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie les informations saisies." }, { status: 400 });
  const { email, password, displayName, accountType } = parsed.data;
  if (violatesLanguageRules(displayName)) return NextResponse.json({ error: LANGUAGE_ERROR }, { status: 422 });
  try {
    const username = await uniqueUsername(displayName);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(password, 12),
        role: accountType === "SPEAKER" ? "YOUNG_SPEAKER" : "VISITOR",
        profile: { create: { username, displayName, interests: [] } },
      },
    });
    await createSession(user.id);
    const isSpeaker = user.role === "YOUNG_SPEAKER";
    const welcome = welcomeEmail({ displayName, isSpeaker });
    void sendEmail({ to: user.email, subject: welcome.subject, html: welcome.html, text: welcome.text });
    return NextResponse.json({ data: { role: user.role } }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Cet email ou ce pseudonyme est déjà utilisé." }, { status: 409 });
    }
    return NextResponse.json({ error: "Impossible de créer le compte pour le moment." }, { status: 500 });
  }
}
