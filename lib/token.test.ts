import { describe, it, expect, vi, afterEach } from "vitest";
import { resolveToken } from "./token";
import type { NextRequest } from "next/server";

// Duck-type a minimal NextRequest — resolveToken only calls req.headers.get().
function req(token?: string): NextRequest {
  return {
    headers: { get: (k: string) => (k === "x-bws-token" ? (token ?? null) : null) },
  } as unknown as NextRequest;
}

afterEach(() => { vi.unstubAllEnvs(); });

describe("resolveToken", () => {
  describe("when BWS_ACCESS_TOKEN env is set", () => {
    it("returns the env token regardless of no header", () => {
      vi.stubEnv("BWS_ACCESS_TOKEN", "env-token-123");
      expect(resolveToken(req())).toBe("env-token-123");
    });

    it("ignores a caller-supplied header and uses env token", () => {
      vi.stubEnv("BWS_ACCESS_TOKEN", "env-token-123");
      expect(resolveToken(req("caller-token"))).toBe("env-token-123");
    });

    it("trims the env token before using it", () => {
      vi.stubEnv("BWS_ACCESS_TOKEN", "  env-token-123  ");
      // trim happens inside resolveToken before validateToken
      expect(resolveToken(req())).toBe("env-token-123");
    });

    it("throws when env token is whitespace-only", () => {
      vi.stubEnv("BWS_ACCESS_TOKEN", "   ");
      // trim results in empty string → falls through to header path → no header → throws
      expect(() => resolveToken(req())).toThrow("Invalid access token");
    });
  });

  describe("when BWS_ACCESS_TOKEN env is not set", () => {
    it("uses the x-bws-token header", () => {
      vi.stubEnv("BWS_ACCESS_TOKEN", "");
      expect(resolveToken(req("header-token-abc"))).toBe("header-token-abc");
    });

    it("throws when header is absent", () => {
      vi.stubEnv("BWS_ACCESS_TOKEN", "");
      expect(() => resolveToken(req())).toThrow("Invalid access token");
    });

    it("throws when header contains whitespace", () => {
      vi.stubEnv("BWS_ACCESS_TOKEN", "");
      expect(() => resolveToken(req("bad token"))).toThrow("Invalid access token");
    });
  });
});
