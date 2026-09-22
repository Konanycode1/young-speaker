import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/dashboard";
import { canManageModerators } from "@/lib/permissions";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  const [users, speakers, published, pending, votes, comments, challenges, challengeParticipants, challengeCompletions, challengeReviews, reports, queue] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { role: "YOUNG_SPEAKER", deletedAt: null } }),
    db.article.count({ where: { status: "APPROVED", deletedAt: null } }),
    db.article.count({ where: { status: "PENDING_REVIEW", deletedAt: null } }),
    db.vote.count(),
    db.comment.count({ where: { deletedAt: null, isHidden: false } }),
    db.challenge.count({ where: { status: "ACTIVE" } }),
    db.challengeParticipation.count(),
    db.challengeParticipation.count({ where: { status: "COMPLETED" } }),
    db.challengeParticipation.count({ where: { experienceStatus: "PENDING_REVIEW" } }),
    db.report.count({ where: { status: { in: ["OPEN", "REVIEWING"] } } }),
    db.article.findMany({ where: { status: "PENDING_REVIEW", deletedAt: null }, include: { author: { include: { profile: true } }, category: true }, orderBy: { updatedAt: "asc" }, take: 5 }),
  ]);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const stats = [["Utilisateurs", users], ["Young Speakers", speakers], ["Articles publiés", published], ["À modérer", pending], ["Votes", votes], ["Signalements ouverts", reports], ["Commentaires", comments], ["Challenges actifs", challenges], ["Participations challenges", challengeParticipants], ["Challenges terminés", challengeCompletions], ["Témoignages à modérer", challengeReviews]] as const;

  return <div className="container section"><div className="dash-head"><div><span className="eyebrow">{isSuperAdmin ? "Super administration" : "Administration"}</span><h1>Vue d’ensemble</h1></div><div className="admin-actions"><Link className="button small outline" href="/admin/users">Utilisateurs</Link><Link className="button small outline" href="/admin/themes">Gérer les thèmes</Link>{canManageModerators(currentUser?.role) && <Link className="button small outline" href="/admin/moderators">Gérer les modérateurs</Link>}<Link className="button small outline" href="/admin/challenges">Témoignages ({challengeReviews})</Link><span className="status">● Plateforme opérationnelle</span></div></div><div className="stat-grid">{stats.map(([label, value]) => <div className="stat-card" key={label}><small>{label}</small><b>{formatNumber(value)}</b></div>)}</div><section className="panel"><div className="section-head compact"><div><span className="eyebrow">Priorité</span><h2>File de modération</h2></div><Link className="button small" href="/admin/moderation">Voir les {pending} texte{pending !== 1 ? "s" : ""}</Link></div>{queue.length ? <table className="simple-table"><thead><tr><th>Article</th><th>Auteur</th><th>Catégorie</th><th>Reçu</th><th></th></tr></thead><tbody>{queue.map((article) => <tr key={article.id}><td className="cell-title"><b>{article.title}</b></td><td data-label="Auteur">{article.author.profile?.displayName}</td><td data-label="Catégorie">{article.category.name}</td><td data-label="Reçu">{formatDate(article.updatedAt)}</td><td className="cell-action"><Link className="filter" href="/admin/moderation">Relire</Link></td></tr>)}</tbody></table> : <div className="empty-note">Aucun article en attente.</div>}</section></div>;
}
