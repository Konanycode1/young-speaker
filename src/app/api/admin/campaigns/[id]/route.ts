import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canManageSettings } from "@/lib/permissions";

const schema = z.object({
  isActive: z.boolean().optional(),
  message: z.string().trim().min(10).max(240).optional(),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaUrl: z.string().trim().max(300).optional(),
  themePrompt: z.string().trim().max(500).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!canManageSettings(user.role)) return NextResponse.json({ error: "Permission insuffisante." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Valeur invalide." }, { status: 400 });
  const { id } = await params;
  const { isActive, ctaLabel, ctaUrl, themePrompt, ...rest } = parsed.data;

  // Une seule campagne active à la fois : en activer une désactive les autres.
  const campaign = await db.$transaction(async (transaction) => {
    if (isActive) await transaction.awarenessCampaign.updateMany({ where: { isActive: true, id: { not: id } }, data: { isActive: false } });
    return transaction.awarenessCampaign.update({
      where: { id },
      data: {
        ...rest,
        ...(isActive !== undefined ? { isActive } : {}),
        ...(ctaLabel !== undefined ? { ctaLabel: ctaLabel || null } : {}),
        ...(ctaUrl !== undefined ? { ctaUrl: ctaUrl || null } : {}),
        ...(themePrompt !== undefined ? { themePrompt: themePrompt || null } : {}),
      },
    });
  });
  return NextResponse.json({ data: campaign });
}
