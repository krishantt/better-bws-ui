"use client";

import { useState } from "react";

interface Props {
  onToken: (token: string) => void;
}

export default function TokenGate({ onToken }: Props) {
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    if (!value.trim()) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "x-bws-token": value.trim() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Authentication failed");
      onToken(value.trim());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">BWS Secret Manager</h1>
            <p className="text-sm text-gray-400">Enter your access token to continue</p>
          </div>
        </div>

        <input
          type="password"
          className={`w-full rounded-lg border bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none ${
            error ? "border-red-600 focus:border-red-500" : "border-gray-700 focus:border-blue-500"
          }`}
          placeholder="BWS access token"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleConnect()}
          disabled={checking}
        />

        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}

        <button
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
          disabled={!value.trim() || checking}
          onClick={handleConnect}
        >
          {checking ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Verifying…
            </>
          ) : (
            "Connect"
          )}
        </button>
      </div>
    </div>
  );
}
