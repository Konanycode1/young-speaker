"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ChallengeAdminForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/admin/challenges", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "Impossible de créer le challenge."); setLoading(false); return; }
    form.reset(); setSuccess("Le challenge a été enregistré."); setLoading(false); router.refresh();
  }

  return <form className="panel admin-form" onSubmit={submit}><div><span className="eyebrow">Nouveau challenge</span><h2>Créer un défi</h2></div><div className="field"><label>Titre</label><input name="title" required minLength={5} maxLength={140} placeholder="3 jours pour mieux écouter" /></div><div className="field"><label>Description</label><textarea name="description" required minLength={20} maxLength={1000} rows={3} placeholder="Présente le défi en quelques mots." /></div><div className="field"><label>Objectif</label><input name="objective" required minLength={10} maxLength={240} placeholder="Ce que le participant va apprendre ou accomplir" /></div><div className="field"><label>Instructions</label><textarea name="instructions" required minLength={10} maxLength={3000} rows={4} placeholder="Une étape par ligne" /></div><div className="form-columns"><div className="field"><label>Difficulté</label><select name="difficulty" defaultValue="Facile"><option>Facile</option><option>Intermédiaire</option><option>Avancé</option></select></div><div className="field"><label>Points</label><input name="points" type="number" min={0} max={1000} defaultValue={50} required /></div></div><div className="field"><label>Récompense</label><input name="reward" maxLength={120} placeholder="Ex. Badge Challenge Master" /></div><div className="form-columns"><div className="field"><label>Date de début</label><input name="startsAt" type="datetime-local" required /></div><div className="field"><label>Date de fin</label><input name="endsAt" type="datetime-local" required /></div></div><div className="field"><label>Publication</label><select name="status" defaultValue="ACTIVE"><option value="ACTIVE">Publier selon les dates</option><option value="DRAFT">Enregistrer en brouillon</option></select></div>{error && <p className="form-error">{error}</p>}{success && <p className="form-success">{success}</p>}<button className="button violet" disabled={loading}>{loading ? "Enregistrement…" : "Créer le challenge"}</button></form>;
}
