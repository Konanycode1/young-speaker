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

const toSlug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function GET() {
  const databaseArticles = await db.article.findMany({
    where: { status: "APPROVED", deletedAt: null },
    select: {
      id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true,
      sensitiveWarning: true, views: true, voteCount: true, commentCount: true,
      publishedAt: true, createdAt: true,
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, profile: { select: { username: true, displayName: true, avatarUrl: true } } } },
    },
    take: 30,
    orderBy: { publishedAt: "desc" },
  });
  return NextResponse.json({ data: databaseArticles });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour publier." }, { status: 401 });
  if (user.role !== "YOUNG_SPEAKER") return NextResponse.json({ error: "Seuls les Young Speakers peuvent publier." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie le titre, l’extrait et le contenu.", issues: parsed.error.issues }, { status: 400 });
  const data = parsed.data;
  if (violatesLanguageRules(data.title, data.excerpt, data.content, data.category)) return NextResponse.json({ error: LANGUAGE_ERROR }, { status: 422 });
  const categorySlug = toSlug(data.category);
  const category = await db.category.upsert({ where: { slug: categorySlug }, update: {}, create: { name: data.category, slug: categorySlug } });
  const slug = `${toSlug(data.title)}-${crypto.randomUUID().slice(0, 6)}`;
  const article = await db.article.create({ data: { authorId: user.id, categoryId: category.id, weeklyThemeId: data.weeklyThemeId || null, title: data.title, slug, excerpt: data.excerpt, content: data.content, status: data.intent === "submit" ? "PENDING_REVIEW" : "DRAFT" } });
  if (data.intent === "submit") {
    const badge = await db.badge.findUnique({ where: { slug: "premier-article" } });
    if (badge) await db.userBadge.upsert({ where: { userId_badgeId: { userId: user.id, badgeId: badge.id } }, update: {}, create: { userId: user.id, badgeId: badge.id } });
  }
  return NextResponse.json({ data: article }, { status: 201 });
}
