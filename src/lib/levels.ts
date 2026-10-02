export const LEVELS = [
  { threshold: 0, name: "Débutant·e" },
  { threshold: 100, name: "Engagé·e" },
  { threshold: 300, name: "Ambassadeur·rice" },
  { threshold: 600, name: "Voix inspirante" },
  { threshold: 1200, name: "Légende Young Speaker" },
] as const;

export function getLevel(points: number) {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  let next: (typeof LEVELS)[number] | null = null;
  for (let index = 0; index < LEVELS.length; index += 1) {
    if (points >= LEVELS[index].threshold) {
      current = LEVELS[index];
      next = LEVELS[index + 1] ?? null;
    }
  }
  const progress = next ? Math.min(100, Math.round(((points - current.threshold) / (next.threshold - current.threshold)) * 100)) : 100;
  return { name: current.name, next: next?.name ?? null, pointsToNext: next ? next.threshold - points : 0, progress };
}
