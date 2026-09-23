import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChallengeTestimonials, type Testimonial } from "@/components/challenge-testimonials";
import { db } from "@/lib/db";
import { formatNumber } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Challenges" };
const visuals = [["violet", "♡"], ["yellow", "✦"], ["mint", "◎"]] as const;

const truncate = (value: string, max: number) => value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;

export default async function ChallengesPage() {
  const now = new Date();
  const [challenges, publicExperiences] = await Promise.all([
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
  ]);
  const testimonials: Testimonial[] = publicExperiences.map((participation) => ({
    id: participation.id,
    quote: truncate(participation.experience ?? "", 240),
    author: participation.user.profile?.displayName ?? "Membre Young Speaker",
    challengeTitle: participation.challenge.title,
    challengeSlug: participation.challenge.slug,
  }));
  return <><section className="page-hero container"><span className="eyebrow">Passe à l’action</span><h1>Les challenges</h1><p>De petits défis pour mieux se connaître, apprendre et faire une différence autour de soi.</p></section><section className="container section" style={{ paddingTop: 0 }}>{challenges.length ? <div className="challenge-grid">{challenges.map((challenge, index) => { const visual = visuals[index % visuals.length]; const days = Math.max(1, Math.ceil((challenge.endsAt.getTime() - now.getTime()) / 86_400_000)); return <article className={`challenge-card ${visual[0]}`} key={challenge.id}><div className="visual">{visual[1]}</div><div className="body"><span className="tag">{challenge.difficulty}</span><h2>{challenge.title}</h2><p>{challenge.description}</p><Link className="button small" href={`/challenges/${challenge.slug}`}>Voir le challenge <ArrowRight size={15}/></Link><div className="foot"><span>{formatNumber(challenge._count.participations)} participant{challenge._count.participations !== 1 ? "s" : ""}</span><span>{days} jour{days !== 1 ? "s" : ""} restant{days !== 1 ? "s" : ""}</span></div></div></article>; })}</div> : <div className="empty-note">Aucun challenge actif pour le moment. Reviens bientôt.</div>}</section><ChallengeTestimonials items={testimonials} /></>;
}
