import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { db } from "@/lib/db";
import { avatarColor, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Les voix des jeunes", description: "Explore les articles, témoignages et opinions de la communauté Young Speaker." };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [databaseArticles, databaseCategories] = await Promise.all([
    db.article.findMany({
      where: { status: "APPROVED", deletedAt: null, ...(category ? { category: { name: category } } : {}) },
      include: { category: true, author: { include: { profile: true } } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 30,
    }),
    db.category.findMany({
      where: { articles: { some: { status: "APPROVED", deletedAt: null } } },
      orderBy: { name: "asc" },
    }),
  ]);
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
  const categories = ["Tous", ...databaseCategories.map((item) => item.name)];

  return <><section className="page-hero container"><span className="eyebrow">Explorer</span><h1>Les voix des jeunes</h1><p>Des expériences vraies, des idées fortes et des mots qui nous rapprochent.</p></section><section className="container section" style={{ paddingTop: 0 }}><div className="filters">{categories.map((item) => <a key={item} className={`filter ${(!category && item === "Tous") || category === item ? "active" : ""}`} href={item === "Tous" ? "/articles" : `/articles?category=${encodeURIComponent(item)}`}>{item}</a>)}</div>{articles.length ? <div className="article-grid">{articles.map((article) => <ArticleCard article={article} key={article.slug} />)}</div> : <div className="empty-note">{category ? "Aucun article publié dans cette catégorie." : "Aucun article publié pour le moment."}</div>}</section></>;
}
