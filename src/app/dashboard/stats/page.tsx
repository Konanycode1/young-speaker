import { db } from "@/lib/db";
import { formatNumber, requireSpeaker } from "@/lib/dashboard";

export default async function StatsPage() {
  const user = await requireSpeaker();
  const articles = await db.article.findMany({ where: { authorId: user.id, deletedAt: null }, orderBy: { views: "desc" } });
  const views = articles.reduce((sum, article) => sum + article.views, 0); const votes = articles.reduce((sum, article) => sum + article.voteCount, 0); const comments = articles.reduce((sum, article) => sum + article.commentCount, 0);
  return <><div className="dash-head"><div><span className="eyebrow">Mon impact</span><h1>Mes statistiques</h1></div></div><div className="stat-grid">{[["Articles", articles.length], ["Vues", views], ["Votes", votes], ["Commentaires", comments]].map(([label, value]) => <div className="stat-card" key={label}><small>{label}</small><b>{formatNumber(Number(value))}</b></div>)}</div><section className="panel"><h2>Performance par article</h2>{articles.length ? articles.map((article) => <div className="metric-row" key={article.id}><div><b>{article.title}</b><small>{formatNumber(article.views)} vues · {formatNumber(article.voteCount)} votes</small></div><div className="metric-bar"><span style={{ width: `${Math.max(4, views ? article.views / Math.max(...articles.map((item) => item.views), 1) * 100 : 4)}%` }} /></div></div>) : <div className="empty-note">Tes statistiques apparaîtront après la publication de ton premier article.</div>}</section></>;
}
