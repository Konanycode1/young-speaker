"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ModeratorAdminForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    const form = event.currentTarget;
    const response = await fetch("/api/admin/moderators", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "Impossible de créer le modérateur."); setLoading(false); return; }
    form.reset(); setSuccess("Le compte modérateur est prêt."); setLoading(false); router.refresh();
  }

  return <form className="panel admin-form" onSubmit={submit}><div><span className="eyebrow">Nouveau membre de l’équipe</span><h2>Ajouter un modérateur</h2></div><div className="form-columns"><div className="field"><label>Nom affiché</label><input name="displayName" required minLength={2} maxLength={80} placeholder="Awa — Modération" /></div><div className="field"><label>Pseudonyme</label><input name="username" required minLength={3} maxLength={30} pattern="[A-Za-zÀ-ÿ0-9._-]+" placeholder="awa.moderation" /></div></div><div className="field"><label>Email professionnel</label><input name="email" type="email" required autoComplete="off" placeholder="moderation@youngspeaker.com" /></div><div className="field"><label>Mot de passe temporaire</label><input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" /></div>{error && <p className="form-error">{error}</p>}{success && <p className="form-success">{success}</p>}<button className="button violet" disabled={loading}>{loading ? "Création…" : "Créer le modérateur"}</button></form>;
}
