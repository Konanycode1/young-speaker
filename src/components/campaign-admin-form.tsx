"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CampaignAdminForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/admin/campaigns", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "Impossible de créer la campagne."); setLoading(false); return; }
    form.reset(); setSuccess("Campagne enregistrée. Active-la ci-contre pour la mettre en ligne."); setLoading(false); router.refresh();
  }

  return <form className="panel admin-form" onSubmit={submit}>
    <div><span className="eyebrow">Nouvelle campagne</span><h2>Créer une sensibilisation</h2></div>
    <div className="field"><label>Nom</label><input name="name" required minLength={3} maxLength={80} placeholder="Octobre Rose" /></div>
    <div className="field"><label>Message du bandeau</label><textarea name="message" required minLength={10} maxLength={240} rows={3} placeholder="Ce mois-ci, parlons dépistage du cancer du sein. Chaque geste compte." /></div>
    <div className="form-columns">
      <div className="field"><label>Couleur</label><input name="color" type="color" defaultValue="#ec4899" required /></div>
      <div className="field"><label>Libellé du bouton <small>(facultatif)</small></label><input name="ctaLabel" maxLength={60} placeholder="En savoir plus" /></div>
    </div>
    <div className="field"><label>Lien du bouton <small>(facultatif)</small></label><input name="ctaUrl" maxLength={300} placeholder="/articles?category=Santé sexuelle et reproductive" /></div>
    <div className="field"><label>Thème spécial — sujet d’écriture <small>(facultatif)</small></label><textarea name="themePrompt" maxLength={500} rows={3} placeholder="Parle du dépistage, du soutien à une proche, ou de ce que l’on ne dit pas assez sur le cancer du sein." /><small className="helper-text">Affiché en plus du thème de la semaine habituel, pas à sa place. Laisse vide pour une campagne sans thème d’écriture dédié.</small></div>
    <div className="form-columns">
      <div className="field"><label>Début <small>(facultatif)</small></label><input name="startsAt" type="date" /></div>
      <div className="field"><label>Fin <small>(facultatif)</small></label><input name="endsAt" type="date" /></div>
    </div>
    {error && <p className="form-error">{error}</p>}
    {success && <p className="form-success">{success}</p>}
    <button className="button violet" disabled={loading}>{loading ? "Enregistrement…" : "Créer la campagne"}</button>
  </form>;
}
