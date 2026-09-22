import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LANGUAGE_ERROR, violatesLanguageRules } from "@/lib/moderation";

const schema = z.object({ username: z.string().trim().min(3).max(30).regex(/^[\p{L}\p{N}._-]+$/u), displayName: z.string().trim().min(2).max(60), bio: z.string().trim().max(280), ageRange: z.string().max(30), city: z.string().max(80), country: z.string().max(80), interests: z.string().max(300) });
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie les informations du profil." }, { status: 400 });
  if (violatesLanguageRules(parsed.data.username, parsed.data.displayName, parsed.data.bio, parsed.data.city, parsed.data.country, parsed.data.interests)) return NextResponse.json({ error: LANGUAGE_ERROR }, { status: 422 });
  try {
    const { interests, ...data } = parsed.data;
    const profile = await db.profile.update({ where: { userId: user.id }, data: { ...data, username: data.username.toLowerCase(), interests: interests.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 10) } });
    return NextResponse.json({ data: profile });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Ce pseudonyme est déjà utilisé." }, { status: 409 });
    return NextResponse.json({ error: "Impossible de modifier le profil." }, { status: 500 });
  }
}
