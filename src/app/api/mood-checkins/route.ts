import type { Mood } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LANGUAGE_ERROR, violatesLanguageRules } from "@/lib/moderation";
import { INFLUENCE_TAGS, MOOD_ORDER } from "@/lib/mood";

const schema = z.object({
  mood: z.enum(MOOD_ORDER as [string, ...string[]]),
  influences: z.array(z.string()).max(INFLUENCE_TAGS.length).default([]),
  note: z.string().trim().max(500).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const checkIns = await db.moodCheckIn.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 14 });
  return NextResponse.json({ data: checkIns });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour faire ton point du jour." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Sélectionne une humeur valide." }, { status: 400 });
  const data = parsed.data;
  const influences = data.influences.filter((tag) => INFLUENCE_TAGS.includes(tag));
  if (data.note && violatesLanguageRules(data.note)) return NextResponse.json({ error: LANGUAGE_ERROR }, { status: 422 });
  const checkIn = await db.moodCheckIn.create({ data: { userId: user.id, mood: data.mood as Mood, influences, note: data.note || null } });
  return NextResponse.json({ data: checkIn }, { status: 201 });
}
