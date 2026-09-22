import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
export async function GET() { const user = await getCurrentUser(); return NextResponse.json({ data: user ? { id: user.id, role: user.role, profile: user.profile } : null }); }
