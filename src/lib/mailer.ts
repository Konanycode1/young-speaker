import nodemailer from "nodemailer";
import { CONTACT_EMAIL } from "@/lib/site";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 465),
    secure: Number(SMTP_PORT ?? 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  const client = getTransporter();
  if (!client) {
    console.warn(`[mailer] SMTP non configuré : email « ${subject} » à ${to} non envoyé.`);
    return;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  try {
    await client.sendMail({
      from,
      to,
      subject,
      html,
      text,
      // Un en-tête List-Unsubscribe (même en mailto:) est un signal de confiance
      // pour les filtres antispam, en plus d'être exigé par Gmail pour les gros envois.
      headers: { "List-Unsubscribe": `<mailto:${CONTACT_EMAIL}?subject=Se%20d%C3%A9sabonner>` },
    });
  } catch (error) {
    // Un envoi d'email en échec ne doit jamais faire échouer l'action de l'utilisateur
    // (commenter, voter, s'inscrire...) qui en est à l'origine.
    console.error(`[mailer] Échec d’envoi à ${to} :`, error);
  }
}
