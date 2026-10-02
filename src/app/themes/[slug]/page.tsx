import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dashboard";
import { avatarColor, initials } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const theme = await db.weeklyTheme.findUnique({ where: { slug }, select: { title: true, description: true } });
  return theme ? { title: theme.title, description: theme.description } : {};
}

export default async function ThemeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = await db.weeklyTheme.findUnique({ where: { slug } });
  if (!theme) notFound();

  const now = new Date();
  const status = theme.startsAt > now ? "upcoming" : theme.endsAt < now ? "past" : "current";

  const databaseArticles = await db.article.findMany({
    where: { weeklyThemeId: theme.id, status: "APPROVED", deletedAt: null },
    include: { category: true, author: { include: { profile: true } } },
    orderBy: [{ voteCount: "desc" }, { publishedAt: "desc" }],
  });
  const articles = databaseArticles.map((article) => {
    const author = article.author.profile?.displayName ?? "Young Speaker";
    return {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category.name,
      author,
      initials: initials(author),
      color: avatarColor(article.author.profile?.username ?? article.authorId),
      votes: article.voteCount,
      views: article.views,
      readTime: Math.max(2, Math.ceil(article.content.split(/\s+/).length / 220)),
      date: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(article.publishedAt ?? article.createdAt),
      sensitive: article.sensitiveWarning ?? undefined,
      content: article.content.split(/\n\n+/),
    };
  });

  return <>
    <section className="page-hero container">
      <Link className="arrow-link" href="/themes" style={{ justifyContent: "center", marginBottom: "1rem" }}><ArrowLeft size={16} /> Tous les thèmes</Link>
      <span className="eyebrow">{status === "current" ? "En ce moment" : status === "upcoming" ? `À partir du ${formatDate(theme.startsAt)}` : formatDate(theme.startsAt)}</span>
      <h1>{theme.title}</h1>
      <p>{theme.description}</p>
      {status !== "past" && <Link className="button violet" href="/dashboard/new-article">Partager ma voix <ArrowRight size={17} /></Link>}
    </section>
    <section className="container section" style={{ paddingTop: 0 }}>
      {articles.length
        ? <div className="article-grid">{articles.map((article, index) => <ArticleCard key={article.slug} article={article} featured={index === 0} />)}</div>
        : <div className="empty-note">{status === "past" ? "Aucun article n’a été publié sur ce thème." : "Aucun article pour le moment. Sois la première personne à en écrire un."}</div>}
    </section>
  </>;
}
