import { NextRequest, NextResponse } from "next/server";
import { listProjects } from "@/lib/bws";
import { resolveToken } from "@/lib/token";

export async function GET(req: NextRequest) {
  let token: string;
  try {
    token = resolveToken(req);
  } catch {
    return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
  }
  try {
    const projects = await listProjects(token);
    return NextResponse.json(projects);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
