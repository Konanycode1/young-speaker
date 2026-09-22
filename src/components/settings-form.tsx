"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SettingsForm({ email }: { email: string }) {
  const router = useRouter(); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); const response = await fetch("/api/settings/password", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) }); const result = await response.json(); if (!response.ok) setError(result.error); else { setMessage("Mot de passe modifié. Reconnecte-toi avec ton nouveau mot de passe."); setTimeout(() => { router.replace("/login"); router.refresh(); }, 1200); } }
  return <><section className="panel"><h2>Compte</h2><div className="field"><label>Adresse email</label><input value={email} disabled /></div><p className="helper-text">L’adresse email ne peut pas encore être modifiée depuis le dashboard.</p></section><form className="panel" onSubmit={submit}><h2>Changer mon mot de passe</h2><div className="field"><label>Mot de passe actuel</label><input name="currentPassword" type="password" required minLength={8} /></div><div className="field"><label>Nouveau mot de passe</label><input name="newPassword" type="password" required minLength={8} maxLength={72} /></div>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button className="button">Mettre à jour</button></form></>;
}
