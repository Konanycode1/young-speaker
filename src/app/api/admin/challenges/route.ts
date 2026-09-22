import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isStaff } from "@/lib/permissions";

const schema = z.object({ title: z.string().trim().min(5).max(140), description: z.string().trim().min(20).max(1000), objective: z.string().trim().min(10).max(240), instructions: z.string().trim().min(10).max(3000), difficulty: z.enum(["Facile", "Intermédiaire", "Avancé"]), reward: z.string().trim().max(120).optional(), points: z.coerce.number().int().min(0).max(1000), startsAt: z.coerce.date(), endsAt: z.coerce.date(), status: z.enum(["DRAFT", "ACTIVE"]) }).refine((data) => data.endsAt > data.startsAt, { message: "La date de fin doit suivre la date de début." });
const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!isStaff(user.role)) return NextResponse.json({ error: "Permission insuffisante." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Vérifie les informations du challenge." }, { status: 400 });
  const { title, reward, ...data } = parsed.data;
  const challenge = await db.challenge.create({ data: { ...data, title, reward: reward || null, slug: `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}` } });
  return NextResponse.json({ data: challenge }, { status: 201 });
}
