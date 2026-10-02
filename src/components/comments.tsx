"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Reply = { id: string; content: string; author: string; authorId: string; createdAt: string };
type Comment = Reply & { replies: Reply[] };

export function Comments({ articleSlug }: { articleSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [articleAuthorId, setArticleAuthorId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/articles/${articleSlug}/comments`).then((response) => response.json()),
      fetch("/api/auth/me").then((response) => response.json()),
    ]).then(([commentResult, authResult]) => {
      setComments(commentResult.data ?? []);
      setArticleAuthorId(commentResult.articleAuthorId ?? null);
      setAuthenticated(Boolean(authResult.data));
      setUserId(authResult.data?.id ?? null);
    }).catch(() => setError("Impossible de charger les commentaires."));
  }, [articleSlug]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch(`/api/articles/${articleSlug}/comments`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); return; }
    setComments((current) => [{ ...result.data, replies: [] }, ...current]);
    setContent("");
  }

  async function submitReply(event: React.FormEvent, parentId: string) {
    event.preventDefault();
    setError("");
    const response = await fetch(`/api/articles/${articleSlug}/comments`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: replyContent, parentId }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); return; }
    setComments((current) => current.map((comment) => comment.id === parentId ? { ...comment, replies: [...comment.replies, result.data] } : comment));
    setReplyContent("");
    setReplyingTo(null);
  }

  const isArticleAuthor = Boolean(userId && articleAuthorId && userId === articleAuthorId);
  const totalCount = comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);

  return <section className="panel comments-panel"><h2>La discussion continue <span>{totalCount}</span></h2>
    {authenticated === false && <div className="comment-login"><p>Crée un compte gratuit pour rejoindre la conversation.</p><Link className="button small" href={`/register?next=/articles/${articleSlug}`}>S’inscrire pour commenter</Link><Link className="text-link" href={`/login?next=/articles/${articleSlug}`}>J’ai déjà un compte</Link></div>}
    {authenticated && <form onSubmit={submit} className="comment-form"><label htmlFor="comment">Ton commentaire</label><textarea id="comment" value={content} onChange={(event) => setContent(event.target.value)} minLength={2} maxLength={2000} required rows={3} placeholder="Réagis avec respect et bienveillance…" /><p className="comment-rule">Pas d’insultes, de vulgarité, de propos racistes ni de politique : voir la <Link href="/safety">charte</Link>.</p><div><small>{content.length}/2000</small><button className="button small">Publier</button></div></form>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="comment-list">{comments.map((comment) => <article key={comment.id}>
      <b>{comment.author}</b>{comment.authorId === articleAuthorId && <span className="author-badge">Auteur</span>}<time>{new Date(comment.createdAt).toLocaleDateString("fr-FR")}</time>
      <p>{comment.content}</p>
      {isArticleAuthor && replyingTo !== comment.id && <button type="button" className="text-link reply-trigger" onClick={() => { setReplyingTo(comment.id); setReplyContent(""); setError(""); }}>Répondre</button>}
      {replyingTo === comment.id && <form onSubmit={(event) => submitReply(event, comment.id)} className="comment-form reply-form"><textarea value={replyContent} onChange={(event) => setReplyContent(event.target.value)} minLength={2} maxLength={2000} required rows={2} placeholder="Ta réponse…" autoFocus /><div><small>{replyContent.length}/2000</small><span><button type="button" className="text-link" onClick={() => setReplyingTo(null)}>Annuler</button><button className="button small">Répondre</button></span></div></form>}
      {comment.replies.length > 0 && <div className="comment-replies">{comment.replies.map((reply) => <article key={reply.id} className="comment-reply">
        <b>{reply.author}</b>{reply.authorId === articleAuthorId && <span className="author-badge">Auteur</span>}<time>{new Date(reply.createdAt).toLocaleDateString("fr-FR")}</time>
        <p>{reply.content}</p>
      </article>)}</div>}
    </article>)}{authenticated !== null && comments.length === 0 && <p className="empty-comment">Sois la première personne à réagir avec bienveillance.</p>}</div>
  </section>;
}
