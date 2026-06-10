import { NextResponse } from "next/server";

// Tells the client whether a server-side token is pre-configured.
// The token value itself is never sent to the browser.
export async function GET() {
  const hasToken = Boolean(process.env.BWS_ACCESS_TOKEN?.trim());
  return NextResponse.json({ hasToken });
}
