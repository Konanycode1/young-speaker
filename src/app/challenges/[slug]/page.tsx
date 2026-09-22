import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Award, CalendarDays, Target, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { ChallengeAction } from "@/components/challenge-action";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/dashboard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await db.challenge.findUnique({ where: { slug }, select: { title: true, description: true } });
  return challenge ? { title: challenge.title, description: challenge.description } : {};
}

export default async function ChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const challenge = await db.challenge.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      participations: { where: { userId: user?.id ?? "__anonymous__" }, take: 1 },
      _count: { select: { participations: true } },
    },
  });
  if (!challenge) notFound();
  const publicExperiences = await db.challengeParticipation.findMany({
    where: { challengeId: challenge.id, experienceStatus: "APPROVED", experience: { not: null } },
    include: { user: { include: { profile: true } } },
    orderBy: { completedAt: "desc" },
    take: 12,
  });
  const participation = challenge.participations?.[0];
  const instructions = challenge.instructions.split(/\n+/).map((item) => item.trim()).filter(Boolean);

  const experienceLabel = participation?.experienceStatus === "PENDING_REVIEW" ? "Publication autorisée, en attente de modération." : participation?.experienceStatus === "APPROVED" ? "Témoignage approuvé pour la communauté." : participation?.experienceStatus === "REJECTED" ? `Publication refusée : ${participation.experienceRejectionReason}` : "Visible uniquement par toi.";
  return <div className="container challenge-detail"><Link className="arrow-link" href="/challenges"><ArrowLeft size={16}/> Tous les challenges</Link><section className="challenge-detail-hero"><div><span className="tag">{challenge.difficulty}</span><h1>{challenge.title}</h1><p>{challenge.description}</p></div><div className="challenge-reward"><Award size={30}/><b>{challenge.points} points</b><small>{challenge.reward || "Badge Challenge Master"}</small></div></section><div className="challenge-detail-grid"><div><section className="panel"><span className="eyebrow">Ton objectif</span><h2>{challenge.objective}</h2><div className="challenge-meta"><span><Users size={18}/><b>{formatNumber(challenge._count.participations)}</b><small>participants</small></span><span><CalendarDays size={18}/><b>{formatDate(challenge.endsAt)}</b><small>date de fin</small></span><span><Target size={18}/><b>{challenge.difficulty}</b><small>niveau</small></span></div></section><section className="panel"><span className="eyebrow">Comment participer</span><ol className="challenge-steps">{instructions.map((instruction, index) => <li key={instruction}><span>{index + 1}</span><p>{instruction}</p></li>)}</ol></section></div><aside className="panel challenge-side-panel"><span className="eyebrow">{participation ? "Ma progression" : "Prêt·e à commencer ?"}</span><h2>{participation?.status === "COMPLETED" ? "Bravo, défi relevé !" : participation ? "Va à ton rythme." : "Fais le premier pas."}</h2><p>{participation ? "Tu peux revenir ici quand tu veux pour terminer et partager ce que tu as appris." : "Ta participation est privée. Seul le témoignage que tu autorises pourra être proposé à la publication."}</p><ChallengeAction id={challenge.id} status={participation?.status}/>{participation?.experience && <div className="experience-note"><b>Ton retour</b><p>{participation.experience}</p><small>{experienceLabel}</small></div>}</aside></div>{publicExperiences.length > 0 && <section className="challenge-community"><span className="eyebrow">La communauté</span><h2>Ce que les participants ont appris</h2><div className="dashboard-cards">{publicExperiences.map((experience) => <article className="panel" key={experience.id}><p>« {experience.experience} »</p><small>— {experience.user.profile?.displayName ?? "Membre Young Speaker"}</small></article>)}</div></section>}</div>;
}
