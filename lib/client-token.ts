// "env" means the server uses process.env.BWS_ACCESS_TOKEN — don't send a header.
export function tokenHeaders(token: string): Record<string, string> {
  if (token === "env" || !token) return {};
  return { "x-bws-token": token };
}
