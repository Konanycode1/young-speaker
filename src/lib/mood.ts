import type { Mood } from "@prisma/client";

export const MOOD_ORDER: Mood[] = ["VERY_GOOD", "GOOD", "NEUTRAL", "BAD", "VERY_BAD"];

export const MOOD_LABELS: Record<Mood, string> = {
  VERY_GOOD: "Très bien",
  GOOD: "Bien",
  NEUTRAL: "Moyen",
  BAD: "Pas très bien",
  VERY_BAD: "Très mal",
};

export const MOOD_COLORS: Record<Mood, string> = {
  VERY_GOOD: "#1e705c",
  GOOD: "#4fa98a",
  NEUTRAL: "#c9a227",
  BAD: "#d97a3f",
  VERY_BAD: "#c0533e",
};

// Une humeur difficile déclenche l'affichage des ressources d'écoute.
export const CONCERNING_MOODS: Mood[] = ["BAD", "VERY_BAD"];

export const INFLUENCE_TAGS = ["École", "Famille", "Amis", "Réseaux sociaux", "Santé", "Avenir / orientation", "Relation amoureuse", "Autre"];
