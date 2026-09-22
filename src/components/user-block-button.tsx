"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserBlockButton({ userId, name, blocked }: { userId: string; name: string; blocked: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send(body: { action: "block"; reason: string } | { action: "unblock" }) {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/admin/users/${userId}/block`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const result = response ? await response.json().catch(() => ({})) : {};
    setLoading(false);
    if (!response?.ok) { setError(result.error ?? "Action impossible pour le moment."); return; }
    setOpen(false);
    setReason("");
    router.refresh();
  }

  if (blocked) {
    return <div className="block-control">
      <button type="button" className="button small outline" disabled={loading} onClick={() => { if (window.confirm(`Débloquer ${name} ? Cette personne pourra se reconnecter.`)) send({ action: "unblock" }); }}>{loading ? "Un instant…" : "Débloquer"}</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>;
  }

  if (!open) return <div className="block-control"><button type="button" className="button small danger" onClick={() => setOpen(true)}>Bloquer</button></div>;

  return <form className="block-control block-form" onSubmit={(event) => { event.preventDefault(); send({ action: "block", reason }); }}>
    <label htmlFor={`reason-${userId}`}>Motif du blocage de {name}</label>
    <textarea id={`reason-${userId}`} value={reason} onChange={(event) => setReason(event.target.value)} required minLength={5} maxLength={500} rows={3} placeholder="Ex. propos racistes dans plusieurs commentaires" />
    {error && <p className="form-error" role="alert">{error}</p>}
    <div><button className="button small danger" disabled={loading}>{loading ? "Un instant…" : "Confirmer le blocage"}</button><button type="button" className="button small outline" onClick={() => { setOpen(false); setError(""); }}>Annuler</button></div>
  </form>;
}
