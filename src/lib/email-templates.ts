import { CONTACT_EMAIL } from "@/lib/site";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3901";
const BRAND = { ink: "#122f2c", muted: "#5c6f6a", mint: "#d8f5e6", green: "#1e705c", violet: "#7654d6", bg: "#fbfcf8", paper: "#ffffff", border: "#dfe8e3" };

type EmailContent = { subject: string; html: string; text: string };

function button(label: string, url: string, color: string = BRAND.violet) {
  return `<a href="${url}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 24px;border-radius:999px;margin-top:8px">${label}</a>`;
}

function layout({ preheader, title, bodyHtml, ctaLabel, ctaUrl, ctaColor }: { preheader: string; title: string; bodyHtml: string; ctaLabel?: string; ctaUrl?: string; ctaColor?: string }) {
  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.ink}">
  <span style="display:none;font-size:1px;color:${BRAND.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${preheader}</span>
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="display:inline-flex;align-items:center;gap:8px;font-weight:800;font-size:18px;color:${BRAND.ink}">
        <span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:${BRAND.ink};vertical-align:middle"></span>
        Young Speaker
      </span>
    </div>
    <div style="background:${BRAND.paper};border:1px solid ${BRAND.border};border-radius:20px;padding:32px">
      <h1 style="font-size:22px;margin:0 0 16px;letter-spacing:-.02em;color:${BRAND.ink}">${title}</h1>
      <div style="font-size:15px;line-height:1.65;color:${BRAND.ink}">${bodyHtml}</div>
      ${ctaLabel && ctaUrl ? `<div style="margin-top:24px">${button(ctaLabel, ctaUrl, ctaColor)}</div>` : ""}
    </div>
    <div style="text-align:center;margin-top:24px;font-size:12px;color:${BRAND.muted};line-height:1.6">
      Tu reçois cet email suite à ton activité sur Young Speaker.<br>
      Une question ? Écris-nous à <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND.green}">${CONTACT_EMAIL}</a>.
    </div>
  </div>
</body>
</html>`;
}

// 1. Bienvenue, envoyé juste après l'inscription.
export function welcomeEmail({ displayName, isSpeaker }: { displayName: string; isSpeaker: boolean }): EmailContent {
  const title = `Bienvenue, ${displayName} !`;
  const bodyHtml = isSpeaker
    ? `<p>Ton compte Young Speaker est prêt. Ici, tu peux publier tes idées, tes expériences et tes réalités, dans un espace pensé pour être sûr et bienveillant.</p>
       <p>Chaque texte est relu avant publication, et tu peux écrire sous pseudonyme si tu préfères. Pas besoin d'attendre d'avoir les mots parfaits : commence par ce qui te tient à cœur.</p>`
    : `<p>Ton compte Young Speaker est prêt. Tu peux dès maintenant lire les voix de la communauté, voter pour les textes qui te touchent et rejoindre la conversation en commentaire.</p>
       <p>Si un jour tu as envie de publier tes propres idées, tu pourras devenir Young Speaker en un clic depuis ton espace.</p>`;
  const ctaLabel = isSpeaker ? "Écrire mon premier article" : "Découvrir les articles";
  const ctaUrl = isSpeaker ? `${SITE_URL}/dashboard/new-article` : `${SITE_URL}/articles`;
  const html = layout({ preheader: "Ton compte Young Speaker est prêt.", title, bodyHtml, ctaLabel, ctaUrl });
  return { subject: `Bienvenue sur Young Speaker, ${displayName} !`, html, text: `Bienvenue ${displayName} ! Ton compte Young Speaker est prêt. ${ctaUrl}` };
}

// 2. Nouveau commentaire reçu sur un article.
export function newCommentEmail({ authorName, articleTitle, commenterName, commentExcerpt, articleUrl }: { authorName: string; articleTitle: string; commenterName: string; commentExcerpt: string; articleUrl: string }): EmailContent {
  const title = "Nouveau commentaire sur ton article";
  const bodyHtml = `<p>Bonjour ${authorName},</p>
    <p><b>${commenterName}</b> a réagi à ton article « ${articleTitle} » :</p>
    <blockquote style="margin:16px 0;padding:12px 16px;background:${BRAND.mint};border-radius:12px;color:${BRAND.ink};font-style:italic">« ${commentExcerpt} »</blockquote>
    <p>Ta voix continue de faire réagir la communauté.</p>`;
  const html = layout({ preheader: `${commenterName} a commenté « ${articleTitle} »`, title, bodyHtml, ctaLabel: "Voir la discussion", ctaUrl: articleUrl });
  return { subject: `${commenterName} a commenté ton article`, html, text: `${commenterName} a commenté « ${articleTitle} » : ${commentExcerpt} — ${articleUrl}` };
}

// 3. Nouveau vote reçu sur un article.
export function newVoteEmail({ authorName, articleTitle, voteCount, articleUrl }: { authorName: string; articleTitle: string; voteCount: number; articleUrl: string }): EmailContent {
  const title = "Ta voix compte, et ça se voit";
  const bodyHtml = `<p>Bonjour ${authorName},</p>
    <p>Ton article « ${articleTitle} » vient de recevoir un nouveau vote. Il totalise maintenant <b>${voteCount} vote${voteCount > 1 ? "s" : ""}</b> !</p>
    <p>Continue à écrire, tes mots trouvent leur public.</p>`;
  const html = layout({ preheader: `« ${articleTitle} » a un nouveau vote`, title, bodyHtml, ctaLabel: "Voir mon article", ctaUrl: articleUrl, ctaColor: BRAND.green });
  return { subject: `Ton article « ${articleTitle} » a un nouveau vote`, html, text: `« ${articleTitle} » totalise maintenant ${voteCount} votes — ${articleUrl}` };
}

// 4. Nouveau thème de la semaine ou nouveau challenge disponible.
export function newThemeOrChallengeEmail({ kind, title: itemTitle, description, endsAt, url }: { kind: "theme" | "challenge"; title: string; description: string; endsAt: string; url: string }): EmailContent {
  const title = kind === "theme" ? "Un nouveau thème de la semaine" : "Un nouveau challenge à relever";
  const bodyHtml = `<p>« <b>${itemTitle}</b> »</p>
    <p style="color:${BRAND.muted}">${description}</p>
    <p>Disponible jusqu'au ${endsAt}.</p>`;
  const ctaLabel = kind === "theme" ? "Écrire sur ce thème" : "Voir le challenge";
  const html = layout({ preheader: itemTitle, title, bodyHtml, ctaLabel, ctaUrl: url });
  return { subject: title, html, text: `${title} : « ${itemTitle} » — ${description} — ${url}` };
}

// 5. Rappels (x3) pour un Young Speaker n'ayant ni publié sur le thème en cours,
// ni participé au challenge en cours. reminderNumber va de 1 à 3.
export function weeklyEngagementReminderEmail({ displayName, reminderNumber, themeTitle, challengeTitle, daysLeft, themeUrl, challengeUrl }: { displayName: string; reminderNumber: 1 | 2 | 3; themeTitle: string; challengeTitle?: string; daysLeft: number; themeUrl: string; challengeUrl?: string }): EmailContent {
  const intros = [
    `Il reste ${daysLeft} jour${daysLeft > 1 ? "s" : ""} pour participer cette semaine.`,
    `Encore un peu de temps pour te lancer : ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}.`,
    `Dernière ligne droite : ${daysLeft} jour${daysLeft > 1 ? "s" : ""} avant la fin de la semaine.`,
  ] as const;
  const title = reminderNumber === 3 ? "Dernier appel pour cette semaine" : "Le thème de la semaine t'attend";
  const bodyHtml = `<p>Bonjour ${displayName},</p>
    <p>${intros[reminderNumber - 1]}</p>
    <p>Le thème « <b>${themeTitle}</b> » est toujours ouvert, et tu n'y as pas encore participé.</p>
    ${challengeTitle ? `<p>Le challenge « <b>${challengeTitle}</b> » est également disponible si tu préfères passer à l'action plutôt qu'à l'écriture.</p>` : ""}
    <p>Pas besoin d'un texte parfait : une expérience sincère suffit pour faire entendre ta voix.</p>`;
  const html = layout({ preheader: intros[reminderNumber - 1], title, bodyHtml, ctaLabel: "Écrire sur le thème", ctaUrl: themeUrl });
  return { subject: reminderNumber === 3 ? "Derniers jours pour participer cette semaine" : `Le thème « ${themeTitle} » t'attend`, html, text: `${intros[reminderNumber - 1]} Thème : ${themeTitle} — ${themeUrl}${challengeTitle && challengeUrl ? ` | Challenge : ${challengeTitle} — ${challengeUrl}` : ""}` };
}
