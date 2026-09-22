"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode, defaultType = "COMMENTER" }: { mode: "login" | "register"; defaultType?: "COMMENTER" | "SPEAKER" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const result = response ? await response.json() : { error: "Le serveur est indisponible." };
    if (!response?.ok) {
      setError(result.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }
    window.dispatchEvent(new Event("auth-changed"));
    const requestedPage = new URLSearchParams(window.location.search).get("next");
    const defaultDestination = result.data.role === "SUPER_ADMIN" || result.data.role === "ADMIN" || result.data.role === "MODERATOR" ? "/admin" : result.data.role === "YOUNG_SPEAKER" ? "/dashboard" : "/account";
    const destination = requestedPage ?? defaultDestination;
    router.push(destination);
    router.refresh();
  }

  return <form onSubmit={submit}>
    {mode === "register" && <div className="field"><label>Je souhaite</label><select name="accountType" defaultValue={defaultType}><option value="COMMENTER">Lire, voter et commenter</option><option value="SPEAKER">Devenir Young Speaker et publier</option></select></div>}
    <div className="field"><label>Email</label><input name="email" type="email" required placeholder="toi@exemple.com" autoComplete="email" /></div>
    {mode === "register" && <div className="field"><label>Pseudonyme public</label><input name="username" required minLength={3} maxLength={30} pattern="[A-Za-zÀ-ÿ0-9._-]+" placeholder="Comment veux-tu être appelé·e ?" /></div>}
    <div className="field"><label>Mot de passe</label><input name="password" type="password" required minLength={8} maxLength={72} placeholder="8 caractères minimum" autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>
    {mode === "register" && <label className="consent" style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--muted)", margin: "1rem 0" }}><input type="checkbox" required /><span>J’accepte la <Link href="/safety" target="_blank">charte de la communauté</Link> (respect, pas d’insultes ni de propos racistes, espace apolitique), les <Link href="/terms" target="_blank">conditions d’utilisation</Link> et la <Link href="/privacy" target="_blank">politique de confidentialité</Link>.</span></label>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button" disabled={loading}>{loading ? "Un instant…" : mode === "login" ? "Me connecter" : "Créer mon compte"}</button>
  </form>;
}
