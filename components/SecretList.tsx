"use client";

import type { BwsSecret } from "@/lib/bws";

interface Props {
  secrets: BwsSecret[];
  selectedId: string | null;
  onSelect: (secret: BwsSecret) => void;
  loading: boolean;
  search: string;
  onSearch: (v: string) => void;
}

function isJson(value: string) {
  try { JSON.parse(value); return true; } catch { return false; }
}

export default function SecretList({ secrets, selectedId, onSelect, loading, search, onSearch }: Props) {
  const filtered = secrets.filter((s) =>
    s.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full w-72 flex-shrink-0 flex-col border-r border-gray-800 bg-gray-950">
      <div className="border-b border-gray-800 p-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search secrets…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-800/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-gray-600">
            {search ? "No secrets match your search" : "No secrets in this project"}
          </p>
        ) : (
          filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                selectedId === s.id
                  ? "bg-blue-600/20 text-blue-300"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{s.key}</p>
                <p className="mt-0.5 truncate text-xs opacity-50">
                  {isJson(s.value) ? "{ JSON }" : "••••••••"}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
