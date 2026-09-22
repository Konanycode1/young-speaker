import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Comments } from "@/components/comments";
import { VoteButton } from "@/components/vote-button";
import { db } from "@/lib/db";
import { avatarColor, initials } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findFirst({ where: { slug, status: "APPROVED", deletedAt: null }, select: { title: true, excerpt: true } });
  return article ? { title: article.title, description: article.excerpt, openGraph: { title: article.title, description: article.excerpt, type: "article" } } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await db.article.findFirst({
    where: { slug, status: "APPROVED", deletedAt: null },
    include: { category: true, author: { include: { profile: true } } },
  });
  if (!article) notFound();

  const author = article.author.profile?.displayName ?? "Young Speaker";
  const authorInitials = initials(author);
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(article.publishedAt ?? article.createdAt);
  const readTime = Math.max(2, Math.ceil(article.content.split(/\s+/).length / 220));
  const content = article.content.split(/\n\n+/);
  return <article className="detail-wrap"><header className="detail-head"><span className="tag">{article.category.name}</span><h1>{article.title}</h1><p className="dek">{article.excerpt}</p><div className="detail-author"><Avatar initials={authorInitials} color={avatarColor(article.author.profile?.username ?? article.authorId)} size="sm" /><span className="author"><span><b>{author}</b><small>{date} · {readTime} min de lecture</small></span></span></div></header><div className={`detail-cover art-${slug.split("-")[0]}`}><span>{authorInitials[0]}</span></div>{article.sensitiveWarning && <div className="sensitive">⚠️ <b>Prends soin de toi.</b> {article.sensitiveWarning} Ce contenu ne remplace pas l’avis d’un professionnel.</div>}<div className="article-content">{content.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</div><div className="vote-row"><VoteButton initial={article.voteCount} articleId={article.id} /></div><Comments articleSlug={article.slug} /></article>;
}
