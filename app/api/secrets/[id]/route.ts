import { NextRequest, NextResponse } from "next/server";
import { getSecret, updateSecret } from "@/lib/bws";
import { resolveToken } from "@/lib/token";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let token: string;
  try {
    token = resolveToken(req);
  } catch {
    return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const secret = getSecret(token, id);
    return NextResponse.json(secret);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let token: string;
  try {
    token = resolveToken(req);
  } catch {
    return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = updateSecret(token, id, body.value, body.key, body.note);
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
