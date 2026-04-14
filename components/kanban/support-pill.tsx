"use client";

import type { SupportType } from "./types";

// ---------------------------------------------------------------------------
// Support type pill with icon
// ---------------------------------------------------------------------------
export function SupportPill({ type }: { type: SupportType }) {
  const isCash = type === "Cash";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={isCash
        ? { background: "var(--green-50)", color: "var(--green-600)" }
        : { background: "var(--yellow-50)", color: "var(--yellow-700)" }}
    >
      {isCash ? (
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 8h2M9 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ) : (
        <svg width="12" height="11" viewBox="0 0 16 14" fill="none">
          <rect x="1" y="7" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 7V5a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="4.5" cy="10" r="1" fill="currentColor" />
          <circle cx="11.5" cy="10" r="1" fill="currentColor" />
        </svg>
      )}
      {type}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Score badge with colour-coded severity
// ---------------------------------------------------------------------------
export function ScoreBadge({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  let bg    = "var(--error-50)";
  let color = "var(--error-500)";
  if (pct >= 90)      { bg = "var(--green-200)"; color = "var(--green-800)"; }
  else if (pct >= 70) { bg = "var(--green-100)"; color = "var(--green-600)"; }
  else if (pct >= 40) { bg = "var(--yellow-100)"; color = "var(--yellow-600)"; }
  return (
    <span
      className="inline-flex items-center h-5 px-1.5 rounded-full text-[11px] font-bold shrink-0"
      style={{ background: bg, color }}
    >
      {pct}%
    </span>
  );
}
