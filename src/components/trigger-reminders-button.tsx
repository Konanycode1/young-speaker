"use client";

import { useState } from "react";

export function TriggerRemindersButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function trigger() {
    const confirmed = window.confirm("Ceci envoie immédiatement de vrais emails (annonces et rappels dus) aux utilisateurs concernés. Continuer ?");
    if (!confirmed) return;
    setLoading(true);
    setResult(null);
    const response = await fetch("/api/admin/cron/reminders", { method: "POST" });
    const body = await response.json().catch(() => null);
    setLoading(false);
    if (!response.ok) { setResult(body?.error ?? "Échec du déclenchement."); return; }
    setResult(`${body.data.announcements} annonce${body.data.announcements !== 1 ? "s" : ""}, ${body.data.reminders} rappel${body.data.reminders !== 1 ? "s" : ""} envoyé${body.data.reminders !== 1 ? "s" : ""}.`);
  }

  return <div>
    <button className="button small outline" onClick={trigger} disabled={loading}>{loading ? "Envoi en cours…" : "Déclencher les notifications maintenant"}</button>
    <p className="helper-text" style={{ marginTop: ".5rem" }}>Envoie immédiatement les annonces et rappels dus, sans attendre le prochain passage du cron. Déclenche de vrais emails.</p>
    {result && <p className="form-success" style={{ marginTop: ".5rem" }}>{result}</p>}
  </div>;
}
