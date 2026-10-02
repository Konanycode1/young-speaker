import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MoodCheckInForm } from "@/components/mood-checkin-form";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dashboard";
import { MOOD_LABELS } from "@/lib/mood";

export const metadata: Metadata = { title: "Comment vas-tu ?", description: "Un moment pour toi : fais le point sur ton humeur, en toute confidentialité." };

export default async function MoodCheckInPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/comment-vas-tu");

  const history = await db.moodCheckIn.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 7 });

  return <>
    <section className="page-hero container"><span className="eyebrow">Un espace pour toi</span><h1>Comment vas-tu ?</h1><p>Prends trente secondes pour toi. Ce que tu écris ici reste privé — visible seulement par toi.</p></section>
    <section className="container section" style={{ paddingTop: 0, maxWidth: 700, margin: "0 auto" }}>
      <MoodCheckInForm />
      {history.length > 0 && <section className="panel">
        <h2>Tes derniers points</h2>
        <div className="mood-history">{history.map((entry) => <article key={entry.id} className="mood-history-item">
          <span className={`mood-dot mood-${entry.mood.toLowerCase()}`} />
          <div><b>{MOOD_LABELS[entry.mood]}</b><small>{formatDate(entry.createdAt)}{entry.influences.length ? ` · ${entry.influences.join(", ")}` : ""}</small>{entry.note && <p>{entry.note}</p>}</div>
        </article>)}</div>
      </section>}
    </section>
  </>;
}
