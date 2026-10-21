"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApproveAllTestimonialsButton({ count }: { count: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function approveAll() {
    const confirmed = window.confirm(`Publier les ${count} témoignage${count !== 1 ? "s" : ""} en attente ? Ils deviendront visibles de tous sur /challenges.`);
    if (!confirmed) return;
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/challenges/participations/approve-all", { method: "POST" });
    const result = await response.json().catch(() => null);
    setLoading(false);
    if (!response.ok) { setError(result?.error ?? "La publication a échoué."); return; }
    router.refresh();
  }

  return <div>
    <button className="button small violet" onClick={approveAll} disabled={loading}>{loading ? "Publication en cours…" : `Tout publier (${count})`}</button>
    {error && <p className="form-error" style={{ marginTop: ".5rem" }}>{error}</p>}
  </div>;
}
