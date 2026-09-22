import { ModerationCard } from "@/components/moderation-card";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dashboard";

export default async function ModerationPage() {
  const articles = await db.article.findMany({ where: { status: "PENDING_REVIEW", deletedAt: null }, include: { author: { include: { profile: true } }, category: true }, orderBy: { updatedAt: "asc" } });
  return <div className="container section"><div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Modération</h1></div><span className="status pending">{articles.length} à examiner</span></div><div className="moderation-list">{articles.map((article) => <ModerationCard key={article.id} article={{ id: article.id, title: article.title, excerpt: article.excerpt, content: article.content, author: article.author.profile?.displayName ?? "Young Speaker", category: article.category.name, submittedAt: formatDate(article.updatedAt) }} />)}{!articles.length && <div className="empty-note">Tout est à jour. Merci de prendre soin de la communauté.</div>}</div></div>;
}
