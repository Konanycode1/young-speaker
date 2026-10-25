import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Fait passer un compte VISITOR en YOUNG_SPEAKER, en place (même compte,
// mêmes commentaires et votes conservés) plutôt que de pousser l'utilisateur
// à recréer un second compte via /register.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour continuer." }, { status: 401 });
  if (user.role !== "VISITOR") return NextResponse.json({ error: "Ce compte n’est pas un compte visiteur." }, { status: 409 });

  await db.user.update({ where: { id: user.id }, data: { role: "YOUNG_SPEAKER" } });
  return NextResponse.json({ data: { role: "YOUNG_SPEAKER" } });
}
