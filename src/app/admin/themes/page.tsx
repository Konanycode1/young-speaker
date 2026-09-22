import { redirect } from "next/navigation";
import { ThemeAdminForm } from "@/components/theme-admin-form";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dashboard";
import { isStaff } from "@/lib/permissions";

export default async function AdminThemesPage() {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) redirect("/admin");
  const now = new Date();
  const themes = await db.weeklyTheme.findMany({ include: { _count: { select: { articles: true } } }, orderBy: { startsAt: "desc" } });
  return <div className="container section"><div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Thèmes de la semaine</h1></div><span className="status">{themes.length} thème{themes.length !== 1 ? "s" : ""}</span></div><div className="admin-split"><ThemeAdminForm/><section className="panel"><h2>Programmation</h2><div className="admin-list">{themes.map((theme) => { const status = theme.startsAt > now ? "À venir" : theme.endsAt < now ? "Terminé" : "En cours"; return <article key={theme.id}><div><span className={`status ${status === "En cours" ? "" : "pending"}`}>{status}</span><h3>{theme.title}</h3><p>{formatDate(theme.startsAt)} → {formatDate(theme.endsAt)} · {theme._count.articles} contribution{theme._count.articles !== 1 ? "s" : ""}</p></div></article>; })}{!themes.length && <div className="empty-note">Aucun thème programmé.</div>}</div></section></div></div>;
}
