"use client";

import { useEffect, useRef, useState } from "react";
import type { BwsSecret } from "@/lib/bws";
import dynamic from "next/dynamic";
import { tokenHeaders } from "@/lib/client-token";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Props {
  secret: BwsSecret;
  token: string;
  onSaved: (updated: BwsSecret) => void;
}

function tryFormat(value: string): { text: string; isJson: boolean } {
  try {
    return { text: JSON.stringify(JSON.parse(value), null, 2), isJson: true };
  } catch {
    return { text: value, isJson: false };
  }
}

export default function SecretEditor({ secret, token, onSaved }: Props) {
  const { text: formatted, isJson } = tryFormat(secret.value);
  const [editorValue, setEditorValue] = useState(formatted);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const originalRef = useRef(formatted);

  useEffect(() => {
    const { text } = tryFormat(secret.value);
    setEditorValue(text);
    originalRef.current = text;
    setError(null);
    setSaved(false);
  }, [secret.id, secret.value]);

  const isDirty = editorValue !== originalRef.current;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      let valueToSave = editorValue;
      if (isJson) {
        valueToSave = JSON.stringify(JSON.parse(editorValue), null, 2);
      }
      const res = await fetch(`/api/secrets/${secret.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", ...tokenHeaders(token) },
        body: JSON.stringify({ value: valueToSave }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? res.statusText);
      }
      const updated: BwsSecret = await res.json();
      onSaved(updated);
      originalRef.current = editorValue;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{secret.key}</p>
          <p className="mt-0.5 text-xs text-gray-500">{secret.id}</p>
        </div>
        <div className="ml-4 flex items-center gap-2">
          {isJson && (
            <span className="rounded bg-emerald-900/50 px-2 py-0.5 text-xs font-medium text-emerald-400">JSON</span>
          )}
          {isDirty && !saving && (
            <span className="rounded bg-yellow-900/50 px-2 py-0.5 text-xs font-medium text-yellow-400">unsaved</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="border-b border-red-900 bg-red-950/50 px-4 py-2 text-xs text-red-400">{error}</div>
      )}

      {secret.note && (
        <div className="border-b border-gray-800 bg-gray-900/50 px-4 py-2 text-xs text-gray-500">
          <span className="font-medium text-gray-400">Note:</span> {secret.note}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={isJson ? "json" : "plaintext"}
          theme="vs-dark"
          value={editorValue}
          onChange={(v) => setEditorValue(v ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: isJson ? "off" : "on",
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}
