"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Comment = { id: string; content: string; author: string; createdAt: string };

export function Comments({ articleSlug }: { articleSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/articles/${articleSlug}/comments`).then((response) => response.json()),
      fetch("/api/auth/me").then((response) => response.json()),
    ]).then(([commentResult, authResult]) => {
      setComments(commentResult.data ?? []);
      setAuthenticated(Boolean(authResult.data));
    }).catch(() => setError("Impossible de charger les commentaires."));
  }, [articleSlug]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch(`/api/articles/${articleSlug}/comments`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); return; }
    setComments((current) => [result.data, ...current]);
    setContent("");
  }

  return <section className="panel comments-panel"><h2>La discussion continue <span>{comments.length}</span></h2>
    {authenticated === false && <div className="comment-login"><p>Crée un compte gratuit pour rejoindre la conversation.</p><Link className="button small" href={`/register?next=/articles/${articleSlug}`}>S’inscrire pour commenter</Link><Link className="text-link" href={`/login?next=/articles/${articleSlug}`}>J’ai déjà un compte</Link></div>}
    {authenticated && <form onSubmit={submit} className="comment-form"><label htmlFor="comment">Ton commentaire</label><textarea id="comment" value={content} onChange={(event) => setContent(event.target.value)} minLength={2} maxLength={2000} required rows={3} placeholder="Réagis avec respect et bienveillance…" /><p className="comment-rule">Pas d’insultes, de vulgarité, de propos racistes ni de politique : voir la <Link href="/safety">charte</Link>.</p><div><small>{content.length}/2000</small><button className="button small">Publier</button></div></form>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="comment-list">{comments.map((comment) => <article key={comment.id}><b>{comment.author}</b><time>{new Date(comment.createdAt).toLocaleDateString("fr-FR")}</time><p>{comment.content}</p></article>)}{authenticated !== null && comments.length === 0 && <p className="empty-comment">Sois la première personne à réagir avec bienveillance.</p>}</div>
  </section>;
}
