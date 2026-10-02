import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canManageSettings } from "@/lib/permissions";

const schema = z.object({
  name: z.string().trim().min(3).max(80),
  message: z.string().trim().min(10).max(240),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaUrl: z.string().trim().max(300).optional(),
  themePrompt: z.string().trim().max(500).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

const slugify = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!canManageSettings(user.role)) return NextResponse.json({ error: "Permission insuffisante." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Vérifie les informations de la campagne." }, { status: 400 });
  const { name, ctaLabel, ctaUrl, themePrompt, ...data } = parsed.data;
  const campaign = await db.awarenessCampaign.create({
    data: { ...data, name, ctaLabel: ctaLabel || null, ctaUrl: ctaUrl || null, themePrompt: themePrompt || null, slug: `${slugify(name)}-${crypto.randomUUID().slice(0, 6)}` },
  });
  return NextResponse.json({ data: campaign }, { status: 201 });
}
