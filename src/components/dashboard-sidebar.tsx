"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Award, BarChart3, FilePlus2, FileText, LayoutDashboard, Settings, Target, UserRound } from "lucide-react";
import { LogoutButton } from "./logout-button";

export function DashboardSidebar({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  // Sur mobile la barre est défilante : garde l'onglet actif visible.
  useEffect(() => { document.querySelector(".sidebar a.active")?.scrollIntoView({ inline: "center", block: "nearest" }); }, [pathname]);
  const links = [[LayoutDashboard, "/dashboard", "Vue d’ensemble"], [FileText, "/dashboard/articles", "Mes articles"], [FilePlus2, "/dashboard/new-article", "Nouvel article"], [BarChart3, "/dashboard/stats", "Mes statistiques"], [Target, "/dashboard/challenges", "Mes challenges"], [Award, "/dashboard/badges", "Mes badges"], [UserRound, "/dashboard/profile", "Mon profil"], [Settings, "/dashboard/settings", "Paramètres"]] as const;
  return <aside className="sidebar"><div className="sidebar-user"><small>Connecté·e comme</small><b>{displayName}</b></div><h4>Mon espace</h4>{links.map(([Icon, url, label]) => <Link className={pathname === url ? "active" : ""} key={url} href={url}><Icon size={17} />{label}</Link>)}<h4 style={{ marginTop: "2rem" }}>Compte</h4><LogoutButton /></aside>;
}
