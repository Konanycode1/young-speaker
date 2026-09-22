import Link from "next/link";
import { ArrowUp, Eye } from "lucide-react";
import type { Article } from "@/lib/data";
import { Avatar } from "./avatar";

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return <article className={`article-card ${featured ? "featured-card" : ""}`}>
    <Link href={`/articles/${article.slug}`} className={`article-art art-${article.slug.split("-")[0]}`} aria-label={article.title}><span className="art-orb one"/><span className="art-orb two"/><span className="art-symbol">{featured ? "✦" : article.initials[0]}</span></Link>
    <div className="article-body"><span className="tag">{article.category}</span><h3><Link href={`/articles/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt}</p>
      <div className="article-meta"><span className="author"><Avatar initials={article.initials} color={article.color} size="sm"/><span><b>{article.author}</b><small>{article.date} · {article.readTime} min</small></span></span><span className="counts"><span><ArrowUp size={15}/>{article.votes}</span><span><Eye size={15}/>{article.views}</span></span></div>
    </div></article>;
}
