import { redirect } from "next/navigation";
import { ModeratorAdminForm } from "@/components/moderator-admin-form";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dashboard";

export default async function ModeratorsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/admin");
  const moderators = await db.user.findMany({ where: { role: "MODERATOR", deletedAt: null }, include: { profile: true }, orderBy: { createdAt: "desc" } });
  return <div className="container section"><div className="dash-head"><div><span className="eyebrow">Super administration</span><h1>Gestion des modérateurs</h1></div><span className="status">{moderators.length} modérateur{moderators.length !== 1 ? "s" : ""}</span></div><div className="admin-split"><ModeratorAdminForm/><section className="panel"><h2>Équipe de modération</h2><div className="admin-list">{moderators.map((moderator) => <article key={moderator.id}><div><h3>{moderator.profile?.displayName ?? "Modérateur"}</h3><p>{moderator.email} · @{moderator.profile?.username} · ajouté le {formatDate(moderator.createdAt)}</p></div><span className="status">Actif</span></article>)}{!moderators.length && <div className="empty-note">Aucun modérateur ajouté pour le moment.</div>}</div></section></div></div>;
}
