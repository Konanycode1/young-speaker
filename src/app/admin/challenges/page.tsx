import { ChallengeAdminForm } from "@/components/challenge-admin-form";
import { ChallengeModerationCard } from "@/components/challenge-moderation-card";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dashboard";
import { isStaff } from "@/lib/permissions";

export default async function ChallengeAdminPage() {
  const user = await getCurrentUser();
  const canManage = isStaff(user?.role);
  const [reviews, challenges] = await Promise.all([
    db.challengeParticipation.findMany({ where: { experienceStatus: "PENDING_REVIEW", experience: { not: null } }, include: { challenge: true, user: { include: { profile: true } } }, orderBy: { completedAt: "asc" } }),
    db.challenge.findMany({ include: { _count: { select: { participations: true } } }, orderBy: { startsAt: "desc" } }),
  ]);
  const now = new Date();

  return <div className="container section"><div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Gestion des challenges</h1></div><span className="status pending">{reviews.length} témoignage{reviews.length !== 1 ? "s" : ""} à examiner</span></div>{canManage && <div className="admin-split"><ChallengeAdminForm/><section className="panel"><h2>Challenges enregistrés</h2><div className="admin-list">{challenges.map((challenge) => { const state = challenge.status === "DRAFT" ? "Brouillon" : challenge.endsAt < now ? "Terminé" : challenge.startsAt > now ? "À venir" : "Actif"; return <article key={challenge.id}><div><span className={`status ${state === "Actif" ? "" : "pending"}`}>{state}</span><h3>{challenge.title}</h3><p>{formatDate(challenge.startsAt)} → {formatDate(challenge.endsAt)} · {challenge.points} points · {challenge._count.participations} participant{challenge._count.participations !== 1 ? "s" : ""}</p></div></article>; })}{!challenges.length && <div className="empty-note">Aucun challenge enregistré.</div>}</div></section></div>}<section className="challenge-review-section"><div className="section-head"><div><span className="eyebrow">Modération</span><h2>Témoignages des participants</h2></div></div><div className="moderation-list">{reviews.map((review) => <ChallengeModerationCard key={review.id} review={{ id: review.id, challenge: review.challenge.title, participant: review.user.profile?.displayName ?? "Membre", experience: review.experience!, completedAt: formatDate(review.completedAt ?? review.joinedAt) }} />)}{!reviews.length && <div className="empty-note">Aucun témoignage de challenge en attente.</div>}</div></section></div>;
}
