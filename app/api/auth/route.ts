import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/bws";
import { resolveToken } from "@/lib/token";

export async function POST(req: NextRequest) {
  try {
    const token = resolveToken(req);
    checkAuth(token);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
