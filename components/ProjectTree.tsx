"use client";

import type { BwsProject } from "@/lib/bws";

interface Props {
  projects: BwsProject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  loading: boolean;
}

export default function ProjectTree({ projects, selectedId, onSelect, loading }: Props) {
  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-gray-800 bg-gray-900">
      <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-3">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span className="text-sm font-medium text-gray-300">Projects</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-1 p-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-gray-800" />
            ))}
          </div>
        ) : (
          <>
            <button
              onClick={() => onSelect(null)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                selectedId === null
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              All secrets
            </button>

            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  selectedId === p.id
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
