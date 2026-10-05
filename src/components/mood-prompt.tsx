"use client";

import Link from "next/link";
import { useState } from "react";

const OPTIONS = [
  { id: "good", label: "Ça va bien", color: "#4caf87" },
  { id: "meh", label: "Bof", color: "#e8b84a" },
  { id: "tough", label: "Pas trop", color: "#f2839f" },
  { id: "talk", label: "J’ai besoin de parler", color: "#7a6fd0" },
] as const;

export function MoodPrompt() {
  const [choice, setChoice] = useState<(typeof OPTIONS)[number]["id"] | null>(null);

  return <div className="mood-prompt">
    <div className="mood-prompt-options" role="group" aria-label="Comment te sens-tu aujourd’hui ?">
      {OPTIONS.map((option) => <button key={option.id} type="button" aria-pressed={choice === option.id} className={`mood-prompt-option ${choice === option.id ? "selected" : ""}`} style={{ "--mood": option.color } as React.CSSProperties} onClick={() => setChoice(option.id)}>
        <span className="mood-prompt-dot" />{option.label}
      </button>)}
    </div>
    {choice && <div className="mood-prompt-card" role="status">
      <h2>Tu n’es pas seul·e.</h2>
      <p>Ce que tu ressens compte. Si ça pèse, parler à quelqu’un de confiance peut déjà aider.</p>
      <div className="mood-prompt-actions">
        <Link className="button small" href="/resources">Ressources d’écoute</Link>
        <Link className="button small outline" href="/safety">Charte &amp; modération</Link>
      </div>
    </div>}
  </div>;
}
