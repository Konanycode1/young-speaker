import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { newCommentEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/mailer";
import { LANGUAGE_ERROR, violatesLanguageRules } from "@/lib/moderation";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3901";

const schema = z.object({ content: z.string().trim().min(2).max(2000), parentId: z.string().cuid().optional() });

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await db.article.findFirst({ where: { OR: [{ id }, { slug: id }], status: "APPROVED", deletedAt: null }, select: { id: true, slug: true, authorId: true } });
  if (!article) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  const comments = await db.comment.findMany({
    where: { OR: [{ articleId: article.id }, { articleSlug: article.slug }], parentId: null, deletedAt: null, isHidden: false },
    include: {
      author: { include: { profile: true } },
      replies: { where: { deletedAt: null, isHidden: false }, include: { author: { include: { profile: true } } }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({
    data: comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.author.profile?.displayName ?? "Membre",
      authorId: comment.authorId,
      replies: comment.replies.map((reply) => ({ id: reply.id, content: reply.content, createdAt: reply.createdAt, author: reply.author.profile?.displayName ?? "Membre", authorId: reply.authorId })),
    })),
    articleAuthorId: article.authorId,
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour commenter." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Le commentaire doit contenir entre 2 et 2 000 caractères." }, { status: 400 });
  if (violatesLanguageRules(parsed.data.content)) return NextResponse.json({ error: LANGUAGE_ERROR }, { status: 422 });
  const { id } = await params;
  const article = await db.article.findFirst({
    where: { OR: [{ id }, { slug: id }], status: "APPROVED", deletedAt: null },
    select: { id: true, slug: true, title: true, author: { select: { id: true, email: true, profile: { select: { displayName: true } } } } },
  });
  if (!article) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  if (parsed.data.parentId) {
    if (user.id !== article.author.id) return NextResponse.json({ error: "Seul l’auteur de l’article peut répondre à un commentaire." }, { status: 403 });
    const parentComment = await db.comment.findFirst({ where: { id: parsed.data.parentId, OR: [{ articleId: article.id }, { articleSlug: article.slug }], deletedAt: null }, select: { parentId: true } });
    if (!parentComment) return NextResponse.json({ error: "Commentaire introuvable." }, { status: 404 });
    if (parentComment.parentId) return NextResponse.json({ error: "Impossible de répondre à une réponse." }, { status: 400 });
  }

  const [comment] = await db.$transaction([
    db.comment.create({ data: { authorId: user.id, articleId: article.id, articleSlug: article.slug, content: parsed.data.content, parentId: parsed.data.parentId } }),
    db.article.update({ where: { id: article.id }, data: { commentCount: { increment: 1 } } }),
  ]);
  const commenterName = user.profile?.displayName ?? "Membre";
  if (article.author.id !== user.id) {
    const email = newCommentEmail({
      authorName: article.author.profile?.displayName ?? "Young Speaker",
      articleTitle: article.title,
      commenterName,
      commentExcerpt: parsed.data.content.length > 200 ? `${parsed.data.content.slice(0, 200)}…` : parsed.data.content,
      articleUrl: `${SITE_URL}/articles/${article.slug}`,
    });
    void sendEmail({ to: article.author.email, subject: email.subject, html: email.html, text: email.text });
  }
  return NextResponse.json({ data: { id: comment.id, content: comment.content, createdAt: comment.createdAt, author: commenterName, authorId: user.id, parentId: parsed.data.parentId ?? null } }, { status: 201 });
}
