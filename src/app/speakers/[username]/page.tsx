import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { db } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/dashboard";
import { avatarColor, initials } from "@/lib/utils";

export default async function SpeakerPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await db.profile.findFirst({
    where: { username, user: { role: "YOUNG_SPEAKER", deletedAt: null } },
    include: {
      user: {
        include: {
          articles: { where: { status: "APPROVED", deletedAt: null }, orderBy: { publishedAt: "desc" } },
          badges: { include: { badge: true }, orderBy: { awardedAt: "desc" }, take: 1 },
        },
      },
    },
  });
  if (!profile) notFound();

  const votes = profile.user.articles.reduce((total, article) => total + article.voteCount, 0);
  const badge = profile.user.badges[0]?.badge.name;
  return <><section className="page-hero container"><Avatar initials={initials(profile.displayName)} color={avatarColor(profile.username)} size="lg" /><h1>{profile.displayName}</h1><span className="speaker-handle">@{profile.username}</span><p>{profile.bio || "Une nouvelle voix dans la communauté Young Speaker."}</p><div className="speaker-stats public-stats"><span><b>{profile.user.articles.length}</b><small>article{profile.user.articles.length !== 1 ? "s" : ""}</small></span><span><b>{formatNumber(votes)}</b><small>votes reçus</small></span></div>{badge && <span className="tag">✦ {badge}</span>}</section><section className="container section dashboard-article-list"><div className="section-head"><h2>Ses dernières voix</h2></div>{profile.user.articles.length ? profile.user.articles.map((article) => <Link className="panel" key={article.id} href={`/articles/${article.slug}`}><span className="tag">Publié</span><h3>{article.title}</h3><p>{article.excerpt}</p><small>{formatDate(article.publishedAt ?? article.createdAt)} · {formatNumber(article.views)} vues · {formatNumber(article.voteCount)} votes</small></Link>) : <div className="empty-note">Aucun article publié pour le moment.</div>}</section></>;
}
