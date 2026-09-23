import Link from "next/link";
import { ArrowRight, MessageCircle, ThumbsUp } from "lucide-react";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { SettingsForm } from "@/components/settings-form";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/dashboard";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "MODERATOR") redirect("/admin");
  if (user.role === "YOUNG_SPEAKER") redirect("/dashboard");

  const [commentCount, voteCount, comments] = await Promise.all([
    db.comment.count({ where: { authorId: user.id, deletedAt: null } }),
    db.vote.count({ where: { userId: user.id } }),
    db.comment.findMany({
      where: { authorId: user.id, deletedAt: null },
      include: { article: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return <section className="container section account-space">
    <div className="dash-head">
      <div><span className="eyebrow">Bonjour {user.profile?.displayName} 👋</span><h1>Mon espace</h1><p>Retrouve ton activité et gère ton compte.</p></div>
      <Link className="button violet" href="/become-speaker">Devenir Speaker <ArrowRight size={17} /></Link>
    </div>

    <div className="stat-grid account-stats">
      <div className="stat-card"><MessageCircle size={19} /><small>Mes commentaires</small><b>{formatNumber(commentCount)}</b></div>
      <div className="stat-card"><ThumbsUp size={19} /><small>Mes votes</small><b>{formatNumber(voteCount)}</b></div>
    </div>

    <section className="panel">
      <div className="section-head compact"><h2>Mes derniers commentaires</h2><Link className="arrow-link" href="/account/comments">Tout voir <ArrowRight size={15} /></Link></div>
      {comments.length ? <div className="account-comments">{comments.map((comment) => {
        const slug = comment.article?.slug ?? comment.articleSlug;
        return <article key={comment.id}><p>{comment.content}</p><small>{formatDate(comment.createdAt)}{comment.article?.title ? ` · ${comment.article.title}` : ""}</small>{slug && <Link href={`/articles/${slug}`}>Voir la discussion</Link>}</article>;
      })}</div> : <div className="empty-note">Tu n’as pas encore commenté. Explore les voix de la communauté pour rejoindre une discussion.</div>}
    </section>

    {user.profile && <><div className="account-section-title"><span className="eyebrow">Identité</span><h2>Mon profil</h2></div><ProfileForm profile={user.profile} /></>}
    <div className="account-section-title"><span className="eyebrow">Compte et sécurité</span><h2>Mes paramètres</h2></div>
    <SettingsForm email={user.email} />
  </section>;
}
