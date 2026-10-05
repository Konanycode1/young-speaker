import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { SpeakerPodium } from "@/components/speaker-podium";
import { formatNumber } from "@/lib/dashboard";
import { getSpeakerStats } from "@/lib/speaker-stats";

export const metadata: Metadata = { title: "Young Speakers" };

export default async function SpeakersPage() {
  const speakers = await getSpeakerStats();
  const weeklyRanking = [...speakers].sort((first, second) => second.weeklyVotes - first.weeklyVotes || second.votes - first.votes).slice(0, 3).filter((speaker) => speaker.weeklyVotes > 0);

  const podiumUsernames = new Set(weeklyRanking.map((speaker) => speaker.username));
  const rest = speakers.filter((speaker) => !podiumUsernames.has(speaker.username));

  return <>
    <section className="page-hero container"><span className="eyebrow">La communauté</span><h1>Celles et ceux qui osent</h1><p>Découvre les profils, les sujets et les histoires de nos Young Speakers.</p></section>
    {weeklyRanking.length > 0 && <section className="container section podium-section" style={{ paddingTop: 0 }}>
      <div className="podium-head"><span className="eyebrow">Top de la semaine</span><h2>Leurs mots ont <em className="accent">touché</em> la communauté.</h2><p>Les votes reçus ces sept derniers jours.</p></div>
      <SpeakerPodium ranked={weeklyRanking} />
    </section>}
    <section className="container section" style={{ paddingTop: 0 }}>{rest.length ? <div className="speaker-rows">{rest.map((speaker) => <Link className="speaker-row" href={`/speakers/${speaker.username}`} key={speaker.username}><Avatar initials={speaker.initials} color={speaker.color} size="md"/><span className="speaker-row-info"><b>{speaker.name}</b><small>{speaker.articles} article{speaker.articles !== 1 ? "s" : ""} · {formatNumber(speaker.votes)} vote{speaker.votes !== 1 ? "s" : ""}</small></span>{speaker.badge && <span className="speaker-row-badge">{speaker.badge}</span>}</Link>)}</div> : speakers.length ? null : <div className="empty-note">Aucun Young Speaker inscrit pour le moment.</div>}</section>
  </>;
}
