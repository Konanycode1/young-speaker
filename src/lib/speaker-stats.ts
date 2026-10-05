import { db } from "@/lib/db";
import { avatarColor, initials } from "@/lib/utils";

export async function getSpeakerStats() {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const users = await db.user.findMany({
    where: { role: "YOUNG_SPEAKER", deletedAt: null, profile: { isNot: null } },
    include: {
      profile: true,
      articles: {
        where: { status: "APPROVED", deletedAt: null },
        select: { voteCount: true, votes: { where: { createdAt: { gte: weekStart } }, select: { id: true } } },
      },
      badges: { include: { badge: true }, orderBy: { awardedAt: "desc" }, take: 1 },
    },
  });
  return users.map((user) => {
    const profile = user.profile!;
    return {
      name: profile.displayName,
      username: profile.username,
      initials: initials(profile.displayName),
      color: avatarColor(profile.username),
      bio: profile.bio || "Une nouvelle voix dans la communauté Young Speaker.",
      articles: user.articles.length,
      votes: user.articles.reduce((total, article) => total + article.voteCount, 0),
      weeklyVotes: user.articles.reduce((total, article) => total + article.votes.length, 0),
      badge: user.badges[0]?.badge.name ?? "Young Speaker",
    };
  }).sort((first, second) => second.votes - first.votes || second.articles - first.articles || first.name.localeCompare(second.name, "fr"));
}
