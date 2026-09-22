"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }
  return <button className="sidebar-logout" onClick={logout} disabled={loading}><LogOut size={17} />{loading ? "Déconnexion…" : "Déconnexion"}</button>;
}
