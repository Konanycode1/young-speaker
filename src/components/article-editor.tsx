"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ArticleEditor({ themeId, themeTitle }: { themeId?: string; themeTitle?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"draft" | "submit" | null>(null);
  const [error, setError] = useState("");

  async function save(formElement: HTMLFormElement, intent: "draft" | "submit") {
    setLoading(intent);
    setError("");
    const form = new FormData(formElement);
    const response = await fetch("/api/articles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(form.entries()), intent }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Impossible d’enregistrer l’article.");
      setLoading(null);
      return;
    }
    router.push("/dashboard/articles?created=1");
    router.refresh();
  }

  return <form className="panel article-editor" onSubmit={(event) => { event.preventDefault(); save(event.currentTarget, "draft"); }}>
    <div className="field"><label>Titre</label><input name="title" required minLength={10} maxLength={140} placeholder="Un titre clair qui donne envie de t’écouter" /></div>
    <div className="form-columns"><div className="field"><label>Catégorie</label><select name="category" required defaultValue=""><option value="" disabled>Choisir une catégorie</option><option>Santé mentale</option><option>Relations</option><option>Éducation</option><option>Société</option><option>Développement personnel</option><option>Autres</option></select></div><div className="field"><label>Thème de la semaine</label><select name="weeklyThemeId" defaultValue={themeId ?? ""}><option value="">Hors thème</option>{themeId && <option value={themeId}>{themeTitle}</option>}</select></div></div>
    <div className="field"><label>Extrait</label><textarea name="excerpt" required rows={3} minLength={20} maxLength={240} placeholder="Résume ton idée en quelques phrases…" /></div>
    <div className="field"><label>Ton texte</label><textarea name="content" required rows={14} minLength={100} maxLength={50000} placeholder="Ici, tu peux écrire librement. Prends ton temps…" /></div>
    <div className="sensitive">🛡️ Ne partage jamais ton adresse, ton numéro ou d’autres informations personnelles. Chaque texte est relu pour la sécurité de tous.</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="editor-actions"><button className="button outline" disabled={Boolean(loading)}>{loading === "draft" ? "Enregistrement…" : "Enregistrer le brouillon"}</button><button className="button violet" type="button" disabled={Boolean(loading)} onClick={(event) => event.currentTarget.form && save(event.currentTarget.form, "submit")}>{loading === "submit" ? "Envoi…" : "Soumettre à la modération"}</button></div>
  </form>;
}
