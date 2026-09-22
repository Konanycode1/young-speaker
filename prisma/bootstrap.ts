import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const categories = ["Santé mentale", "Relations", "Éducation", "Société", "Développement personnel", "Autres"];
const badges = [
  ["Young Speaker", "young-speaker", "🎤", "Bienvenue dans la communauté des voix qui comptent."],
  ["Premier article", "premier-article", "✍️", "Ton premier texte a été soumis à la modération."],
  ["Speaker actif", "speaker-actif", "🔥", "Tu publies régulièrement et fais vivre la communauté."],
  ["Voice of Youth", "voice-of-youth", "💬", "Tes mots inspirent et ouvrent le dialogue."],
  ["Challenge Master", "challenge-master", "🏅", "Tu as mené un challenge jusqu’au bout."],
];
const challenges = [
  ["7 jours sans jugement", "7-jours-sans-jugement", "Pendant une semaine, remplace chaque jugement par une question bienveillante.", "Facile"],
  ["5 choses que j’aime chez moi", "5-choses-que-jaime", "Reconnais tes forces et partage-en une avec la communauté.", "Facile"],
  ["Démasque une infox", "demasque-une-infox", "Vérifie une information virale et explique ce que tu as découvert.", "Intermédiaire"],
];

async function main() {
  for (const name of categories) {
    const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await db.category.upsert({ where: { slug }, update: { name }, create: { name, slug } });
  }
  for (const [name, slug, icon, description] of badges) await db.badge.upsert({ where: { slug }, update: { name, icon, description }, create: { name, slug, icon, description } });
  const startsAt = new Date(); startsAt.setDate(startsAt.getDate() - 2);
  const endsAt = new Date(); endsAt.setDate(endsAt.getDate() + 5);
  await db.weeklyTheme.upsert({ where: { slug: "parler-sante-mentale" }, update: {}, create: { title: "Pourquoi est-il si difficile de parler de sa santé mentale ?", slug: "parler-sante-mentale", description: "Partage ton expérience, ton regard ou les solutions qui pourraient nous aider à mieux nous écouter.", startsAt, endsAt } });
  for (const [title, slug, description, difficulty] of challenges) await db.challenge.upsert({ where: { slug }, update: { title, description, difficulty }, create: { title, slug, description, difficulty, objective: "Passer à l’action avec bienveillance.", instructions: "Relève le défi à ton rythme puis marque-le comme terminé.", points: 50, startsAt, endsAt, status: "ACTIVE" } });
}

main().finally(() => db.$disconnect());
