"use client";

import type { Mood } from "@prisma/client";
import { Annoyed, Frown, Laugh, LifeBuoy, Meh, Smile } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CONCERNING_MOODS, INFLUENCE_TAGS, MOOD_COLORS, MOOD_LABELS, MOOD_ORDER } from "@/lib/mood";

const MOOD_ICONS: Record<Mood, typeof Smile> = { VERY_GOOD: Laugh, GOOD: Smile, NEUTRAL: Meh, BAD: Frown, VERY_BAD: Annoyed };

export function MoodCheckInForm() {
  const [mood, setMood] = useState<Mood | null>(null);
  const [influences, setInfluences] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Mood | null>(null);

  function toggleInfluence(tag: string) {
    setInfluences((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
  }

  async function submit() {
    if (!mood) return;
    setLoading(true);
    setError("");
    const response = await fetch("/api/mood-checkins", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mood, influences, note }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Impossible d’enregistrer ton point du jour.");
      setLoading(false);
      return;
    }
    setDone(mood);
    setLoading(false);
  }

  if (done) {
    const concerning = CONCERNING_MOODS.includes(done);
    return <div className="panel mood-done">
      <p className="form-success">Merci d’avoir pris ce moment pour toi. C’est noté.</p>
      {concerning && <div className="mood-resources">
        <LifeBuoy size={22} />
        <div>
          <b>Tu n’es pas seul·e.</b>
          <p>Si tu traverses un moment difficile, en parler peut vraiment aider — à une personne de confiance, ou via des ressources d’écoute adaptées.</p>
          <Link className="button small violet" href="/resources">Voir les ressources d’écoute</Link>
        </div>
      </div>}
      <button className="text-link" onClick={() => { setDone(null); setMood(null); setInfluences([]); setNote(""); }}>Refaire un point</button>
    </div>;
  }

  return <div className="panel">
    <h2>Comment te sens-tu aujourd’hui ?</h2>
    <div className="mood-scale">
      {MOOD_ORDER.map((value) => {
        const Icon = MOOD_ICONS[value];
        const active = mood === value;
        return <button type="button" key={value} className={`mood-option ${active ? "active" : ""}`} style={{ "--mood-color": MOOD_COLORS[value] } as React.CSSProperties} onClick={() => setMood(value)} aria-pressed={active}>
          <Icon size={28} />
          <span>{MOOD_LABELS[value]}</span>
        </button>;
      })}
    </div>

    {mood && <>
      <div className="field"><label>Qu’est-ce qui influence ton humeur aujourd’hui ? <small>(facultatif)</small></label>
        <div className="mood-tags">{INFLUENCE_TAGS.map((tag) => <button type="button" key={tag} className={`filter ${influences.includes(tag) ? "active" : ""}`} onClick={() => toggleInfluence(tag)}>{tag}</button>)}</div>
      </div>
      <div className="field"><label>Tu veux ajouter quelque chose ? <small>(facultatif)</small></label><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} rows={3} placeholder="Écris ce que tu ressens, avec tes mots…" /></div>
      <p className="helper-text">Ceci n’est pas un outil de diagnostic médical. C’est un espace pour réfléchir à ton état et t’exprimer — tes réponses restent privées.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button violet" disabled={loading} onClick={submit}>{loading ? "Enregistrement…" : "Valider mon point du jour"}</button>
    </>}
  </div>;
}
