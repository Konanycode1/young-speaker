import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

export const SESSION_COOKIE = "ys_session";
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { profile: true } } },
  });
  if (!session || session.expiresAt <= new Date() || session.user.deletedAt || session.user.blockedAt) return null;
  return session.user;
}

export async function deleteCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}
