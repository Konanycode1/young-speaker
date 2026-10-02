"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AutoPublishToggle({ initialValue }: { initialValue: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    const next = !value;
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ autoPublishArticles: next }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Impossible de mettre à jour ce réglage.");
      setLoading(false);
      return;
    }
    setValue(next);
    setLoading(false);
    router.refresh();
  }

  return <div className="panel">
    <h2>Publication automatique des articles</h2>
    <p className="helper-text">Quand ce réglage est actif, les articles soumis par les Young Speakers sont publiés immédiatement, sans passer par la file de modération. Tu peux le désactiver temporairement pour revenir à une relecture manuelle de chaque texte.</p>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
      <div><b>{value ? "Activée" : "Désactivée"}</b><br /><small className="helper-text">{value ? "Les nouveaux articles sont publiés sans relecture." : "Les nouveaux articles passent par la file de modération."}</small></div>
      <button className={`button small ${value ? "outline" : "violet"}`} disabled={loading} onClick={toggle}>{loading ? "Un instant…" : value ? "Désactiver" : "Activer"}</button>
    </div>
    {error && <p className="form-error">{error}</p>}
  </div>;
}
