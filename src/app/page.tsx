import Link from "next/link";
import { ArrowRight, ArrowUp, Medal, Ribbon } from "lucide-react";
import { ExplorerCard } from "@/components/article-explorer";
import { Avatar } from "@/components/avatar";
import { getActiveCampaign } from "@/lib/campaign";
import { getSpeakerStats } from "@/lib/speaker-stats";
import { db } from "@/lib/db";
import { formatNumber } from "@/lib/dashboard";
import { avatarColor, initials } from "@/lib/utils";
const formatDay = (value: Date) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(value);
const rankColors = ["#e0a600", "#9aa7ad", "#c07a42"];

export default async function Home() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const [databaseArticles, speakers, currentTheme, currentChallenge, topWeeklyVotes, activeCampaign] = await Promise.all([
    db.article.findMany({
      where: { status: "APPROVED", deletedAt: null },
      include: { category: true, campaign: true, author: { include: { profile: true } } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    getSpeakerStats(),
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
    db.vote.groupBy({
      by: ["articleId"],
      where: { createdAt: { gte: weekStart }, article: { status: "APPROVED", deletedAt: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
    getActiveCampaign(),
  ]);
  const specialTheme = activeCampaign?.themePrompt
    ? { ...activeCampaign, participations: await db.article.count({ where: { campaignId: activeCampaign.id, status: "APPROVED", deletedAt: null } }) }
    : null;

  // Young Speaker de la semaine : l'article ayant reçu le plus de votes ces sept derniers jours.
  const spotlightArticle = topWeeklyVotes[0]
    ? await db.article.findUnique({ where: { id: topWeeklyVotes[0].articleId }, include: { author: { include: { profile: true } } } })
    : null;
  const spotlight = spotlightArticle ? {
    slug: spotlightArticle.slug,
    title: spotlightArticle.title,
    author: spotlightArticle.author.profile?.displayName ?? "Young Speaker",
    weeklyVotes: topWeeklyVotes[0]!._count.id,
  } : null;

  const articles = databaseArticles.map((article) => {
    const author = article.author.profile?.displayName ?? "Young Speaker";
    return {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category.name,
      campaign: article.campaign?.name ?? null,
      author,
      initials: initials(author),
      color: avatarColor(article.author.profile?.username ?? article.authorId),
      votes: article.voteCount,
      views: article.views,
      comments: article.commentCount,
      readTime: Math.max(2, Math.ceil(article.content.split(/\s+/).length / 220)),
      date: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(article.publishedAt ?? article.createdAt),
      sensitive: article.sensitiveWarning ?? undefined,
      content: article.content.split(/\n\n+/),
    };
  });
  const byWeeklyVotes = [...speakers].sort((first, second) => second.weeklyVotes - first.weeklyVotes || second.votes - first.votes);
  const featuredSpeaker = byWeeklyVotes[0];
  const newVoices = byWeeklyVotes.slice(1, 4);
  const weeklyRanking = [...speakers].sort((first, second) => second.weeklyVotes - first.weeklyVotes || second.votes - first.votes).slice(0, 3);
  const themeVotes = currentTheme?.articles.reduce((total, article) => total + article.voteCount, 0) ?? 0;
  const challengeProgress = currentChallenge
    ? Math.min(100, Math.max(0, ((now.getTime() - currentChallenge.startsAt.getTime()) / (currentChallenge.endsAt.getTime() - currentChallenge.startsAt.getTime())) * 100))
    : 0;

  return <>
    <section className="container hero"><div className="hero-copy"><span className="eyebrow">La plateforme des jeunes qui s’expriment</span><h1>Ta voix compte.<br />Fais-la <em>entendre.</em></h1><p>Young Speaker est l’espace sûr où les jeunes partagent leurs idées, leurs expériences et leurs réalités. Ici, chaque histoire peut faire la différence.</p><div className="hero-actions"><Link className="button violet" href="/become-speaker">Prendre la parole <ArrowRight size={18}/></Link><Link className="button outline" href="/articles">Découvrir les voix</Link></div><div className="micro-proof">{speakers.length > 0 && <span className="avatar-stack">{speakers.slice(0, 3).map((speaker) => <Avatar key={speaker.username} initials={speaker.initials} color={speaker.color} size="sm" />)}</span>}<span><b>{formatNumber(speakers.length)} jeune{speakers.length !== 1 ? "s" : ""}</b> {speakers.length !== 1 ? "font" : "fait"} déjà entendre {speakers.length !== 1 ? "leurs voix" : "sa voix"}</span></div></div>
      <div className="hero-visual" aria-hidden="true"><div className="blob"/><div className="portrait"/><div className="floating-note one">Mon histoire peut aider.</div><div className="floating-note two"><i>✦</i> Ici, on m’écoute vraiment.</div></div>
    </section>

    {specialTheme && <section className="section section-soft"><div className="container"><div className="theme-card special" style={{ "--campaign-color": specialTheme.color } as React.CSSProperties}><div><span className="eyebrow"><Ribbon size={14} style={{ verticalAlign: "-2px" }} /> Thème spécial · {specialTheme.name}</span><h2>« {specialTheme.themePrompt} »</h2></div><div className="theme-cta"><Link className="button light" href="/dashboard/new-article">Écrire sur ce thème <ArrowRight size={17}/></Link><small>Tu peux écrire sous pseudonyme</small></div></div></div></section>}

    {spotlight && <section className="section" style={{ paddingTop: 0, paddingBottom: "3rem" }}><div className="container"><Link href={`/articles/${spotlight.slug}`} className="spotlight-card"><span className="eyebrow">Young Speaker de la semaine</span><h2>{spotlight.author} : « {spotlight.title} »</h2><span className="text-link">Lire son texte <ArrowRight size={16}/></span></Link></div></section>}

    <section className={`section ${specialTheme ? "" : "section-soft"}`} style={specialTheme ? { paddingTop: 0 } : undefined}><div className="container">{currentTheme ? <div className="theme-card"><div><span className="eyebrow">Thème de la semaine</span><h2>{currentTheme.title}</h2><p>{currentTheme.description}</p><div className="theme-stats"><span><b>{currentTheme.articles.length}</b><small>participation{currentTheme.articles.length !== 1 ? "s" : ""}</small></span><span><b>{formatNumber(themeVotes)}</b><small>votes</small></span><span><b>{formatDay(currentTheme.endsAt)}</b><small>date de fin</small></span></div></div><div className="theme-cta"><Link className="button light" href="/dashboard/new-article">Participer au thème <ArrowRight size={17}/></Link><small>Tu peux écrire sous pseudonyme</small></div></div> : <div className="empty-note">Le prochain thème de la semaine arrive bientôt.</div>}</div></section>


    <section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">À lire maintenant</span><h2>Des voix qui résonnent</h2></div><Link className="arrow-link" href="/articles">Voir tous les articles <ArrowRight size={17}/></Link></div>{articles.length ? <div className="explorer-grid">{articles.map((article) => <ExplorerCard key={article.slug} article={article} />)}</div> : <div className="empty-note">Aucun article publié pour le moment. Les premières voix arrivent bientôt.</div>}</div></section>

    <section className="section section-soft"><div className="container discover">
      <div className="discover-intro"><span className="eyebrow">La communauté</span><h2>Speakers à <em className="accent">découvrir</em></h2><p>Des jeunes curieux, courageux et engagés qui racontent le monde avec leurs propres mots.</p>
        {featuredSpeaker && <div className="discover-feature"><span className="discover-kicker">À la une cette semaine</span><div className="discover-feature-who"><Avatar initials={featuredSpeaker.initials} color={featuredSpeaker.color} size="md"/><div><b>{featuredSpeaker.name}</b><small>@{featuredSpeaker.username}{featuredSpeaker.badge ? ` · ${featuredSpeaker.badge}` : ""}</small></div></div><p className="discover-quote">« {featuredSpeaker.bio} »</p><div className="discover-feature-foot"><span><b>{featuredSpeaker.articles}</b> article{featuredSpeaker.articles !== 1 ? "s" : ""} · <b>{formatNumber(featuredSpeaker.votes)}</b> vote{featuredSpeaker.votes !== 1 ? "s" : ""}</span><Link className="button small light" href={`/speakers/${featuredSpeaker.username}`}>Lire ses textes</Link></div></div>}
      </div>
      <div className="discover-list">
        <div className="discover-list-head"><span className="discover-kicker">Nouvelles voix</span><Link className="arrow-link discover-link-top" href="/speakers">Toute la communauté <ArrowRight size={17}/></Link></div>
        {newVoices.map((speaker) => <Link href={`/speakers/${speaker.username}`} className="discover-row" key={speaker.username}><Avatar initials={speaker.initials} color={speaker.color} size="md"/><span className="discover-row-info"><span className="discover-row-name"><b>{speaker.name}</b>{speaker.badge && <span className="discover-badge">{speaker.badge}</span>}</span><small>@{speaker.username} · {speaker.bio}</small><span className="discover-row-stats"><b>{speaker.articles}</b> article{speaker.articles !== 1 ? "s" : ""} · <b>{formatNumber(speaker.votes)}</b> vote{speaker.votes !== 1 ? "s" : ""}</span></span><span className="discover-row-go"><ArrowRight size={16}/></span></Link>)}
        <div className="discover-cta"><div><b>Et toi, quelle est ton histoire ?</b><small>Rejoins les Young Speakers et publie ton premier texte.</small></div><Link className="button small" href="/become-speaker">Prendre la parole</Link></div>
        <Link className="button outline discover-all" href="/speakers">Toute la communauté <ArrowRight size={17}/></Link>
      </div>
    </div></section>

    {currentChallenge && <section className="section"><div className="container"><div className="challenge-banner"><div className="challenge-icon">♡</div><div><span className="eyebrow">Challenge en cours</span><h2>{currentChallenge.title}</h2><p>{currentChallenge.description}</p><div className="progress"><span style={{ width: `${challengeProgress}%` }}/></div></div><div className="challenge-side"><b>{formatNumber(currentChallenge._count.participations)}</b><small>participant{currentChallenge._count.participations !== 1 ? "s" : ""}</small><Link className="button violet" href={`/challenges/${currentChallenge.slug}`}>Je participe</Link></div></div></div></section>}

    <section className="section section-soft"><div className="container home-ranking"><div><span className="eyebrow">Top de la semaine</span><h2>Leurs mots ont<br/>touché la communauté.</h2><p>Chaque vote met en lumière une voix. Découvre les trois Young Speakers les plus soutenus ces sept derniers jours.</p><Link className="arrow-link" href="/speakers">Découvrir le classement <ArrowRight size={17}/></Link></div><div className="panel">{weeklyRanking.length ? weeklyRanking.map((speaker, index) => <div className="rank-card" key={speaker.username}><span className="rank" style={{ color: rankColors[index] }}><Medal size={22} /></span><span className="author"><Avatar initials={speaker.initials} color={speaker.color} size="sm"/><span><b>{speaker.name}</b><small>{speaker.articles} article{speaker.articles !== 1 ? "s" : ""} publié{speaker.articles !== 1 ? "s" : ""}</small></span></span><span className="rank-score"><ArrowUp size={14}/> {formatNumber(speaker.weeklyVotes)}</span></div>) : <div className="empty-note">Le classement apparaîtra avec les premiers speakers.</div>}</div></div></section>

    <section className="cta-band"><span className="eyebrow">À ton tour</span><h2>Une idée ? Une histoire ?<br/>Le monde mérite de l’entendre.</h2><p>Rejoins une communauté qui écoute, soutient et fait grandir chaque voix.</p><Link className="button" href="/become-speaker">Je deviens Young Speaker <ArrowRight size={18}/></Link></section>
  </>;
}
