import { db } from "@/lib/db";
import { requireSpeaker } from "@/lib/dashboard";

export default async function BadgesPage() {
  const user = await requireSpeaker();
  const badges = await db.badge.findMany({ where: { isActive: true }, include: { users: { where: { userId: user.id } } }, orderBy: { createdAt: "asc" } });
  return <><div className="dash-head"><div><span className="eyebrow">Ma progression</span><h1>Mes badges</h1></div><span className="status">{badges.filter((badge) => badge.users.length).length} débloqué{badges.filter((badge) => badge.users.length).length !== 1 ? "s" : ""}</span></div><div className="badge-grid">{badges.map((badge) => { const earned = badge.users.length > 0; return <article className={`badge-card ${earned ? "earned" : "locked"}`} key={badge.id}><span>{earned ? badge.icon : "🔒"}</span><h2>{badge.name}</h2><p>{badge.description}</p><small>{earned ? "Débloqué" : "À découvrir"}</small></article>; })}{!badges.length && <div className="empty-note">Les badges seront bientôt disponibles.</div>}</div></>;
}
