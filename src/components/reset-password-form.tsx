"use client";

import Link from "next/link";
import { useState } from "react";

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const result = response ? await response.json().catch(() => null) : null;
    if (!response?.ok) {
      setError(result?.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  }

  if (done) return <div>
    <p className="form-success">Ton mot de passe a été mis à jour. Tu peux te connecter avec ton nouveau mot de passe.</p>
    <Link className="button" href="/login">Aller à la connexion</Link>
  </div>;

  return <form onSubmit={submit}>
    <div className="field"><label>Email</label><input name="email" type="email" required placeholder="toi@exemple.com" autoComplete="email" /></div>
    <div className="field"><label>Pseudonyme</label><input name="username" required minLength={3} maxLength={30} placeholder="Ton pseudonyme sur Young Speaker" autoComplete="username" /></div>
    <div className="field"><label>Nouveau mot de passe</label><input name="newPassword" type="password" required minLength={8} maxLength={72} placeholder="8 caractères minimum" autoComplete="new-password" /></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button" disabled={loading}>{loading ? "Un instant…" : "Réinitialiser mon mot de passe"}</button>
  </form>;
}
