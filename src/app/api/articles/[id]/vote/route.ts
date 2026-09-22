import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const VISITOR_COOKIE = "ys_visitor";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await db.article.findFirst({ where: { OR: [{ id }, { slug: id }], status: "APPROVED", deletedAt: null }, select: { id: true } });
  if (!article) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  const user = await getCurrentUser();
  const visitorToken = request.cookies.get(VISITOR_COOKIE)?.value ?? randomUUID();
  try {
    const [, updated] = await db.$transaction([
      db.vote.create({ data: { articleId: article.id, ...(user ? { userId: user.id } : { sessionHash: hash(visitorToken) }) } }),
      db.article.update({ where: { id: article.id }, data: { voteCount: { increment: 1 } }, select: { voteCount: true } }),
    ]);
    const response = NextResponse.json({ data: { count: updated.voteCount } }, { status: 201 });
    if (!user && !request.cookies.has(VISITOR_COOKIE)) response.cookies.set(VISITOR_COOKIE, visitorToken, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Vote déjà enregistré." }, { status: 409 });
    throw error;
  }
}
