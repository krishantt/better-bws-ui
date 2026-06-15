import { NextResponse } from "next/server";

export async function GET() {
  const projectId = process.env.BWS_PROJECT_ID?.trim() || null;
  return NextResponse.json({ projectId });
}
