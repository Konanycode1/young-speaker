"use client";

import Link from "next/link";
import { ArrowLeft, FileCheck2, HeartPulse, LayoutDashboard, MessageSquareQuote, Ribbon, Settings, ShieldCheck, Sparkles, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { canManageModerators, canManageSettings } from "@/lib/permissions";

type StaffRole = "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

export function AdminNavigation({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const links = [
    [LayoutDashboard, "/admin", "Vue d’ensemble", true],
    [FileCheck2, "/admin/moderation", "Articles", true],
    [MessageSquareQuote, "/admin/challenges", "Challenges", true],
    [Users, "/admin/users", "Utilisateurs", true],
    [HeartPulse, "/admin/mood-checkins", "Bien-être", true],
    [Sparkles, "/admin/themes", "Thèmes", true],
    [Ribbon, "/admin/campaigns", "Campagnes", canManageSettings(role)],
    [ShieldCheck, "/admin/moderators", "Modérateurs", canManageModerators(role)],
    [Settings, "/admin/settings", "Paramètres", canManageSettings(role)],
  ] as const;

  return <div className="admin-nav-wrap"><nav className="admin-nav" aria-label="Navigation administration"><Link className="admin-back" href="/admin"><ArrowLeft size={16}/> Retour au tableau de bord</Link><div>{links.filter(([, , , visible]) => visible).map(([Icon, href, label]) => <Link key={href} href={href} className={pathname === href ? "active" : ""}><Icon size={16}/>{label}</Link>)}</div></nav></div>;
}
