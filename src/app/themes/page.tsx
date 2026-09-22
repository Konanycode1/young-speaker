import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/dashboard";

export default async function ThemesPage() {
  const now = new Date();
  const themes = await db.weeklyTheme.findMany({
    include: { articles: { where: { status: "APPROVED", deletedAt: null }, select: { voteCount: true } } },
    orderBy: { startsAt: "desc" },
  });
  const current = themes.find((theme) => theme.startsAt <= now && theme.endsAt >= now);
  const upcoming = themes.filter((theme) => theme.startsAt > now);
  const past = themes.filter((theme) => theme.endsAt < now);
  const votes = current?.articles.reduce((total, article) => total + article.voteCount, 0) ?? 0;

  return <><section className="page-hero container"><span className="eyebrow">Un sujet, mille regards</span><h1>Les thèmes</h1><p>Chaque semaine, une question nous rassemble et ouvre un espace de parole sans jugement.</p></section><section className="container section" style={{ paddingTop: 0 }}>{current ? <div className="theme-card"><div><span className="eyebrow">En ce moment</span><h2>{current.title}</h2><p>{current.description}</p><div className="theme-stats"><span><b>{current.articles.length}</b><small>participation{current.articles.length !== 1 ? "s" : ""}</small></span><span><b>{formatNumber(votes)}</b><small>votes</small></span><span><b>{formatDate(current.endsAt)}</b><small>date de fin</small></span></div></div><div className="theme-cta"><Link className="button light" href="/dashboard/new-article">Partager ma voix <ArrowRight size={17}/></Link></div></div> : <div className="empty-note">Aucun thème actif pour le moment.</div>}{upcoming.length > 0 && <><div className="section-head theme-subhead"><div><span className="eyebrow">À venir</span><h2>Les prochaines conversations</h2></div></div><div className="article-grid">{upcoming.map((theme) => <article className="speaker-card theme-preview" key={theme.id}><span className="eyebrow">À partir du {formatDate(theme.startsAt)}</span><h3>{theme.title}</h3><p>{theme.description}</p></article>)}</div></>}<div className="section-head theme-subhead"><div><span className="eyebrow">Archives</span><h2>Les conversations précédentes</h2></div></div>{past.length ? <div className="article-grid">{past.map((theme) => <article className="speaker-card theme-preview" key={theme.id}><span className="eyebrow">{formatDate(theme.startsAt)}</span><h3>{theme.title}</h3><p>{theme.articles.length} contribution{theme.articles.length !== 1 ? "s" : ""} de la communauté</p></article>)}</div> : <div className="empty-note">Les anciens thèmes apparaîtront ici.</div>}</section></>;
}
