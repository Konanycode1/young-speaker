"use client";

import { HeartHandshake } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function ReactionButton({ participationId, initialCount, initialReacted }: { participationId: string; initialCount: number; initialReacted: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [count, setCount] = useState(initialCount);
  const [reacted, setReacted] = useState(initialReacted);
  const [loading, setLoading] = useState(false);

  async function react() {
    if (loading) return;
    setLoading(true);
    const response = await fetch(`/api/challenge-participations/${participationId}/react`, { method: "POST" });
    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const result = await response.json().catch(() => null);
    if (response.ok && result) {
      setCount(result.data.count);
      setReacted(result.data.reacted);
    }
    setLoading(false);
  }

  return <button type="button" className={`reaction-button ${reacted ? "active" : ""}`} disabled={loading} onClick={react}>
    <HeartHandshake size={15} /> {count > 0 ? count : ""} Je te soutiens
  </button>;
}
