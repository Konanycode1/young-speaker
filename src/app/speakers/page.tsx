import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { db } from "@/lib/db";
import { formatNumber } from "@/lib/dashboard";
import { avatarColor, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Young Speakers" };

export default async function SpeakersPage() {
  const users = await db.user.findMany({
    where: { role: "YOUNG_SPEAKER", deletedAt: null, profile: { isNot: null } },
    include: {
      profile: true,
      articles: { where: { status: "APPROVED", deletedAt: null }, select: { voteCount: true } },
      badges: { include: { badge: true }, orderBy: { awardedAt: "desc" }, take: 1 },
    },
  });
  const speakers = users.map((user) => {
    const profile = user.profile!;
    return {
      name: profile.displayName,
      username: profile.username,
      initials: initials(profile.displayName),
      color: avatarColor(profile.username),
      bio: profile.bio || "Une nouvelle voix dans la communauté Young Speaker.",
      articles: user.articles.length,
      votes: user.articles.reduce((total, article) => total + article.voteCount, 0),
      badge: user.badges[0]?.badge.name ?? "Young Speaker",
    };
  }).sort((first, second) => second.votes - first.votes || second.articles - first.articles || first.name.localeCompare(second.name, "fr"));

  return <><section className="page-hero container"><span className="eyebrow">La communauté</span><h1>Celles et ceux qui osent</h1><p>Découvre les profils, les sujets et les histoires de nos Young Speakers.</p></section><section className="container section" style={{ paddingTop: 0 }}>{speakers.length ? <div className="speakers-grid">{speakers.map((speaker) => <Link className="speaker-card" href={`/speakers/${speaker.username}`} key={speaker.username}><Avatar initials={speaker.initials} color={speaker.color}/><h3>{speaker.name}</h3><span className="handle">@{speaker.username}</span><p>{speaker.bio}</p><span className="badge">✦ {speaker.badge}</span><div className="speaker-stats"><span><b>{speaker.articles}</b><small>article{speaker.articles !== 1 ? "s" : ""}</small></span><span><b>{formatNumber(speaker.votes)}</b><small>votes</small></span></div></Link>)}</div> : <div className="empty-note">Aucun Young Speaker inscrit pour le moment.</div>}</section></>;
}
