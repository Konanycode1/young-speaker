import { db } from "@/lib/db";
import { formatDate } from "@/lib/dashboard";
import { newThemeOrChallengeEmail, weeklyEngagementReminderEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/mailer";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3901";
const DAY_MS = 86_400_000;

// Logique partagée entre la tâche planifiée (/api/cron/reminders, jeton CRON_SECRET)
// et le déclenchement manuel depuis l'admin (/api/admin/cron/reminders, session staff).
export async function runRemindersCron() {
  const now = new Date();
  const summary = { announcements: 0, reminders: 0 };

  // --- 1. Annoncer les thèmes et challenges qui viennent de démarrer ---------
  const [newThemes, newChallenges, recipients] = await Promise.all([
    db.weeklyTheme.findMany({ where: { announcedAt: null, startsAt: { lte: now } } }),
    db.challenge.findMany({ where: { announcedAt: null, startsAt: { lte: now }, status: "ACTIVE" } }),
    db.user.findMany({ where: { deletedAt: null, blockedAt: null }, select: { id: true, email: true } }),
  ]);

  for (const theme of newThemes) {
    const email = newThemeOrChallengeEmail({ kind: "theme", title: theme.title, description: theme.description, endsAt: formatDate(theme.endsAt), url: `${SITE_URL}/themes/${theme.slug}` });
    await Promise.allSettled(recipients.map((recipient) => sendEmail({ to: recipient.email, subject: email.subject, html: email.html, text: email.text })));
    await db.weeklyTheme.update({ where: { id: theme.id }, data: { announcedAt: now } });
    summary.announcements += 1;
  }
  for (const challenge of newChallenges) {
    const email = newThemeOrChallengeEmail({ kind: "challenge", title: challenge.title, description: challenge.description, endsAt: formatDate(challenge.endsAt), url: `${SITE_URL}/challenges/${challenge.slug}` });
    await Promise.allSettled(recipients.map((recipient) => sendEmail({ to: recipient.email, subject: email.subject, html: email.html, text: email.text })));
    await db.challenge.update({ where: { id: challenge.id }, data: { announcedAt: now } });
    summary.announcements += 1;
  }

  // --- 2. Rappels pour le thème et le challenge en cours ----------------------
  // Jours fixes plutôt qu'une fraction du temps écoulé : mardi (1), jeudi (2),
  // vendredi (3, dernier appel). Envoyé à qui n'a pas encore écrit sur le thème
  // et/ou pas encore participé au challenge — les deux sont vérifiés à part,
  // donc avoir déjà fait l'un des deux n'empêche pas le rappel pour l'autre.
  const WEEKDAY_REMINDERS: Record<number, 1 | 2 | 3> = { 2: 1, 4: 2, 5: 3 };
  const reminderNumber = WEEKDAY_REMINDERS[now.getDay()];
  const currentTheme = await db.weeklyTheme.findFirst({ where: { startsAt: { lte: now }, endsAt: { gte: now } }, orderBy: { startsAt: "desc" } });

  if (currentTheme && reminderNumber) {
    const daysLeft = Math.max(1, Math.ceil((currentTheme.endsAt.getTime() - now.getTime()) / DAY_MS));
    const activeChallenge = await db.challenge.findFirst({ where: { status: "ACTIVE", startsAt: { lte: now }, endsAt: { gte: now } }, orderBy: { endsAt: "asc" } });

    const candidates = await db.user.findMany({
      where: {
        role: "YOUNG_SPEAKER",
        deletedAt: null,
        blockedAt: null,
        OR: [
          { articles: { none: { weeklyThemeId: currentTheme.id } } },
          ...(activeChallenge ? [{ participations: { none: { challengeId: activeChallenge.id } } }] : []),
        ],
      },
      select: {
        id: true,
        email: true,
        profile: { select: { displayName: true } },
        articles: { where: { weeklyThemeId: currentTheme.id }, select: { id: true }, take: 1 },
        participations: { where: { challengeId: activeChallenge?.id ?? "__none__" }, select: { id: true }, take: 1 },
      },
    });

    const existingLogs = await db.engagementReminderLog.findMany({ where: { themeId: currentTheme.id, reminderNumber } });
    const alreadySent = new Set(existingLogs.map((log) => log.userId));

    for (const candidate of candidates) {
      if (alreadySent.has(candidate.id)) continue;
      const missingTheme = candidate.articles.length === 0;
      const missingChallenge = Boolean(activeChallenge) && candidate.participations.length === 0;
      if (!missingTheme && !missingChallenge) continue;

      const email = weeklyEngagementReminderEmail({
        displayName: candidate.profile?.displayName ?? "Young Speaker",
        reminderNumber,
        daysLeft,
        themeTitle: currentTheme.title,
        themeUrl: `${SITE_URL}/themes`,
        missingTheme,
        challengeTitle: activeChallenge?.title,
        challengeUrl: activeChallenge ? `${SITE_URL}/challenges` : undefined,
        missingChallenge,
      });
      await sendEmail({ to: candidate.email, subject: email.subject, html: email.html, text: email.text });
      await db.engagementReminderLog.create({ data: { userId: candidate.id, themeId: currentTheme.id, reminderNumber } });
      summary.reminders += 1;
    }
  }

  return summary;
}
