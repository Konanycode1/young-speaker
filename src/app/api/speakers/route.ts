import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const users = await db.user.findMany({
    where: { role: "YOUNG_SPEAKER", deletedAt: null, profile: { isNot: null } },
    include: {
      profile: true,
      articles: { where: { status: "APPROVED", deletedAt: null }, select: { voteCount: true } },
      badges: { include: { badge: true }, orderBy: { awardedAt: "desc" }, take: 1 },
    },
  });
  const data = users.map((user) => ({
    id: user.id,
    profile: user.profile,
    articleCount: user.articles.length,
    voteCount: user.articles.reduce((total, article) => total + article.voteCount, 0),
    badge: user.badges[0]?.badge ?? null,
  }));
  return NextResponse.json({ data });
}
