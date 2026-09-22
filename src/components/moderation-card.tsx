"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ModerationArticle = { id: string; title: string; excerpt: string; content: string; author: string; category: string; submittedAt: string };
export function ModerationCard({ article }: { article: ModerationArticle }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [reason, setReason] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function moderate(action: "approve" | "reject") { setLoading(true); setError(""); const response = await fetch(`/api/admin/articles/${article.id}/moderate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, reason }) }); const result = await response.json(); if (!response.ok) { setError(result.error); setLoading(false); return; } router.refresh(); }
  return <article className="moderation-card"><button className="moderation-summary" onClick={() => setOpen(!open)}><span><b>{article.title}</b><small>{article.author} · {article.category} · {article.submittedAt}</small></span><span>{open ? "Réduire ↑" : "Relire →"}</span></button>{open && <div className="moderation-content"><p className="moderation-excerpt">{article.excerpt}</p><div className="moderation-text">{article.content.split(/\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="field"><label>Motif ou retour à l’auteur</label><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Obligatoire en cas de rejet…" /></div>{error && <p className="form-error">{error}</p>}<div className="moderation-actions"><button className="button outline" disabled={loading} onClick={() => moderate("reject")}>Rejeter avec motif</button><button className="button" disabled={loading} onClick={() => moderate("approve")}>Approuver et publier</button></div></div>}</article>;
}
