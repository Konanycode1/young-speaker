import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve"), reason: z.string().max(1000).optional() }),
  z.object({ action: z.literal("reject"), reason: z.string().trim().min(5).max(1000) }),
  z.object({ action: z.literal("unpublish"), reason: z.string().trim().min(5).max(1000) }),
  z.object({ action: z.literal("republish") }),
]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const moderator = await getCurrentUser();
  if (!moderator) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (moderator.role !== "SUPER_ADMIN" && moderator.role !== "ADMIN" && moderator.role !== "MODERATOR") return NextResponse.json({ error: "Permission insuffisante." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Un motif d’au moins 5 caractères est obligatoire." }, { status: 400 });
  const { id } = await params;
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  if (parsed.data.action === "approve" || parsed.data.action === "reject") {
    if (existing.status !== "PENDING_REVIEW") return NextResponse.json({ error: "Cet article n’est plus en attente." }, { status: 409 });
    const approved = parsed.data.action === "approve";
    const rejectionReason = parsed.data.action === "reject" ? parsed.data.reason : null;
    const article = await db.$transaction(async (transaction) => {
      const updated = await transaction.article.update({ where: { id }, data: { status: approved ? "APPROVED" : "REJECTED", publishedAt: approved ? new Date() : null, rejectionReason } });
      await transaction.notification.create({ data: { userId: existing.authorId, type: approved ? "ARTICLE_APPROVED" : "ARTICLE_REJECTED", title: approved ? "Ton article est publié !" : "Ton article nécessite des modifications", body: approved ? `« ${existing.title} » est maintenant visible par la communauté.` : rejectionReason!, href: approved ? `/articles/${existing.slug}` : "/dashboard/articles" } });
      return updated;
    });
    return NextResponse.json({ data: article });
  }

  if (parsed.data.action === "unpublish") {
    if (existing.status !== "APPROVED") return NextResponse.json({ error: "Cet article n’est pas publié." }, { status: 409 });
    const reason = parsed.data.reason;
    const article = await db.$transaction(async (transaction) => {
      const updated = await transaction.article.update({ where: { id }, data: { status: "ARCHIVED", rejectionReason: reason } });
      await transaction.notification.create({ data: { userId: existing.authorId, type: "ARTICLE_UNPUBLISHED", title: "Ton article a été retiré", body: reason, href: "/dashboard/articles" } });
      return updated;
    });
    return NextResponse.json({ data: article });
  }

  // republish
  if (existing.status !== "ARCHIVED") return NextResponse.json({ error: "Cet article n’a pas été retiré." }, { status: 409 });
  const article = await db.$transaction(async (transaction) => {
    const updated = await transaction.article.update({ where: { id }, data: { status: "APPROVED", rejectionReason: null } });
    await transaction.notification.create({ data: { userId: existing.authorId, type: "ARTICLE_APPROVED", title: "Ton article est de nouveau publié !", body: `« ${existing.title} » est de nouveau visible par la communauté.`, href: `/articles/${existing.slug}` } });
    return updated;
  });
  return NextResponse.json({ data: article });
}
