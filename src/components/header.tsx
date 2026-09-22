"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, Moon, Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./logo";

export type SessionUser = { role: "VISITOR" | "YOUNG_SPEAKER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN"; profile: { displayName: string; username: string } | null };
const links = [["/articles", "Explorer"], ["/themes", "Thèmes"], ["/challenges", "Challenges"], ["/speakers", "Speakers"]];

export function Header({ initialUser = null }: { initialUser?: SessionUser | null }) {
  const router = useRouter();
  const pathname = usePathname();
  // Le menu est ouvert « pour une page » : il se referme tout seul quand la page change.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (value: boolean) => setOpenedAt(value ? pathname : null);
  const [user, setUser] = useState<SessionUser | null>(initialUser);

  useEffect(() => {
    const loadUser = () => fetch("/api/auth/me").then((response) => response.json()).then((result) => setUser(result.data)).catch(() => setUser(null));
    loadUser();
    window.addEventListener("auth-changed", loadUser);
    return () => window.removeEventListener("auth-changed", loadUser);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent | PointerEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !(event.target as Element).closest(".nav-links, .menu-button")) setOpenedAt(null);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", close); };
  }, [open]);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("theme", next ? "dark" : "light");
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null); setOpen(false); router.replace("/"); router.refresh();
  }
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" || user?.role === "MODERATOR";
  const workspace = isStaff ? "/admin" : user?.role === "YOUNG_SPEAKER" ? "/dashboard" : "/account";
  const workspaceLabel = isStaff ? "Administration" : user?.role === "YOUNG_SPEAKER" ? "Mon dashboard" : "Mon espace";

  return <header className="site-header"><div className="nav-wrap"><Logo /><nav className={open ? "nav-links open" : "nav-links"} aria-label="Navigation principale">{links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}{user ? <><Link className="mobile-only" href={workspace} onClick={() => setOpen(false)}>{workspaceLabel}</Link><button className="mobile-auth-action" onClick={logout}>Se déconnecter</button></> : <Link className="mobile-only" href="/login" onClick={() => setOpen(false)}>Se connecter</Link>}</nav><div className="nav-actions"><Link className="icon-button" href="/search" aria-label="Rechercher"><Search size={19} /></Link><button className="icon-button" onClick={toggleTheme} aria-label="Changer le thème"><Moon size={18} /></button>{user ? <><Link className="session-pill desktop-only" href={workspace}>{isStaff ? <ShieldCheck size={17} /> : <LayoutDashboard size={17} />}<span><small>{workspaceLabel}</small><b>{user.profile?.displayName ?? "Mon compte"}</b></span></Link><button className="icon-button desktop-only" onClick={logout} aria-label="Se déconnecter"><LogOut size={18} /></button></> : <><Link className="text-link desktop-only" href="/login">Connexion</Link><Link className="button small desktop-only" href="/become-speaker">Prendre la parole <span>→</span></Link></>}<button className="icon-button menu-button" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button></div></div></header>;
}
