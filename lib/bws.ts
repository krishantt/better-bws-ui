import { execFile } from "child_process";

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

function runBws(args: string[], token: string): Promise<string> {
  const sanitized = args.map((a, i) =>
    i > 0 && ["--value", "--note"].includes(args[i - 1]) ? "[redacted]" : a
  );

  return new Promise((resolve, reject) => {
    execFile(
      "bws",
      [...args, "--output", "json"],
      {
        encoding: "utf-8",
        timeout: 30000,
        // HOME=/tmp prevents bws from reading/writing cached auth state
        // across requests — keeps each call stateless.
        env: { ...process.env, BWS_ACCESS_TOKEN: token, HOME: "/tmp" },
      },
      (error, stdout, stderr) => {
        console.log("[bws]", sanitized.join(" "), "|", error ? `FAILED (${error.code ?? error.message})` : "OK");
        if (stderr) console.log("[bws stderr]\n", stderr);

        if (error) {
          const errLines = (stderr ?? "").split("\n").filter(Boolean);
          const specific = errLines.find((l) => /error|invalid|unauthorized/i.test(l));
          reject(new Error(specific || (stderr ?? "").trim() || (stdout ?? "").trim() || error.message));
          return;
        }

        const lines = (stdout ?? "").split("\n");
        const start = lines.findIndex((l) => /^\s*[{\[]/.test(l));
        if (start === -1) {
          reject(new Error((stderr ?? "").trim() || (stdout ?? "").trim() || "No output from bws"));
          return;
        }
        resolve(lines.slice(start).join("\n"));
      }
    );
  });
}

export async function listProjects(token: string): Promise<BwsProject[]> {
  return JSON.parse(await runBws(["project", "list"], token));
}

export async function listSecrets(token: string, projectId?: string): Promise<BwsSecret[]> {
  const args = projectId ? ["secret", "list", projectId] : ["secret", "list"];
  return JSON.parse(await runBws(args, token));
}

export async function getSecret(token: string, id: string): Promise<BwsSecret> {
  return JSON.parse(await runBws(["secret", "get", id], token));
}

export async function updateSecret(
  token: string,
  id: string,
  value: string,
  key?: string,
  note?: string
): Promise<BwsSecret> {
  const args = ["secret", "edit", id, "--value", value];
  if (key !== undefined) args.push("--key", key);
  if (note !== undefined) args.push("--note", note);
  return JSON.parse(await runBws(args, token));
}
