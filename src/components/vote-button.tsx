"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";

export function VoteButton({ initial, articleId }: { initial: number; articleId: string }) {
  const [voted, setVoted] = useState(false); const [count, setCount] = useState(initial);
  async function vote() {
    if (voted) return;
    const response = await fetch(`/api/articles/${articleId}/vote`, { method: "POST" });
    const result = await response.json().catch(() => null);
    if (response.ok) { setVoted(true); setCount(result.data.count); }
    else if (response.status === 409) setVoted(true);
  }
  return <button className={voted ? "vote-button voted" : "vote-button"} onClick={vote}><ArrowUp size={20}/><span>{voted ? "Merci !" : "Cette voix compte"}</span><b>{count}</b></button>;
}
