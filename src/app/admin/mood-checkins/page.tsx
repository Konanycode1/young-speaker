import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { MOOD_LABELS } from "@/lib/mood";
import { isStaff } from "@/lib/permissions";

export default async function AdminMoodCheckInsPage() {
  const actor = await getCurrentUser();
  if (!actor || !isStaff(actor.role)) redirect("/admin");

  const since = new Date();
  since.setDate(since.getDate() - 14);
  const checkIns = await db.moodCheckIn.findMany({
    where: { createdAt: { gte: since }, mood: { in: ["BAD", "VERY_BAD"] } },
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <div className="container section">
    <div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Bien-être</h1></div><span className={checkIns.length ? "status pending" : "status"}>{checkIns.length} point{checkIns.length !== 1 ? "s" : ""} difficile{checkIns.length !== 1 ? "s" : ""} (14 jours)</span></div>
    <p className="helper-text">Cette page ne montre que les points du jour marqués « Pas très bien » ou « Très mal », pour repérer qui pourrait avoir besoin de soutien. Les points positifs et neutres restent strictement privés et n’apparaissent jamais ici. Consulte l’historique complet d’une personne uniquement en cas de besoin réel.</p>
    <div className="panel">
      {checkIns.length ? <div className="mood-history">{checkIns.map((entry) => {
        const name = entry.user.profile?.displayName ?? entry.user.email;
        return <article key={entry.id} className="mood-history-item">
          <span className={`mood-dot mood-${entry.mood.toLowerCase()}`} />
          <div>
            <b>{name}</b> <small>— {MOOD_LABELS[entry.mood]} · {formatDate(entry.createdAt)}{entry.influences.length ? ` · ${entry.influences.join(", ")}` : ""}</small>
            {entry.note && <p>{entry.note}</p>}
            <Link className="text-link" href={`/admin/users/${entry.userId}/mood`}>Voir son historique complet</Link>
          </div>
        </article>;
      })}</div> : <div className="empty-note">Aucun point difficile signalé ces deux dernières semaines.</div>}
    </div>
  </div>;
}
