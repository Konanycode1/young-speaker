"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PublishedArticle = { id: string; title: string; author: string; category: string; date: string };

export function UnpublishCard({ article }: { article: PublishedArticle }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function unpublish() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/admin/articles/${article.id}/moderate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "unpublish", reason }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); setLoading(false); return; }
    router.refresh();
  }

  return <article className="moderation-card">
    <button className="moderation-summary" onClick={() => setOpen(!open)}><span><b>{article.title}</b><small>{article.author} · {article.category} · {article.date}</small></span><span>{open ? "Réduire ↑" : "Dépublier →"}</span></button>
    {open && <div className="moderation-content">
      <div className="field"><label>Motif du retrait</label><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Explique pourquoi cet article est retiré (obligatoire)…" /></div>
      {error && <p className="form-error">{error}</p>}
      <div className="moderation-actions"><button className="button outline" disabled={loading || reason.trim().length < 5} onClick={unpublish}>{loading ? "Un instant…" : "Confirmer le retrait"}</button></div>
    </div>}
  </article>;
}

export function RepublishCard({ article }: { article: PublishedArticle }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function republish() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/admin/articles/${article.id}/moderate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "republish" }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); setLoading(false); return; }
    router.refresh();
  }

  return <article className="moderation-card">
    <div className="moderation-summary"><span><b>{article.title}</b><small>{article.author} · {article.category} · {article.date}</small></span><button className="button small" disabled={loading} onClick={republish}>{loading ? "Un instant…" : "Republier"}</button></div>
    {error && <p className="form-error" style={{ margin: "0 1.25rem 1rem" }}>{error}</p>}
  </article>;
}
