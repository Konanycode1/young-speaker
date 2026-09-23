import Link from "next/link";
import { notFound } from "next/navigation";
import { Comments } from "@/components/comments";
import { db } from "@/lib/db";
import { formatNumber, requireSpeaker, statusLabels } from "@/lib/dashboard";

export default async function ReadMyArticle({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSpeaker();
  const { id } = await params;
  const article = await db.article.findFirst({ where: { id, deletedAt: null }, include: { category: true } });
  if (!article || article.authorId !== user.id) notFound();

  const content = article.content.split(/\n\n+/);
  return <>
    <div className="dash-head">
      <div><span className="eyebrow">{article.category.name}</span><h1>{article.title}</h1></div>
      <div className="article-row-actions">
        <span className={`status status-${article.status.toLowerCase()}`}>{statusLabels[article.status]}</span>
        {article.status !== "ARCHIVED" && <Link className="button small outline" href={`/dashboard/articles/${article.id}/edit`}>Modifier</Link>}
      </div>
    </div>
    {article.rejectionReason && <p className="form-error">Motif du refus : {article.rejectionReason}</p>}
    <div className="panel">
      <p className="dek">{article.excerpt}</p>
      {article.sensitiveWarning && <div className="sensitive">⚠️ <b>Prends soin de toi.</b> {article.sensitiveWarning}</div>}
      <div className="article-content">{content.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</div>
      <p className="helper-text" style={{ marginTop: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1.2rem" }}>{formatNumber(article.views)} vues · {formatNumber(article.voteCount)} votes · {formatNumber(article.commentCount)} commentaire{article.commentCount !== 1 ? "s" : ""}</p>
    </div>
    {article.status === "APPROVED"
      ? <Comments articleSlug={article.slug} />
      : <div className="panel"><p className="helper-text">Les commentaires de la communauté seront visibles ici une fois l’article publié.</p></div>}
  </>;
}
