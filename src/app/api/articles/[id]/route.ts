import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LANGUAGE_ERROR, violatesLanguageRules } from "@/lib/moderation";

const schema = z.object({
  title: z.string().trim().min(10).max(140),
  excerpt: z.string().trim().min(20).max(240),
  content: z.string().trim().min(100).max(50_000),
  category: z.string().trim().min(2).max(80),
  weeklyThemeId: z.string().optional(),
  intent: z.enum(["draft", "submit"]),
});

const toSlug = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour modifier ton article." }, { status: 401 });
  const { id } = await params;
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  if (existing.authorId !== user.id) return NextResponse.json({ error: "Tu ne peux modifier que tes propres articles." }, { status: 403 });
  if (existing.status === "ARCHIVED") return NextResponse.json({ error: "Un article archivé ne peut plus être modifié." }, { status: 409 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie le titre, l’extrait et le contenu.", issues: parsed.error.issues }, { status: 400 });
  const data = parsed.data;
  if (violatesLanguageRules(data.title, data.excerpt, data.content, data.category)) return NextResponse.json({ error: LANGUAGE_ERROR }, { status: 422 });

  const categorySlug = toSlug(data.category);
  const category = await db.category.upsert({ where: { slug: categorySlug }, update: {}, create: { name: data.category, slug: categorySlug } });

  // Republier un article déjà approuvé exige une nouvelle relecture avant sa remise en ligne.
  const nextStatus = data.intent === "submit" ? "PENDING_REVIEW" : "DRAFT";
  const article = await db.article.update({
    where: { id },
    data: {
      categoryId: category.id,
      weeklyThemeId: data.weeklyThemeId || null,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      status: nextStatus,
      rejectionReason: null,
      publishedAt: null,
    },
  });
  return NextResponse.json({ data: article });
}
