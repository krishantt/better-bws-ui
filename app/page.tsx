"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BwsProject, BwsSecret } from "@/lib/bws";
import { tokenHeaders } from "@/lib/client-token";
import TokenGate from "@/components/TokenGate";
import ProjectTree from "@/components/ProjectTree";
import SecretList from "@/components/SecretList";
import SecretEditor from "@/components/SecretEditor";

// Cache key: null → "all", projectId → that id
const ALL_KEY = "__all__";

export default function Home() {
  // null = not authed, "env" = using server env token, string = user-provided token
  const [token, setToken] = useState<string | null>(null);
  const [envTokenChecked, setEnvTokenChecked] = useState(false);
  const [projects, setProjects] = useState<BwsProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSecret, setSelectedSecret] = useState<BwsSecret | null>(null);
  const [search, setSearch] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Per-project secret cache: key → BwsSecret[]
  const secretCache = useRef<Map<string, BwsSecret[]>>(new Map());
  const cacheTimestamps = useRef<Map<string, number>>(new Map());
  const CACHE_TTL = 60_000;
  const [displayedSecrets, setDisplayedSecrets] = useState<BwsSecret[]>([]);

  const fetchProjects = useCallback(async (t: string) => {
    setLoadingProjects(true);
    setGlobalError(null);
    try {
      const res = await fetch("/api/projects", { headers: tokenHeaders(t) });
      if (!res.ok) throw new Error((await res.json()).error ?? res.statusText);
      setProjects(await res.json());
    } catch (e: unknown) {
      setGlobalError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const fetchSecrets = useCallback(async (t: string, projectId?: string) => {
    const cacheKey = projectId ?? ALL_KEY;

    const ts = cacheTimestamps.current.get(cacheKey);
    const cached = secretCache.current.get(cacheKey);
    if (cached && ts !== undefined && Date.now() - ts < CACHE_TTL) {
      setDisplayedSecrets(cached);
      return;
    }

    setLoadingSecrets(true);
    setSelectedSecret(null);
    try {
      const url = projectId ? `/api/secrets?projectId=${projectId}` : "/api/secrets";
      const res = await fetch(url, { headers: tokenHeaders(t) });
      if (!res.ok) throw new Error((await res.json()).error ?? res.statusText);
      const data: BwsSecret[] = await res.json();
      secretCache.current.set(cacheKey, data);
      cacheTimestamps.current.set(cacheKey, Date.now());
      setDisplayedSecrets(data);
    } catch (e: unknown) {
      setGlobalError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingSecrets(false);
    }
  }, []);

  // Check if server has BWS_ACCESS_TOKEN set; auto-connect if so.
  useEffect(() => {
    fetch("/api/env-token")
      .then((r) => r.json())
      .then(({ hasToken }) => {
        if (hasToken) setToken("env");
      })
      .catch(() => {})
      .finally(() => setEnvTokenChecked(true));
  }, []);

  useEffect(() => {
    if (!token || !envTokenChecked) return;
    fetchProjects(token);
    fetchSecrets(token);
  }, [token, envTokenChecked, fetchProjects, fetchSecrets]);

  function handleProjectSelect(id: string | null) {
    setSelectedProjectId(id);
    setSearch("");
    if (token) fetchSecrets(token, id ?? undefined);
  }

  function handleSecretSaved(updated: BwsSecret) {
    // Update every cache bucket that contains this secret.
    for (const [key, list] of secretCache.current.entries()) {
      const idx = list.findIndex((s) => s.id === updated.id);
      if (idx !== -1) {
        const next = [...list];
        next[idx] = updated;
        secretCache.current.set(key, next);
      }
    }
    setDisplayedSecrets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedSecret(updated);
  }

  function handleDisconnect() {
    setToken(null);
    setProjects([]);
    setDisplayedSecrets([]);
    setSelectedSecret(null);
    secretCache.current.clear();
    cacheTimestamps.current.clear();
  }

  if (!envTokenChecked) return null; // wait for env check before showing anything
  if (!token) return <TokenGate onToken={setToken} />;

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white">
      <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-sm font-semibold">BWS Secret Manager</span>
        </div>
        {token !== "env" && (
          <button
            onClick={handleDisconnect}
            className="rounded px-3 py-1 text-xs text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          >
            Disconnect
          </button>
        )}
      </header>

      {globalError && (
        <div className="border-b border-red-900 bg-red-950/60 px-4 py-2 text-xs text-red-400">
          {globalError}
          <button className="ml-3 underline" onClick={() => setGlobalError(null)}>dismiss</button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <ProjectTree
          projects={projects}
          selectedId={selectedProjectId}
          onSelect={handleProjectSelect}
          loading={loadingProjects}
        />

        <SecretList
          secrets={displayedSecrets}
          selectedId={selectedSecret?.id ?? null}
          onSelect={setSelectedSecret}
          loading={loadingSecrets}
          search={search}
          onSearch={setSearch}
        />

        <main className="min-w-0 flex-1">
          {selectedSecret ? (
            <SecretEditor
              key={selectedSecret.id}
              secret={selectedSecret}
              token={token}
              onSaved={handleSecretSaved}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-10 w-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <p className="mt-3 text-sm text-gray-600">Select a secret to edit</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
