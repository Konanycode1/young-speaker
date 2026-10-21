import { ApproveAllTestimonialsButton } from "@/components/approve-all-testimonials-button";
import { ChallengeAdminForm } from "@/components/challenge-admin-form";
import { ChallengeModerationCard } from "@/components/challenge-moderation-card";
import { RevokeTestimonialButton } from "@/components/revoke-testimonial-button";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dashboard";
import { isStaff } from "@/lib/permissions";

export default async function ChallengeAdminPage() {
  const user = await getCurrentUser();
  const canManage = isStaff(user?.role);
  const [reviews, published, challenges] = await Promise.all([
    db.challengeParticipation.findMany({ where: { experienceStatus: "PENDING_REVIEW", experience: { not: null } }, include: { challenge: true, user: { include: { profile: true } } }, orderBy: { completedAt: "asc" } }),
    db.challengeParticipation.findMany({ where: { experienceStatus: "APPROVED", experience: { not: null } }, include: { challenge: true, user: { include: { profile: true } } }, orderBy: { completedAt: "desc" } }),
    db.challenge.findMany({ include: { _count: { select: { participations: true } } }, orderBy: { startsAt: "desc" } }),
  ]);
  const now = new Date();

  return <div className="container section"><div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Gestion des challenges</h1></div><span className="status pending">{reviews.length} témoignage{reviews.length !== 1 ? "s" : ""} à examiner</span></div>{canManage && <div className="admin-split"><ChallengeAdminForm/><section className="panel"><h2>Challenges enregistrés</h2><div className="admin-list">{challenges.map((challenge) => { const state = challenge.status === "DRAFT" ? "Brouillon" : challenge.endsAt < now ? "Terminé" : challenge.startsAt > now ? "À venir" : "Actif"; return <article key={challenge.id}><div><span className={`status ${state === "Actif" ? "" : "pending"}`}>{state}</span>{challenge.sensitive && <span className="status pending">Sensible · hors classement</span>}<h3>{challenge.title}</h3><p>{formatDate(challenge.startsAt)} → {formatDate(challenge.endsAt)} · {challenge.points} points · {challenge._count.participations} participant{challenge._count.participations !== 1 ? "s" : ""}</p></div></article>; })}{!challenges.length && <div className="empty-note">Aucun challenge enregistré.</div>}</div></section></div>}<section className="challenge-review-section"><div className="section-head"><div><span className="eyebrow">Modération</span><h2>Témoignages des participants</h2></div>{canManage && reviews.length > 0 && <ApproveAllTestimonialsButton count={reviews.length} />}</div><div className="moderation-list">{reviews.map((review) => <ChallengeModerationCard key={review.id} review={{ id: review.id, challenge: review.challenge.title, participant: review.user.profile?.displayName ?? "Membre", experience: review.experience!, completedAt: formatDate(review.completedAt ?? review.joinedAt) }} />)}{!reviews.length && <div className="empty-note">Aucun témoignage de challenge en attente.</div>}</div></section>{canManage && <section className="challenge-review-section"><div className="section-head"><div><span className="eyebrow">Publié</span><h2>Témoignages visibles sur le site ({published.length})</h2></div></div><div className="moderation-list">{published.map((review) => <article className="moderation-card" key={review.id}><div className="moderation-summary"><span><b>{review.challenge.title}</b><small>{review.user.profile?.displayName ?? "Membre"} · {formatDate(review.completedAt ?? review.joinedAt)}</small></span><span>Publié</span></div><div className="moderation-content"><div className="moderation-text">{review.experience}</div><div className="moderation-actions"><RevokeTestimonialButton id={review.id} /></div></div></article>)}{!published.length && <div className="empty-note">Aucun témoignage publié actuellement.</div>}</div></section>}</div>;
}
