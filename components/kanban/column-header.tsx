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
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-2" style={{ background: "#F3F4F6" }}>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dotColor }} />
        <span className="text-[13px] font-bold text-gray-800">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {onCycleSort && (
          <div className="relative group">
            <button
              onClick={onCycleSort}
              className="flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:bg-gray-200"
              style={{ color: scoreSort !== "default" ? "#2563EB" : "#9CA3AF" }}
              aria-label={
                scoreSort === "desc" ? "Sorted: Highest first" :
                scoreSort === "asc"  ? "Sorted: Lowest first" :
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
              className="absolute right-0 top-8 z-20 px-2 py-1 rounded-md text-[11px] font-semibold text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "#1F2937" }}
            >
              {scoreSort === "desc" ? "Highest first" : scoreSort === "asc" ? "Lowest first" : "Sort by score"}
            </div>
          </div>
        )}
        <span
          className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-white shrink-0"
          style={{ background: dotColor }}
        >
          {count}
        </span>
      </div>
    </div>
  );
}
