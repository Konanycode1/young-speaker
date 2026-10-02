import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newThemeOrChallengeEmail, weeklyEngagementReminderEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/mailer";
import { formatDate } from "@/lib/dashboard";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3901";
const DAY_MS = 86_400_000;

// Appelée une fois par jour par une tâche planifiée externe (cron serveur ou
// service cron). Protégée par un jeton partagé, jamais accessible publiquement.
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || provided !== secret) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

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

  // --- 2. Rappels pour le thème en cours --------------------------------------
  const currentTheme = await db.weeklyTheme.findFirst({ where: { startsAt: { lte: now }, endsAt: { gte: now } }, orderBy: { startsAt: "desc" } });
  if (currentTheme) {
    const totalDays = Math.max(1, (currentTheme.endsAt.getTime() - currentTheme.startsAt.getTime()) / DAY_MS);
    const elapsed = (now.getTime() - currentTheme.startsAt.getTime()) / DAY_MS;
    const daysLeft = Math.max(0, Math.ceil((currentTheme.endsAt.getTime() - now.getTime()) / DAY_MS));
    const eligibleReminders: (1 | 2 | 3)[] = [];
    if (elapsed / totalDays >= 0.35) eligibleReminders.push(1);
    if (elapsed / totalDays >= 0.65) eligibleReminders.push(2);
    if (daysLeft <= 1) eligibleReminders.push(3);

    if (eligibleReminders.length > 0) {
      const activeChallenge = await db.challenge.findFirst({ where: { status: "ACTIVE", startsAt: { lte: now }, endsAt: { gte: now } }, orderBy: { endsAt: "asc" } });

      const candidates = await db.user.findMany({
        where: {
          role: "YOUNG_SPEAKER",
          deletedAt: null,
          blockedAt: null,
          articles: { none: { weeklyThemeId: currentTheme.id } },
          ...(activeChallenge ? { participations: { none: { challengeId: activeChallenge.id } } } : {}),
        },
        select: { id: true, email: true, profile: { select: { displayName: true } } },
      });

      const existingLogs = await db.engagementReminderLog.findMany({ where: { themeId: currentTheme.id, reminderNumber: { in: eligibleReminders } } });
      const alreadySent = new Set(existingLogs.map((log) => `${log.userId}:${log.reminderNumber}`));

      for (const candidate of candidates) {
        const nextReminder = eligibleReminders.find((number) => !alreadySent.has(`${candidate.id}:${number}`));
        if (!nextReminder) continue;
        const email = weeklyEngagementReminderEmail({
          displayName: candidate.profile?.displayName ?? "Young Speaker",
          reminderNumber: nextReminder,
          themeTitle: currentTheme.title,
          challengeTitle: activeChallenge?.title,
          daysLeft: Math.max(1, daysLeft),
          themeUrl: `${SITE_URL}/dashboard/new-article`,
          challengeUrl: activeChallenge ? `${SITE_URL}/challenges/${activeChallenge.slug}` : undefined,
        });
        await sendEmail({ to: candidate.email, subject: email.subject, html: email.html, text: email.text });
        await db.engagementReminderLog.create({ data: { userId: candidate.id, themeId: currentTheme.id, reminderNumber: nextReminder } });
        summary.reminders += 1;
      }
    }
  }

  return NextResponse.json({ data: summary });
}
