import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { MOOD_LABELS } from "@/lib/mood";
import { isStaff } from "@/lib/permissions";

export default async function UserMoodHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getCurrentUser();
  if (!actor || !isStaff(actor.role)) redirect("/admin");
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, include: { profile: true } });
  if (!user) notFound();

  const history = await db.moodCheckIn.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 60 });

  return <div className="container section">
    <Link className="arrow-link" href="/admin/users"><ArrowLeft size={16} /> Tous les utilisateurs</Link>
    <div className="dash-head"><div><span className="eyebrow">Suivi bien-être</span><h1>{user.profile?.displayName ?? user.email}</h1></div></div>
    <p className="helper-text">Cet historique est strictement personnel : consulte-le uniquement en cas de besoin réel (signalement, inquiétude), jamais par curiosité. Il ne remplace pas un accompagnement professionnel.</p>
    <div className="panel">
      {history.length ? <div className="mood-history">{history.map((entry) => <article key={entry.id} className="mood-history-item">
        <span className={`mood-dot mood-${entry.mood.toLowerCase()}`} />
        <div><b>{MOOD_LABELS[entry.mood]}</b><small>{formatDate(entry.createdAt)}{entry.influences.length ? ` · ${entry.influences.join(", ")}` : ""}</small>{entry.note && <p>{entry.note}</p>}</div>
      </article>)}</div> : <div className="empty-note">Aucun point du jour enregistré pour cette personne.</div>}
    </div>
  </div>;
}
