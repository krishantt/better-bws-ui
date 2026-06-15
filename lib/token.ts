import { validateToken } from "./bws";
import { NextRequest } from "next/server";

export function resolveToken(req: NextRequest): string {
  // When an env token is configured it is authoritative — reject caller-supplied headers
  // to prevent this server from acting as an open proxy to arbitrary BWS accounts.
  const envToken = process.env.BWS_ACCESS_TOKEN?.trim();
  if (envToken) return validateToken(envToken);
  const header = req.headers.get("x-bws-token");
  return validateToken(header);
}
