import { spawnSync } from "child_process";

export interface BwsProject {
  id: string;
  name: string;
  organizationId: string;
  creationDate: string;
  revisionDate: string;
}

export interface BwsSecret {
  id: string;
  key: string;
  value: string;
  note: string;
  projectId: string | null;
  organizationId: string;
  creationDate: string;
  revisionDate: string;
}

// Token must be a non-empty string with no whitespace — reject anything else
// before it ever reaches the shell or Docker.
export function validateToken(token: unknown): string {
  if (typeof token !== "string" || token.trim() === "" || /\s/.test(token)) {
    throw new Error("Invalid access token");
  }
  return token;
}

function runBws(args: string[], token: string): string {
  const result = spawnSync(
    "docker",
    ["run", "--rm", "--mount", "type=tmpfs,destination=/root/.config", "-e", "BWS_ACCESS_TOKEN", "ghcr.io/bitwarden/bws", ...args, "--output", "json"],
    {
      encoding: "utf-8",
      timeout: 30000,
      // Token is passed via env, never interpolated into the command string.
      env: { ...process.env, BWS_ACCESS_TOKEN: token },
    }
  );

  if (result.error) throw result.error;

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";

  console.log("[bws]", "args:", args, "| status:", result.status);
  if (stderr) console.log("[bws stderr]\n", stderr);

  if (result.status !== 0) {
    const errLines = stderr.split("\n").filter(Boolean);
    const specific = errLines.find((l) => /error|invalid|unauthorized/i.test(l));
    throw new Error(specific || stderr.trim() || stdout.trim());
  }

  // BWS may print warning lines before the JSON on stdout — skip to first { or [.
  const lines = stdout.split("\n");
  const start = lines.findIndex((l) => /^\s*[{\[]/.test(l));
  if (start === -1) throw new Error(stderr.trim() || stdout.trim() || "No output from bws");
  return lines.slice(start).join("\n");
}

export function checkAuth(token: string): void {
  // Runs the cheapest read command; throws on bad token / network error.
  runBws(["project", "list"], token);
}

export function listProjects(token: string): BwsProject[] {
  return JSON.parse(runBws(["project", "list"], token));
}

export function listSecrets(token: string, projectId?: string): BwsSecret[] {
  const args = projectId ? ["secret", "list", projectId] : ["secret", "list"];
  return JSON.parse(runBws(args, token));
}

export function getSecret(token: string, id: string): BwsSecret {
  return JSON.parse(runBws(["secret", "get", id], token));
}

export function updateSecret(
  token: string,
  id: string,
  value: string,
  key?: string,
  note?: string
): BwsSecret {
  const args = ["secret", "edit", id, "--value", value];
  if (key) args.push("--key", key);
  if (note !== undefined) args.push("--note", note);
  return JSON.parse(runBws(args, token));
}
