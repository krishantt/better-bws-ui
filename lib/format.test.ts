import { describe, it, expect } from "vitest";
import { detectFormat, formatValue } from "./format";

describe("detectFormat", () => {
  describe("json", () => {
    it("detects a JSON object", () => expect(detectFormat('{"key":"value"}')).toBe("json"));
    it("detects a JSON array", () => expect(detectFormat("[1,2,3]")).toBe("json"));
    it("detects nested JSON", () => expect(detectFormat('{"a":{"b":1}}')).toBe("json"));
    it("detects an empty object", () => expect(detectFormat("{}")).toBe("json"));
    it("detects an empty array", () => expect(detectFormat("[]")).toBe("json"));
  });

  describe("dotenv", () => {
    it("detects KEY=VALUE pairs", () => expect(detectFormat("FOO=bar\nBAZ=qux")).toBe("dotenv"));
    it("detects single KEY=VALUE", () => expect(detectFormat("SECRET=abc123")).toBe("dotenv"));
    it("detects export prefix", () => expect(detectFormat("export FOO=bar")).toBe("dotenv"));
    it("ignores comment lines", () => expect(detectFormat("# comment\nFOO=bar")).toBe("dotenv"));
    it("allows values with spaces", () => expect(detectFormat("FOO=bar baz qux")).toBe("dotenv"));
    it("allows lowercase keys", () => expect(detectFormat("database_url=postgres://localhost")).toBe("dotenv"));
    it("allows empty values", () => expect(detectFormat("FOO=\nBAR=baz")).toBe("dotenv"));
    it("allows quoted values", () => expect(detectFormat('FOO="bar"\nBAZ=\'qux\'')).toBe("dotenv"));
    it("rejects if any line is not KEY=VALUE", () =>
      expect(detectFormat("FOO=bar\nnot a kv line")).not.toBe("dotenv"));
  });

  describe("yaml", () => {
    it("detects --- document header", () => expect(detectFormat("---\nfoo: bar")).toBe("yaml"));
    it("detects multiple key: value lines", () =>
      expect(detectFormat("foo: bar\nbaz: qux")).toBe("yaml"));
    it("detects nested yaml", () =>
      expect(detectFormat("foo:\n  bar: baz\n  qux: quux")).toBe("yaml"));
    it("detects yaml list", () =>
      expect(detectFormat("foo: bar\nitems:\n  - one\n  - two")).toBe("yaml"));
    it("does NOT flag a single key: value line as yaml", () =>
      expect(detectFormat("foo: bar")).not.toBe("yaml"));
  });

  describe("plaintext", () => {
    it("returns plaintext for empty string", () => expect(detectFormat("")).toBe("plaintext"));
    it("returns plaintext for plain text", () => expect(detectFormat("hello world")).toBe("plaintext"));
    it("returns plaintext for a URL", () => expect(detectFormat("https://example.com")).toBe("plaintext"));
    it("returns plaintext for a single colon line", () => expect(detectFormat("foo: bar")).toBe("plaintext"));
    it("returns plaintext for a UUID", () =>
      expect(detectFormat("550e8400-e29b-41d4-a716-446655440000")).toBe("plaintext"));
  });
});

describe("formatValue", () => {
  it("pretty-prints compact JSON", () => {
    const { text, format } = formatValue('{"a":1,"b":2}');
    expect(format).toBe("json");
    expect(text).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it("returns already-pretty JSON unchanged", () => {
    const pretty = '{\n  "a": 1\n}';
    const { text, format } = formatValue(pretty);
    expect(format).toBe("json");
    expect(text).toBe(pretty);
  });

  it("returns dotenv as-is", () => {
    const src = "FOO=bar\nBAZ=qux";
    const { text, format } = formatValue(src);
    expect(format).toBe("dotenv");
    expect(text).toBe(src);
  });

  it("returns yaml as-is", () => {
    const src = "foo: bar\nbaz: qux";
    const { text, format } = formatValue(src);
    expect(format).toBe("yaml");
    expect(text).toBe(src);
  });

  it("returns plaintext as-is", () => {
    const { text, format } = formatValue("just a password");
    expect(format).toBe("plaintext");
    expect(text).toBe("just a password");
  });
});
