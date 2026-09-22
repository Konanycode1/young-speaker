"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Review = { id: string; challenge: string; participant: string; experience: string; completedAt: string };

export function ChallengeModerationCard({ review }: { review: Review }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function moderate(action: "approve" | "reject") {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/admin/challenges/participations/${review.id}/moderate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setError(result?.error ?? "La modération a échoué."); setLoading(false); return; }
    router.refresh();
  }

  return <article className="moderation-card"><div className="moderation-summary"><span><b>{review.challenge}</b><small>{review.participant} · {review.completedAt}</small></span><span>Témoignage challenge</span></div><div className="moderation-content"><div className="moderation-text">{review.experience}</div><div className="field"><label>Motif du refus</label><textarea rows={2} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Obligatoire uniquement en cas de refus" /></div>{error && <p className="form-error">{error}</p>}<div className="moderation-actions"><button className="button outline small" disabled={loading || reason.trim().length < 5} onClick={() => moderate("reject")}>Refuser</button><button className="button small violet" disabled={loading} onClick={() => moderate("approve")}>Approuver</button></div></div></article>;
}
