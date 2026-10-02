import { ModerationCard } from "@/components/moderation-card";
import { RepublishCard, UnpublishCard } from "@/components/publish-toggle-card";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dashboard";

export default async function ModerationPage() {
  const [articles, published, unpublished] = await Promise.all([
    db.article.findMany({ where: { status: "PENDING_REVIEW", deletedAt: null }, include: { author: { include: { profile: true } }, category: true }, orderBy: { updatedAt: "asc" } }),
    db.article.findMany({ where: { status: "APPROVED", deletedAt: null }, include: { author: { include: { profile: true } }, category: true }, orderBy: { publishedAt: "desc" }, take: 30 }),
    db.article.findMany({ where: { status: "ARCHIVED", deletedAt: null }, include: { author: { include: { profile: true } }, category: true }, orderBy: { updatedAt: "desc" }, take: 30 }),
  ]);
  return <div className="container section">
    <div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Modération</h1></div><span className="status pending">{articles.length} à examiner</span></div>
    <div className="moderation-list">{articles.map((article) => <ModerationCard key={article.id} article={{ id: article.id, title: article.title, excerpt: article.excerpt, content: article.content, author: article.author.profile?.displayName ?? "Young Speaker", category: article.category.name, submittedAt: formatDate(article.updatedAt) }} />)}{!articles.length && <div className="empty-note">Tout est à jour. Merci de prendre soin de la communauté.</div>}</div>

    <div className="section-head compact theme-subhead"><div><span className="eyebrow">Publiés</span><h2>Articles en ligne</h2></div></div>
    <div className="moderation-list">{published.map((article) => <UnpublishCard key={article.id} article={{ id: article.id, title: article.title, author: article.author.profile?.displayName ?? "Young Speaker", category: article.category.name, date: formatDate(article.publishedAt ?? article.updatedAt) }} />)}{!published.length && <div className="empty-note">Aucun article publié pour le moment.</div>}</div>

    <div className="section-head compact theme-subhead"><div><span className="eyebrow">Retirés</span><h2>Articles dépubliés</h2></div></div>
    <div className="moderation-list">{unpublished.map((article) => <RepublishCard key={article.id} article={{ id: article.id, title: article.title, author: article.author.profile?.displayName ?? "Young Speaker", category: article.category.name, date: formatDate(article.updatedAt) }} />)}{!unpublished.length && <div className="empty-note">Aucun article retiré pour le moment.</div>}</div>
  </div>;
}
