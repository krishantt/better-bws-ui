import { describe, it, expect } from "vitest";
import { validateToken } from "./bws";

describe("validateToken", () => {
  it("accepts a valid token", () => expect(validateToken("mytoken123")).toBe("mytoken123"));
  it("returns the token unchanged", () => {
    const t = "abc.def-ghi_123";
    expect(validateToken(t)).toBe(t);
  });

  it("rejects empty string", () => expect(() => validateToken("")).toThrow("Invalid access token"));
  it("rejects whitespace-only string", () => expect(() => validateToken("   ")).toThrow("Invalid access token"));
  it("rejects token containing a space", () => expect(() => validateToken("tok en")).toThrow("Invalid access token"));
  it("rejects token containing a tab", () => expect(() => validateToken("tok\ten")).toThrow("Invalid access token"));
  it("rejects token containing a newline", () => expect(() => validateToken("tok\nen")).toThrow("Invalid access token"));

  it("rejects null", () => expect(() => validateToken(null)).toThrow("Invalid access token"));
  it("rejects undefined", () => expect(() => validateToken(undefined)).toThrow("Invalid access token"));
  it("rejects a number", () => expect(() => validateToken(123)).toThrow("Invalid access token"));
  it("rejects an object", () => expect(() => validateToken({})).toThrow("Invalid access token"));
});
