import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LANGUAGE_ERROR, violatesLanguageRules } from "@/lib/moderation";

const schema = z.object({ content: z.string().trim().min(2).max(2000) });

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await db.article.findFirst({ where: { OR: [{ id }, { slug: id }], status: "APPROVED", deletedAt: null }, select: { id: true, slug: true } });
  if (!article) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  const comments = await db.comment.findMany({
    where: { OR: [{ articleId: article.id }, { articleSlug: article.slug }], deletedAt: null, isHidden: false },
    include: { author: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ data: comments.map((comment) => ({ id: comment.id, content: comment.content, createdAt: comment.createdAt, author: comment.author.profile?.displayName ?? "Membre" })) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour commenter." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Le commentaire doit contenir entre 2 et 2 000 caractères." }, { status: 400 });
  if (violatesLanguageRules(parsed.data.content)) return NextResponse.json({ error: LANGUAGE_ERROR }, { status: 422 });
  const { id } = await params;
  const article = await db.article.findFirst({ where: { OR: [{ id }, { slug: id }], status: "APPROVED", deletedAt: null }, select: { id: true, slug: true } });
  if (!article) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  const [comment] = await db.$transaction([
    db.comment.create({ data: { authorId: user.id, articleId: article.id, articleSlug: article.slug, content: parsed.data.content } }),
    db.article.update({ where: { id: article.id }, data: { commentCount: { increment: 1 } } }),
  ]);
  return NextResponse.json({ data: { id: comment.id, content: comment.content, createdAt: comment.createdAt, author: user.profile?.displayName ?? "Membre" } }, { status: 201 });
}
