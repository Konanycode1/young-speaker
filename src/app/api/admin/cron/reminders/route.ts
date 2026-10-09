import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { runRemindersCron } from "@/lib/cron-reminders";
import { canManageSettings } from "@/lib/permissions";

// Déclenchement manuel depuis l'admin (ne pas attendre le prochain passage du
// cron). Réservé aux admins/super admins : exécute la même logique d'envoi
// que la tâche planifiée, donc envoie de vrais emails si des rappels sont dus.
export async function POST() {
  const user = await getCurrentUser();
  if (!user || !canManageSettings(user.role)) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const summary = await runRemindersCron();
  return NextResponse.json({ data: summary });
}
