"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Eye, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { Article } from "@/lib/data";

export type ExplorerArticle = Article & { campaign: string | null; comments: number };

const FILTERS = ["Tous", "Société", "Santé mentale", "Famille", "Jeunesse", "Éducation", "Développement personnel", "Bien-être psychologique", "Autres"];
const FADE_OUT_MS = 200;
const STAGGER_MS = 120;

export function ExplorerCard({ article }: { article: ExplorerArticle }) {
  return <Link href={`/articles/${article.slug}`} className="explorer-card">
    <span className={`explorer-tag ${article.campaign ? "pink" : ""}`}>{article.campaign ?? article.category}</span>
    <h3>{article.title}</h3>
    <p>{article.excerpt}</p>
    <span className="explorer-foot"><span className="explorer-author"><Avatar initials={article.initials} color={article.color} size="sm" /><span>{article.author} · {article.readTime} min</span></span><span className="explorer-counts"><span aria-label={`${article.votes} votes`}><ArrowUp size={14} />{article.votes}</span><span aria-label={`${article.views} vues`}><Eye size={14} />{article.views}</span><span aria-label={`${article.comments} commentaires`}><MessageCircle size={14} />{article.comments}</span></span></span>
  </Link>;
}

export function ArticleExplorer({ articles, initialFilter }: { articles: ExplorerArticle[]; initialFilter: string }) {
  const [filter, setFilter] = useState(initialFilter);
  const [shownFilter, setShownFilter] = useState(initialFilter);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function choose(next: string) {
    if (next === filter) return;
    setFilter(next);
    setLeaving(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShownFilter(next);
      setLeaving(false);
    }, FADE_OUT_MS);
  }

  const visible = shownFilter === "Tous" ? articles : articles.filter((article) => article.category === shownFilter);

  return <>
    <div className="filters" role="group" aria-label="Filtrer par catégorie">
      {FILTERS.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={`filter ${filter === item ? "active" : ""}`} onClick={() => choose(item)}>{item}</button>)}
    </div>
    <div className={`explorer-grid ${leaving ? "is-leaving" : ""}`} key={shownFilter}>
      {visible.map((article, index) => <div className="explorer-item" style={{ animationDelay: `${index * STAGGER_MS}ms` }} key={article.slug}>
        <ExplorerCard article={article} />
      </div>)}
      <Link href="/dashboard/new-article" className="explorer-add" style={{ animationDelay: `${visible.length * STAGGER_MS}ms` }}>
        <b>Ton article ici ?</b>
      </Link>
    </div>
    {!visible.length && <p className="helper-text explorer-empty">Aucun article publié dans cette catégorie pour le moment.</p>}
  </>;
}
