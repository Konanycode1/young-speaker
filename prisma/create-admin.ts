import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD (8 caractères minimum) sont requis.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await db.user.findUnique({ where: { email } });
  const user = existing
    ? await db.user.update({ where: { email }, data: { role: "SUPER_ADMIN", passwordHash, deletedAt: null } })
    : await db.user.create({ data: { email, role: "SUPER_ADMIN", passwordHash } });
  await db.profile.upsert({
    where: { userId: user.id },
    update: { displayName: "Administration Young Speaker" },
    create: { userId: user.id, username: "admin", displayName: "Administration Young Speaker", interests: ["Modération", "Communauté"] },
  });
  await db.session.deleteMany({ where: { userId: user.id } });
  console.log(`Compte administrateur prêt : ${email}`);
}

main().finally(() => db.$disconnect());
