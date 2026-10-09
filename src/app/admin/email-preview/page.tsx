import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isStaff } from "@/lib/permissions";
import { newCommentEmail, newThemeOrChallengeEmail, newVoteEmail, weeklyEngagementReminderEmail, welcomeEmail } from "@/lib/email-templates";

export default async function EmailPreviewPage() {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) redirect("/admin");

  const samples = [
    { label: "Bienvenue — Young Speaker", email: welcomeEmail({ displayName: "Aya", isSpeaker: true }) },
    { label: "Bienvenue — Visiteur", email: welcomeEmail({ displayName: "Moussa", isSpeaker: false }) },
    { label: "Nouveau commentaire", email: newCommentEmail({ authorName: "Aya", articleTitle: "Pourquoi notre voix peut changer les choses", commenterName: "Léa", commentExcerpt: "Merci d'avoir partagé ça, ça me parle beaucoup.", articleUrl: "https://example.com/articles/exemple" }) },
    { label: "Nouveau vote", email: newVoteEmail({ authorName: "Aya", articleTitle: "Pourquoi notre voix peut changer les choses", voteCount: 12, articleUrl: "https://example.com/articles/exemple" }) },
    { label: "Nouveau thème de la semaine", email: newThemeOrChallengeEmail({ kind: "theme", title: "C'est quoi une amitié saine ?", description: "Partage ton regard sur ce qui rend une amitié solide, ou sur ce qui t'a appris à poser des limites.", endsAt: "5 octobre 2026", url: "https://example.com/themes/exemple" }) },
    { label: "Nouveau challenge", email: newThemeOrChallengeEmail({ kind: "challenge", title: "7 jours sans jugement", description: "Un petit défi concret pour progresser ensemble.", endsAt: "5 octobre 2026", url: "https://example.com/challenges/exemple" }) },
    { label: "Rappel mardi — thème + challenge manquants", email: weeklyEngagementReminderEmail({ displayName: "Aya", reminderNumber: 1, daysLeft: 5, themeTitle: "C'est quoi une amitié saine ?", themeUrl: "https://example.com/dashboard/new-article", missingTheme: true, challengeTitle: "7 jours sans jugement", challengeUrl: "https://example.com/challenges/exemple", missingChallenge: true }) },
    { label: "Rappel jeudi — thème seul manquant", email: weeklyEngagementReminderEmail({ displayName: "Aya", reminderNumber: 2, daysLeft: 3, themeTitle: "C'est quoi une amitié saine ?", themeUrl: "https://example.com/dashboard/new-article", missingTheme: true, challengeTitle: "7 jours sans jugement", challengeUrl: "https://example.com/challenges/exemple", missingChallenge: false }) },
    { label: "Rappel jeudi — challenge seul manquant", email: weeklyEngagementReminderEmail({ displayName: "Aya", reminderNumber: 2, daysLeft: 3, themeTitle: "C'est quoi une amitié saine ?", themeUrl: "https://example.com/dashboard/new-article", missingTheme: false, challengeTitle: "7 jours sans jugement", challengeUrl: "https://example.com/challenges/exemple", missingChallenge: true }) },
    { label: "Dernier rappel (vendredi)", email: weeklyEngagementReminderEmail({ displayName: "Aya", reminderNumber: 3, daysLeft: 1, themeTitle: "C'est quoi une amitié saine ?", themeUrl: "https://example.com/dashboard/new-article", missingTheme: true, challengeTitle: "7 jours sans jugement", challengeUrl: "https://example.com/challenges/exemple", missingChallenge: true }) },
  ];

  return <div className="container section">
    <div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Aperçu des emails</h1></div></div>
    <p className="helper-text">Prévisualisation des gabarits d’emails avec des données d’exemple. Ces emails ne sont pas encore envoyés automatiquement.</p>
    <div style={{ display: "grid", gap: "2rem", marginTop: "1.5rem" }}>
      {samples.map(({ label, email }) => <div className="panel" key={label}>
        <h2 style={{ marginBottom: ".3rem" }}>{label}</h2>
        <p className="helper-text" style={{ marginBottom: "1rem" }}>Objet : {email.subject}</p>
        <iframe title={label} srcDoc={email.html} style={{ width: "100%", height: "620px", border: "1px solid var(--border)", borderRadius: "12px", background: "#fff" }} />
      </div>)}
    </div>
  </div>;
}
