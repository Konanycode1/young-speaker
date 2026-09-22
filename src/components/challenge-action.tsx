"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function ChallengeAction({ id, status }: { id: string; status?: "JOINED" | "COMPLETED" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [experience, setExperience] = useState("");
  const [experiencePublic, setExperiencePublic] = useState(false);
  const [error, setError] = useState("");

  async function act(action: "join" | "complete") {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/challenges/${id}/participate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(action === "join" ? { action } : { action, experience, experiencePublic }),
    });
    const result = await response.json().catch(() => null);
    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!response.ok) {
      setError(result?.error ?? "Impossible d’enregistrer ta progression.");
      setLoading(false);
      return;
    }
    router.refresh();
    setLoading(false);
  }

  if (status === "COMPLETED") return <div className="challenge-completed"><span className="status">✓ Terminé</span><small>Les points et le badge ont été ajoutés à ton profil.</small></div>;
  if (status !== "JOINED") return <div className="challenge-action"><button className="button small violet" disabled={loading} onClick={() => act("join")}>{loading ? "Un instant…" : "Je participe"}</button>{error && <p className="form-error">{error}</p>}</div>;
  return <div className="challenge-action challenge-finish"><div className="challenge-progress-label"><b>Challenge en cours</b><span>50%</span></div><div className="progress"><span style={{ width: "50%" }}/></div><div className="field"><label htmlFor={`experience-${id}`}>Ce que tu as appris <small>(facultatif)</small></label><textarea id={`experience-${id}`} value={experience} onChange={(event) => setExperience(event.target.value)} maxLength={2000} rows={4} placeholder="Raconte ton expérience avec tes propres mots…" /></div><label className="challenge-privacy"><input type="checkbox" checked={experiencePublic} disabled={!experience.trim()} onChange={(event) => setExperiencePublic(event.target.checked)} /> Autoriser la publication de ce témoignage après modération</label>{error && <p className="form-error">{error}</p>}<button className="button small" disabled={loading} onClick={() => act("complete")}>{loading ? "Enregistrement…" : "Marquer comme terminé"}</button></div>;
}
