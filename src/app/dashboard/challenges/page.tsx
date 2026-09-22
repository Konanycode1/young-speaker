import { ChallengeAction } from "@/components/challenge-action";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatNumber, requireSpeaker } from "@/lib/dashboard";

export default async function MyChallengesPage() {
  const user = await requireSpeaker();
  const challenges = await db.challenge.findMany({ where: { OR: [{ status: "ACTIVE", endsAt: { gte: new Date() } }, { participations: { some: { userId: user.id } } }] }, include: { participations: { where: { userId: user.id } }, _count: { select: { participations: true } } }, orderBy: { endsAt: "asc" } });
  return <><div className="dash-head"><div><span className="eyebrow">Passer à l’action</span><h1>Mes challenges</h1></div><span className="status">{formatNumber(user.profile?.totalPoints ?? 0)} points</span></div><div className="dashboard-cards">{challenges.map((challenge) => { const participation = challenge.participations[0]; return <article className="panel dashboard-card" key={challenge.id}><span className="tag">{challenge.difficulty}</span><h2><Link href={`/challenges/${challenge.slug}`}>{challenge.title}</Link></h2><p>{challenge.description}</p><small>{challenge._count.participations} participant{challenge._count.participations !== 1 ? "s" : ""} · {challenge.points} points</small><ChallengeAction id={challenge.id} status={participation?.status} /></article>; })}{!challenges.length && <div className="empty-note">Aucun challenge actif pour le moment.</div>}</div></>;
}
