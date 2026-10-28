// components/admin/KeywordInput.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { LIMITS, normalizeKeywords } from "@/lib/productRules";

const { max, min, maxLength } = LIMITS.keywords;

/** Chips input. Enter or comma adds; values are lowercased and deduplicated. */
export default function KeywordInput({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (keywords: string[]) => void;
  error?: string;
}) {
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");

  function add(raw: string) {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const bad = parts.find((k) => k.length < min || k.length > maxLength);
    if (bad) {
      setNote(`“${bad}”: each keyword must be ${min}–${maxLength} characters`);
      return;
    }
    const next = normalizeKeywords([...value, ...parts]);
    if (next.length > max) {
      setNote(`At most ${max} keywords`);
      return;
    }
    setNote(next.length === value.length ? "Already added" : "");
    onChange(next);
    setDraft("");
  }

  return (
    <div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2 py-1.5 focus-within:border-[#F26A0F]">
        {value.map((k, i) => (
          <span
            key={k}
            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${
              i === 0 ? "bg-[#F26A0F] text-white" : "bg-neutral-100 text-neutral-800"
            }`}
            title={i === 0 ? "Main keyword" : undefined}
          >
            {k}
            <button
              type="button"
              aria-label={`Remove ${k}`}
              onClick={() => onChange(value.filter((x) => x !== k))}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          disabled={value.length >= max}
          placeholder={value.length ? "" : "e.g. jaggery ladoo"}
          aria-label="Add keyword"
          className="min-w-32 flex-1 py-0.5 text-sm focus:outline-none"
          onChange={(e) => {
            setNote("");
            if (e.target.value.endsWith(",")) add(e.target.value);
            else setDraft(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // don't submit the form
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => draft && add(draft)}
        />
      </div>
      <span className="mt-1 flex justify-between text-xs">
        <span className={error || note ? "text-red-600" : "text-neutral-500"}>
          {error ||
            note ||
            "Press Enter or comma to add. The first (orange) is the main keyword. Used for on-site search, not Google ranking."}
        </span>
        <span className="shrink-0 text-neutral-500">
          {value.length}/{max}
        </span>
      </span>
    </div>
  );
}
