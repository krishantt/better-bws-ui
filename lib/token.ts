import { validateToken } from "./bws";
import { NextRequest } from "next/server";

export function resolveToken(req: NextRequest): string {
  const header = req.headers.get("x-bws-token");
  const envToken = process.env.BWS_ACCESS_TOKEN;
  return validateToken(header || envToken);
}
