"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ThemeAdminForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    const form = event.currentTarget;
    const response = await fetch("/api/admin/themes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "Impossible de créer le thème."); setLoading(false); return; }
    form.reset(); setSuccess("Le thème a été programmé."); setLoading(false); router.refresh();
  }

  return <form className="panel admin-form" onSubmit={submit}><div><span className="eyebrow">Nouveau thème</span><h2>Programmer une semaine</h2></div><div className="field"><label>Titre</label><input name="title" required minLength={10} maxLength={180} placeholder="La question proposée à la communauté" /></div><div className="field"><label>Description</label><textarea name="description" required minLength={20} maxLength={2000} rows={4} placeholder="Présente le sujet avec des mots simples et bienveillants." /></div><div className="form-columns"><div className="field"><label>Date de début</label><input name="startsAt" type="datetime-local" required /></div><div className="field"><label>Date de fin</label><input name="endsAt" type="datetime-local" required /></div></div>{error && <p className="form-error">{error}</p>}{success && <p className="form-success">{success}</p>}<button className="button violet" disabled={loading}>{loading ? "Programmation…" : "Programmer le thème"}</button></form>;
}
