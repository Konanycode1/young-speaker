import { NextRequest, NextResponse } from "next/server";
import { runRemindersCron } from "@/lib/cron-reminders";

// Appelée une fois par jour par une tâche planifiée externe (cron serveur ou
// service cron). Protégée par un jeton partagé, jamais accessible publiquement.
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || provided !== secret) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const summary = await runRemindersCron();
  return NextResponse.json({ data: summary });
}
