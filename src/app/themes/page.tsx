import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/dashboard";

const formatDayMonth = (value: Date) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(value);

export default async function ThemesPage() {
  const now = new Date();
  const themes = await db.weeklyTheme.findMany({
    include: { articles: { where: { status: "APPROVED", deletedAt: null }, select: { voteCount: true } } },
    orderBy: { startsAt: "desc" },
  });
  const current = themes.find((theme) => theme.startsAt <= now && theme.endsAt >= now);
  const upcoming = themes.filter((theme) => theme.startsAt > now);
  const past = themes.filter((theme) => theme.endsAt < now);

  return <><section className="page-hero container"><span className="eyebrow">Un sujet, mille <em className="accent">regards</em></span><h1>Les thèmes</h1><p>Chaque semaine, une question nous rassemble et ouvre un espace de parole sans jugement.</p></section><section className="container section" style={{ paddingTop: 0 }}>
    {current ? <div className="weekly-theme">
      <span className="weekly-theme-label">Thème de la semaine</span>
      <h2>{current.title}</h2>
      <p>{current.description}</p>
      <div className="weekly-theme-foot">
        <Link className="button" href="/dashboard/new-article">Participer au thème <ArrowRight size={17} /></Link>
        <div><b>Fin {formatDayMonth(current.endsAt)}</b><small>Tu peux écrire sous pseudonyme</small></div>
      </div>
    </div> : <div className="empty-note">Aucun thème actif pour le moment.</div>}
    {upcoming.length > 0 && <><div className="section-head theme-subhead"><div><span className="eyebrow">À venir</span><h2>Les prochaines conversations</h2></div></div><div className="article-grid">{upcoming.map((theme) => <Link className="speaker-card theme-preview" href={`/themes/${theme.slug}`} key={theme.id}><span className="eyebrow">À partir du {formatDate(theme.startsAt)}</span><h3>{theme.title}</h3><p>{theme.description}</p></Link>)}</div></>}
    <div className="section-head theme-subhead"><div><span className="eyebrow">Archives</span><h2>Les conversations précédentes</h2></div></div>
    {past.length ? <div className="theme-archive">{past.map((theme) => {
      const votes = theme.articles.reduce((total, article) => total + article.voteCount, 0);
      return <Link className="theme-archive-row" href={`/themes/${theme.slug}`} key={theme.id}>
        <span><small>{formatDate(theme.startsAt)}</small><b>{theme.title}</b></span>
        <span className="theme-archive-counts"><span><b>{formatNumber(theme.articles.length)}</b> participation{theme.articles.length !== 1 ? "s" : ""}</span><span><b>{formatNumber(votes)}</b> vote{votes !== 1 ? "s" : ""}</span></span>
      </Link>;
    })}</div> : <div className="empty-note">Les anciens thèmes apparaîtront ici.</div>}
  </section></>;
}
