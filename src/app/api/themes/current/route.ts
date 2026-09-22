import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const now = new Date();
  const theme = await db.weeklyTheme.findFirst({
    where: { startsAt: { lte: now }, endsAt: { gte: now } },
    include: { articles: { where: { status: "APPROVED", deletedAt: null }, select: { id: true, voteCount: true } } },
    orderBy: { startsAt: "desc" },
  });
  return NextResponse.json({ data: theme });
}
