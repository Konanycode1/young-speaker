import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CONTACT_EMAIL } from "@/lib/site";

const schema = z.object({ email: z.email(), password: z.string().min(8).max(72) });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 400 });
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || user.deletedAt || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }
  if (user.blockedAt) return NextResponse.json({ error: `Ton compte est suspendu. Pour en savoir plus, écris-nous à ${CONTACT_EMAIL}.` }, { status: 403 });
  await createSession(user.id);
  return NextResponse.json({ data: { role: user.role } });
}
