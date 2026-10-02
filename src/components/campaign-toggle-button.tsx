"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CampaignToggleButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/campaigns/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    setLoading(false);
    router.refresh();
  }

  return <button className={`button small ${isActive ? "outline" : "violet"}`} disabled={loading} onClick={toggle}>
    {loading ? "Un instant…" : isActive ? "Désactiver" : "Activer"}
  </button>;
}
