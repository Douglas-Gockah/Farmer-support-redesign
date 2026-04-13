"use client";

import type { ScoreSort } from "./types";

interface ColumnHeaderProps {
  label: string;
  dotColor: string;
  count: number;
  scoreSort?: ScoreSort;
  onCycleSort?: () => void;
}

export function ColumnHeader({ label, dotColor, count, scoreSort, onCycleSort }: ColumnHeaderProps) {
  return (
    <div
      className="flex items-center justify-between mb-2"
      style={{
        background: "var(--gray-100)",
        borderRadius: "var(--radius)",
        padding: "8px 12px",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: dotColor }}
        />
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--gray-800)",
          }}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {onCycleSort && (
          <div className="relative group">
            <button
              onClick={onCycleSort}
              className="flex items-center justify-center w-6 h-6 rounded transition-colors"
              style={{
                color: scoreSort !== "default" ? "var(--blue-600)" : "var(--gray-400)",
                background: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-200)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label={
                scoreSort === "desc" ? "Sorted: Highest first" :
                scoreSort === "asc"  ? "Sorted: Lowest first"  :
                "Sort by score"
              }
            >
              {scoreSort === "desc" ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M4 9l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : scoreSort === "asc" ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M7 12V2M4 5l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M4 5l3-3 3 3M4 9l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            {/* Tooltip */}
            <div
              className="absolute right-0 top-8 z-20 px-2 py-1 rounded text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                background: "var(--gray-800)",
                borderRadius: "var(--radius)",
              }}
            >
              {scoreSort === "desc" ? "Highest first" : scoreSort === "asc" ? "Lowest first" : "Sort by score"}
            </div>
          </div>
        )}

        {/* Count badge */}
        <span
          className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
          style={{
            background: dotColor + "26",
            color: dotColor,
            fontSize: "0.6875rem",
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      </div>
    </div>
  );
}
