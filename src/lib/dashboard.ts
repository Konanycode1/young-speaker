import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";

export const statusLabels = { DRAFT: "Brouillon", PENDING_REVIEW: "En attente", APPROVED: "Publié", REJECTED: "Refusé", ARCHIVED: "Archivé" } as const;

export async function requireSpeaker() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role !== "YOUNG_SPEAKER") redirect("/articles?notice=speaker-required");
  return user;
}

export const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);
export const formatDate = (value: Date) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(value);
