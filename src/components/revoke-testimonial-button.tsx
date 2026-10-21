"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RevokeTestimonialButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function revoke() {
    const confirmed = window.confirm("Dépublier ce témoignage ? Il redevient privé et disparaît de /challenges.");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    const response = await fetch(`/api/admin/challenges/participations/${id}/revoke`, { method: "POST" });
    const result = await response.json().catch(() => null);
    setLoading(false);
    if (!response.ok) { setError(result?.error ?? "La dépublication a échoué."); return; }
    router.refresh();
  }

  return <div>
    <button className="button outline small" onClick={revoke} disabled={loading}>{loading ? "Un instant…" : "Dépublier"}</button>
    {error && <p className="form-error" style={{ marginTop: ".5rem" }}>{error}</p>}
  </div>;
}
