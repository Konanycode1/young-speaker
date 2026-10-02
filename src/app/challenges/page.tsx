import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUp } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { ChallengeTestimonials, type Testimonial } from "@/components/challenge-testimonials";
import { db } from "@/lib/db";
import { formatNumber } from "@/lib/dashboard";
import { avatarColor, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Challenges" };
const visuals = [["violet", "♡"], ["yellow", "✦"], ["mint", "◎"]] as const;

const truncate = (value: string, max: number) => value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;

export default async function ChallengesPage() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const [challenges, publicExperiences, weeklyCompletions] = await Promise.all([
    db.challenge.findMany({
      where: { status: "ACTIVE", startsAt: { lte: now }, endsAt: { gte: now } },
      include: { _count: { select: { participations: true } } },
      orderBy: { endsAt: "asc" },
    }),
    db.challengeParticipation.findMany({
      where: { experienceStatus: "APPROVED", experience: { not: null } },
      include: { user: { include: { profile: true } }, challenge: { select: { title: true, slug: true } } },
      orderBy: { completedAt: "desc" },
      take: 9,
    }),
    // Les challenges sensibles (bien-être, violences, santé sexuelle…) restent hors
    // de ce classement : la participation compte, pas la popularité.
    db.challengeParticipation.findMany({
      where: { status: "COMPLETED", completedAt: { gte: weekStart }, challenge: { sensitive: false } },
      include: { user: { include: { profile: true } }, challenge: { select: { points: true } } },
    }),
  ]);
  const testimonials: Testimonial[] = publicExperiences.map((participation) => ({
    id: participation.id,
    quote: truncate(participation.experience ?? "", 240),
    author: participation.user.profile?.displayName ?? "Membre Young Speaker",
    challengeTitle: participation.challenge.title,
    challengeSlug: participation.challenge.slug,
  }));

  const scoreByUser = new Map<string, { name: string; username: string; completions: number; points: number }>();
  for (const completion of weeklyCompletions) {
    const key = completion.userId;
    const entry = scoreByUser.get(key) ?? { name: completion.user.profile?.displayName ?? "Membre", username: completion.user.profile?.username ?? "", completions: 0, points: 0 };
    entry.completions += 1;
    entry.points += completion.challenge.points;
    scoreByUser.set(key, entry);
  }
  const weeklyRanking = [...scoreByUser.values()].sort((first, second) => second.points - first.points).slice(0, 3);

  return <><section className="page-hero container"><span className="eyebrow">Passe à l’action</span><h1>Les challenges</h1><p>De petits défis pour mieux se connaître, apprendre et faire une différence autour de soi.</p></section><section className="container section" style={{ paddingTop: 0 }}>{challenges.length ? <div className="challenge-grid">{challenges.map((challenge, index) => { const visual = visuals[index % visuals.length]; const days = Math.max(1, Math.ceil((challenge.endsAt.getTime() - now.getTime()) / 86_400_000)); return <article className={`challenge-card ${visual[0]}`} key={challenge.id}><div className="visual">{visual[1]}</div><div className="body"><span className="tag">{challenge.difficulty}</span><h2>{challenge.title}</h2><p>{challenge.description}</p><Link className="button small" href={`/challenges/${challenge.slug}`}>Voir le challenge <ArrowRight size={15}/></Link><div className="foot"><span>{formatNumber(challenge._count.participations)} participant{challenge._count.participations !== 1 ? "s" : ""}</span><span>{days} jour{days !== 1 ? "s" : ""} restant{days !== 1 ? "s" : ""}</span></div></div></article>; })}</div> : <div className="empty-note">Aucun challenge actif pour le moment. Reviens bientôt.</div>}</section>

  {weeklyRanking.length > 0 && <section className="section section-soft"><div className="container home-ranking"><div><span className="eyebrow">Cette semaine</span><h2>Classement des<br/>challenges relevés.</h2><p>Basé sur les challenges terminés ces sept derniers jours. Les sujets sensibles (bien-être, violences, santé sexuelle…) n’y figurent jamais : là, seule la participation compte.</p></div><div className="panel">{weeklyRanking.map((entry, index) => <div className="rank-card" key={entry.username || entry.name}><span className="rank">{index + 1}</span><span className="author"><Avatar initials={initials(entry.name)} color={avatarColor(entry.username || entry.name)} size="sm"/><span><b>{entry.name}</b><small>{entry.completions} challenge{entry.completions !== 1 ? "s" : ""} terminé{entry.completions !== 1 ? "s" : ""}</small></span></span><span className="rank-score"><ArrowUp size={14}/> {formatNumber(entry.points)}</span></div>)}</div></div></section>}

  <ChallengeTestimonials items={testimonials} /></>;
}
