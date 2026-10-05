import type { Metadata } from "next";
import { ArticleExplorer } from "@/components/article-explorer";
import { db } from "@/lib/db";
import { avatarColor, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Les voix des jeunes", description: "Explore les articles, témoignages et opinions de la communauté Young Speaker." };

const FILTERS = ["Société", "Santé mentale", "Famille", "Jeunesse", "Éducation", "Développement personnel", "Bien-être psychologique", "Autres"];

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const databaseArticles = await db.article.findMany({
    where: { status: "APPROVED", deletedAt: null },
    include: { category: true, campaign: true, author: { include: { profile: true } } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 30,
  });
  const articles = databaseArticles.map((article) => {
    const author = article.author.profile?.displayName ?? "Young Speaker";
    return {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category.name,
      campaign: article.campaign?.name ?? null,
      author,
      initials: initials(author),
      color: avatarColor(article.author.profile?.username ?? article.authorId),
      votes: article.voteCount,
      views: article.views,
      comments: article.commentCount,
      readTime: Math.max(2, Math.ceil(article.content.split(/\s+/).length / 220)),
      date: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(article.publishedAt ?? article.createdAt),
      sensitive: article.sensitiveWarning ?? undefined,
      content: article.content.split(/\n\n+/),
    };
  });
  const initialFilter = category && FILTERS.includes(category) ? category : "Tous";

  return <><section className="page-hero container"><span className="eyebrow">Explorer</span><h1>Les voix des jeunes</h1><p>Des expériences vraies, des idées fortes et des mots qui nous rapprochent.</p></section><section className="container section" style={{ paddingTop: 0 }}><ArticleExplorer articles={articles} initialFilter={initialFilter} /></section></>;
}
