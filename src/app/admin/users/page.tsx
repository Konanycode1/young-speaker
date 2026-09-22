import type { Metadata } from "next";
import type { Prisma, Role } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserBlockButton } from "@/components/user-block-button";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatNumber } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { canBlock, isStaff, roleLabels } from "@/lib/permissions";

export const metadata: Metadata = { title: "Utilisateurs" };

const PAGE_SIZE = 20;
const roles = Object.keys(roleLabels) as Role[];

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; status?: string; page?: string }> }) {
  const actor = await getCurrentUser();
  if (!actor || !isStaff(actor.role)) redirect("/admin");
  const { q = "", role = "", status = "", page: pageParam = "1" } = await searchParams;
  const search = q.trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(roles.includes(role as Role) ? { role: role as Role } : {}),
    ...(status === "blocked" ? { blockedAt: { not: null } } : status === "active" ? { blockedAt: null } : {}),
    ...(search ? { OR: [
      { email: { contains: search, mode: "insensitive" } },
      { profile: { is: { username: { contains: search, mode: "insensitive" } } } },
      { profile: { is: { displayName: { contains: search, mode: "insensitive" } } } },
    ] } : {}),
  };
  const [total, blockedTotal, users] = await Promise.all([
    db.user.count({ where }),
    db.user.count({ where: { deletedAt: null, blockedAt: { not: null } } }),
    db.user.findMany({ where, include: { profile: true, _count: { select: { articles: true, comments: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (target: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `/admin/users?${query}` : "/admin/users";
  };

  return <div className="container section">
    <div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Utilisateurs</h1></div><span className={blockedTotal ? "status pending" : "status"}>{formatNumber(blockedTotal)} compte{blockedTotal !== 1 ? "s" : ""} bloqué{blockedTotal !== 1 ? "s" : ""}</span></div>
    <form className="user-filters" method="get" role="search">
      <input type="search" name="q" defaultValue={search} placeholder="Rechercher un nom, un pseudo ou un email" aria-label="Rechercher un utilisateur" />
      <select name="role" defaultValue={role} aria-label="Filtrer par rôle"><option value="">Tous les rôles</option>{roles.map((value) => <option key={value} value={value}>{roleLabels[value]}</option>)}</select>
      <select name="status" defaultValue={status} aria-label="Filtrer par statut"><option value="">Tous les statuts</option><option value="active">Actifs</option><option value="blocked">Bloqués</option></select>
      <button className="button small">Filtrer</button>
    </form>
    <div className="panel">
      {users.length ? <table className="simple-table"><thead><tr><th>Utilisateur</th><th>Rôle</th><th>Inscrit le</th><th>Contenus</th><th>Statut</th><th>Action</th></tr></thead><tbody>{users.map((user) => {
        const name = user.profile?.displayName ?? user.email;
        return <tr key={user.id}>
          <td className="cell-title"><b>{name}</b><small className="user-meta">{user.profile ? `@${user.profile.username} · ` : ""}{user.email}</small>{user.blockedAt && <small className="rejection">Bloqué le {formatDate(user.blockedAt)}{user.blockedReason ? ` : ${user.blockedReason}` : ""}</small>}</td>
          <td data-label="Rôle">{roleLabels[user.role]}</td>
          <td data-label="Inscrit le">{formatDate(user.createdAt)}</td>
          <td data-label="Contenus">{formatNumber(user._count.articles)} article{user._count.articles !== 1 ? "s" : ""} · {formatNumber(user._count.comments)} commentaire{user._count.comments !== 1 ? "s" : ""}</td>
          <td data-label="Statut"><span className={user.blockedAt ? "status status-blocked" : "status"}>{user.blockedAt ? "Bloqué" : "Actif"}</span></td>
          <td className="cell-action">{user.id === actor.id ? <small className="share-note">Ton compte</small> : canBlock(actor.role, user.role) ? <UserBlockButton userId={user.id} name={name} blocked={Boolean(user.blockedAt)} /> : <small className="share-note">Non modifiable</small>}</td>
        </tr>;
      })}</tbody></table> : <div className="empty-note">Aucun utilisateur ne correspond à cette recherche.</div>}
    </div>
    {pages > 1 && <nav className="pagination" aria-label="Pagination">{page > 1 ? <Link className="button small outline" href={link(page - 1)}>← Précédent</Link> : <span />}<span>Page {page} sur {pages} · {formatNumber(total)} résultats</span>{page < pages ? <Link className="button small outline" href={link(page + 1)}>Suivant →</Link> : <span />}</nav>}
  </div>;
}
