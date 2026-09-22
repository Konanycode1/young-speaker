import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const username = (process.env.SUPER_ADMIN_USERNAME?.trim().toLowerCase() || "admin").replace(/[^\p{L}\p{N}._-]/gu, "-");
  const displayName = process.env.SUPER_ADMIN_DISPLAY_NAME?.trim() || "Super administration Young Speaker";

  if (!email) throw new Error("SUPER_ADMIN_EMAIL est requis.");
  if (!password || password.length < 8 || password.length > 72) throw new Error("SUPER_ADMIN_PASSWORD doit contenir entre 8 et 72 caractères.");
  if (username.length < 3 || username.length > 30) throw new Error("SUPER_ADMIN_USERNAME doit contenir entre 3 et 30 caractères.");

  const passwordHash = await bcrypt.hash(password, 12);
  const account = await db.$transaction(async (transaction) => {
    const existing = await transaction.user.findUnique({ where: { email }, include: { profile: true } });
    const usernameOwner = await transaction.profile.findUnique({ where: { username } });
    if (usernameOwner && usernameOwner.userId !== existing?.id) throw new Error(`Le pseudonyme « ${username} » appartient déjà à un autre compte.`);

    const user = existing
      ? await transaction.user.update({ where: { id: existing.id }, data: { passwordHash, role: "SUPER_ADMIN", deletedAt: null } })
      : await transaction.user.create({ data: { email, passwordHash, role: "SUPER_ADMIN" } });

    await transaction.profile.upsert({
      where: { userId: user.id },
      update: { username, displayName },
      create: { userId: user.id, username, displayName, interests: ["Administration", "Modération", "Communauté"] },
    });
    await transaction.session.deleteMany({ where: { userId: user.id } });
    return user;
  });

  console.log(`Super-admin prêt : ${account.email}`);
}

main()
  .catch((error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") console.error("Email ou pseudonyme déjà utilisé.");
    else console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
