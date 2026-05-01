"use client";

import type { SupportType } from "./types";

// ---------------------------------------------------------------------------
// Support type pill with icon
// ---------------------------------------------------------------------------
export function SupportPill({ type }: { type: SupportType }) {
  const isCash = type === "Cash";
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={isCash
        ? { background: "var(--green-50)", color: "var(--green-600)" }
        : { background: "var(--yellow-50)", color: "var(--yellow-700)" }}
    >
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
