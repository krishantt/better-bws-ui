export type SecretFormat = "json" | "yaml" | "dotenv" | "plaintext";

export function detectFormat(value: string): SecretFormat {
  // JSON
  try { JSON.parse(value); return "json"; } catch {}

  const trimmed = value.trim();
  if (!trimmed) return "plaintext";

  const lines = trimmed.split("\n");

  // dotenv: every non-empty, non-comment line is KEY=VALUE (or export KEY=VALUE)
  const dataLines = lines.filter((l) => l.trim() && !l.trim().startsWith("#"));
  if (
    dataLines.length > 0 &&
    dataLines.every((l) => /^(export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=/.test(l.trim()))
  ) {
    return "dotenv";
  }

  // YAML: leading --- document marker, or at least 2 key: value lines
  if (trimmed.startsWith("---")) return "yaml";
  const yamlKeyLines = lines.filter((l) => /^\s*[\w-]+\s*:/.test(l));
  if (yamlKeyLines.length >= 2) return "yaml";

  return "plaintext";
}

// Returns the display text (pretty-prints JSON only) and the detected format.
export function formatValue(value: string): { text: string; format: SecretFormat } {
  const format = detectFormat(value);
  if (format === "json") {
    try {
      return { text: JSON.stringify(JSON.parse(value), null, 2), format };
    } catch {
      return { text: value, format: "plaintext" };
    }
  }
  return { text: value, format };
}

export const FORMAT_LABEL: Record<SecretFormat, string | null> = {
  json: "JSON",
  yaml: "YAML",
  dotenv: ".env",
  plaintext: null,
};

export const FORMAT_BADGE_CLASS: Record<SecretFormat, string> = {
  json: "bg-emerald-900/50 text-emerald-400",
  yaml: "bg-indigo-900/50 text-indigo-400",
  dotenv: "bg-amber-900/50 text-amber-400",
  plaintext: "",
};

export const FORMAT_MONACO_LANGUAGE: Record<SecretFormat, string> = {
  json: "json",
  yaml: "yaml",
  dotenv: "ini",
  plaintext: "plaintext",
};
