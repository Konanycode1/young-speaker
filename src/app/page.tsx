import Link from "next/link";
import { ArrowRight, ArrowUp } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { Avatar } from "@/components/avatar";
import { db } from "@/lib/db";
import { formatNumber } from "@/lib/dashboard";
import { avatarColor, initials } from "@/lib/utils";
const formatDay = (value: Date) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(value);

export default async function Home() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const [databaseArticles, databaseSpeakers, currentTheme, currentChallenge] = await Promise.all([
    db.article.findMany({
      where: { status: "APPROVED", deletedAt: null },
      include: { category: true, author: { include: { profile: true } } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    db.user.findMany({
      where: { role: "YOUNG_SPEAKER", deletedAt: null, profile: { isNot: null } },
      include: {
        profile: true,
        articles: {
          where: { status: "APPROVED", deletedAt: null },
          select: { voteCount: true, votes: { where: { createdAt: { gte: weekStart } }, select: { id: true } } },
        },
        badges: { include: { badge: true }, orderBy: { awardedAt: "desc" }, take: 1 },
      },
    }),
    db.weeklyTheme.findFirst({
      where: { startsAt: { lte: now }, endsAt: { gte: now } },
      include: { articles: { where: { status: "APPROVED", deletedAt: null }, select: { voteCount: true } } },
      orderBy: { startsAt: "desc" },
    }),
    db.challenge.findFirst({
      where: { status: "ACTIVE", startsAt: { lte: now }, endsAt: { gte: now } },
      include: { _count: { select: { participations: true } } },
      orderBy: { endsAt: "asc" },
    }),
  ]);

  const articles = databaseArticles.map((article) => {
    const author = article.author.profile?.displayName ?? "Young Speaker";
    return {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category.name,
      author,
      initials: initials(author),
      color: avatarColor(article.author.profile?.username ?? article.authorId),
      votes: article.voteCount,
      views: article.views,
      readTime: Math.max(2, Math.ceil(article.content.split(/\s+/).length / 220)),
      date: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(article.publishedAt ?? article.createdAt),
      sensitive: article.sensitiveWarning ?? undefined,
      content: article.content.split(/\n\n+/),
    };
  });
  const speakers = databaseSpeakers.map((speaker) => {
    const profile = speaker.profile!;
    return {
      name: profile.displayName,
      username: profile.username,
      initials: initials(profile.displayName),
      color: avatarColor(profile.username),
      bio: profile.bio || "Une nouvelle voix dans la communauté Young Speaker.",
      articles: speaker.articles.length,
      votes: speaker.articles.reduce((total, article) => total + article.voteCount, 0),
      weeklyVotes: speaker.articles.reduce((total, article) => total + article.votes.length, 0),
      badge: speaker.badges[0]?.badge.name ?? "Young Speaker",
    };
  }).sort((first, second) => second.votes - first.votes || second.articles - first.articles);
  const featuredSpeakers = speakers.slice(0, 4);
  const weeklyRanking = [...speakers].sort((first, second) => second.weeklyVotes - first.weeklyVotes || second.votes - first.votes).slice(0, 3);
  const themeVotes = currentTheme?.articles.reduce((total, article) => total + article.voteCount, 0) ?? 0;
  const challengeProgress = currentChallenge
    ? Math.min(100, Math.max(0, ((now.getTime() - currentChallenge.startsAt.getTime()) / (currentChallenge.endsAt.getTime() - currentChallenge.startsAt.getTime())) * 100))
    : 0;

  return <>
    <section className="container hero"><div className="hero-copy"><span className="eyebrow">La plateforme des jeunes qui s’expriment</span><h1>Ta voix compte.<br />Fais-la <em>entendre.</em></h1><p>Young Speaker est l’espace sûr où les jeunes partagent leurs idées, leurs expériences et leurs réalités. Ici, chaque histoire peut faire la différence.</p><div className="hero-actions"><Link className="button violet" href="/become-speaker">Prendre la parole <ArrowRight size={18}/></Link><Link className="button outline" href="/articles">Découvrir les voix</Link></div><div className="micro-proof">{speakers.length > 0 && <span className="avatar-stack">{speakers.slice(0, 3).map((speaker) => <Avatar key={speaker.username} initials={speaker.initials} color={speaker.color} size="sm" />)}</span>}<span><b>{formatNumber(speakers.length)} jeune{speakers.length !== 1 ? "s" : ""}</b> {speakers.length !== 1 ? "font" : "fait"} déjà entendre {speakers.length !== 1 ? "leurs voix" : "sa voix"}</span></div></div>
      <div className="hero-visual" aria-hidden="true"><div className="blob"/><div className="portrait"/><div className="floating-note one"><i>💬</i> Mon histoire peut aider.</div><div className="floating-note two"><i>✦</i> Ici, on m’écoute vraiment.</div></div>
    </section>

    <section className="section section-soft"><div className="container">{currentTheme ? <div className="theme-card"><div><span className="eyebrow">🎤 Thème de la semaine</span><h2>{currentTheme.title}</h2><p>{currentTheme.description}</p><div className="theme-stats"><span><b>{currentTheme.articles.length}</b><small>participation{currentTheme.articles.length !== 1 ? "s" : ""}</small></span><span><b>{formatNumber(themeVotes)}</b><small>votes</small></span><span><b>{formatDay(currentTheme.endsAt)}</b><small>date de fin</small></span></div></div><div className="theme-cta"><Link className="button light" href="/dashboard/new-article">Participer au thème <ArrowRight size={17}/></Link><small>Tu peux écrire sous pseudonyme</small></div></div> : <div className="empty-note">Le prochain thème de la semaine arrive bientôt.</div>}</div></section>

    <section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">À lire maintenant</span><h2>Des voix qui résonnent</h2></div><Link className="arrow-link" href="/articles">Voir tous les articles <ArrowRight size={17}/></Link></div>{articles.length ? <div className="article-grid">{articles.map((article, index) => <ArticleCard key={article.slug} article={article} featured={index === 0}/>)}</div> : <div className="empty-note">Aucun article publié pour le moment. Les premières voix arrivent bientôt.</div>}</div></section>

    <section className="section section-soft"><div className="container"><div className="section-head"><div><span className="eyebrow">La communauté</span><h2>Speakers à découvrir</h2><p>Des jeunes curieux, courageux et engagés qui racontent le monde avec leurs propres mots.</p></div><Link className="arrow-link" href="/speakers">Toute la communauté <ArrowRight size={17}/></Link></div>{featuredSpeakers.length ? <div className="speakers-grid">{featuredSpeakers.map((speaker) => <Link href={`/speakers/${speaker.username}`} className="speaker-card" key={speaker.username}><Avatar initials={speaker.initials} color={speaker.color}/><h3>{speaker.name}</h3><span className="handle">@{speaker.username}</span><p>{speaker.bio}</p><span className="badge">✦ {speaker.badge}</span><div className="speaker-stats"><span><b>{speaker.articles}</b><small>article{speaker.articles !== 1 ? "s" : ""}</small></span><span><b>{formatNumber(speaker.votes)}</b><small>votes</small></span></div></Link>)}</div> : <div className="empty-note">Aucun Young Speaker inscrit pour le moment.</div>}</div></section>

    {currentChallenge && <section className="section"><div className="container"><div className="challenge-banner"><div className="challenge-icon">♡</div><div><span className="eyebrow">Challenge en cours</span><h2>{currentChallenge.title}</h2><p>{currentChallenge.description}</p><div className="progress"><span style={{ width: `${challengeProgress}%` }}/></div></div><div className="challenge-side"><b>{formatNumber(currentChallenge._count.participations)}</b><small>participant{currentChallenge._count.participations !== 1 ? "s" : ""}</small><Link className="button violet" href={`/challenges/${currentChallenge.slug}`}>Je participe</Link></div></div></div></section>}

    <section className="section section-soft"><div className="container home-ranking"><div><span className="eyebrow">Top de la semaine</span><h2>Leurs mots ont<br/>touché la communauté.</h2><p>Chaque vote met en lumière une voix. Découvre les trois Young Speakers les plus soutenus ces sept derniers jours.</p><Link className="arrow-link" href="/speakers">Découvrir le classement <ArrowRight size={17}/></Link></div><div className="panel">{weeklyRanking.length ? weeklyRanking.map((speaker, index) => <div className="rank-card" key={speaker.username}><span className="rank">{["🥇", "🥈", "🥉"][index]}</span><span className="author"><Avatar initials={speaker.initials} color={speaker.color} size="sm"/><span><b>{speaker.name}</b><small>{speaker.articles} article{speaker.articles !== 1 ? "s" : ""} publié{speaker.articles !== 1 ? "s" : ""}</small></span></span><span className="rank-score"><ArrowUp size={14}/> {formatNumber(speaker.weeklyVotes)}</span></div>) : <div className="empty-note">Le classement apparaîtra avec les premiers speakers.</div>}</div></div></section>

    <section className="cta-band"><span className="eyebrow">À ton tour</span><h2>Une idée ? Une histoire ?<br/>Le monde mérite de l’entendre.</h2><p>Rejoins une communauté qui écoute, soutient et fait grandir chaque voix.</p><Link className="button" href="/become-speaker">Je deviens Young Speaker <ArrowRight size={18}/></Link></section>
  </>;
}
