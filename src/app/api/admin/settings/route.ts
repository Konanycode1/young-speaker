import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { canManageSettings } from "@/lib/permissions";
import { setAutoPublishArticles } from "@/lib/settings";

const schema = z.object({ autoPublishArticles: z.boolean() });

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!canManageSettings(user.role)) return NextResponse.json({ error: "Permission insuffisante." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Valeur invalide." }, { status: 400 });
  const settings = await setAutoPublishArticles(parsed.data.autoPublishArticles);
  return NextResponse.json({ data: settings });
}
