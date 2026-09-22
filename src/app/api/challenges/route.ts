import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const challenges = await db.challenge.findMany({
    where: { status: "ACTIVE", endsAt: { gte: new Date() } },
    select: {
      id: true, title: true, slug: true, description: true, objective: true,
      instructions: true, difficulty: true, reward: true, points: true,
      startsAt: true, endsAt: true, _count: { select: { participations: true } },
    },
    orderBy: { endsAt: "asc" },
  });
  return NextResponse.json({ data: challenges });
}
