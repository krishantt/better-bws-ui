import { NextRequest, NextResponse } from "next/server";
import { listProjects } from "@/lib/bws";
import { resolveToken } from "@/lib/token";

export async function POST(req: NextRequest) {
  let token: string;
  try {
    token = resolveToken(req);
  } catch {
    return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
  }
  try {
    await listProjects(token);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = /unauthorized|invalid|access.denied/i.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
