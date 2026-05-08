"use client";

import { useState } from "react";
import type { ActionRecord } from "./types";

// ---------------------------------------------------------------------------
// Shared timeline item list
// ---------------------------------------------------------------------------
function TimelineItems({ records }: { records: ActionRecord[] }) {
  return (
    <div>
      {records.map((rec, idx) => {
        const isLast = idx === records.length - 1;

        let displayTime = rec.timestamp;
        try {
          const d = new Date(rec.timestamp);
          if (!isNaN(d.getTime())) {
            displayTime =
              d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
              " • " +
              d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
          }
        } catch {
          // keep raw timestamp
        }

        return (
          <div key={rec.id} className="flex gap-3">
            {/* Spine */}
            <div className="flex flex-col items-center shrink-0" style={{ width: 20 }}>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--green-600)" }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 5.5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {!isLast && (
                <div className="flex-1 w-px mt-1" style={{ background: "var(--gray-200)", minHeight: 20 }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-5 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 leading-snug">{rec.action}</p>
              {rec.summary ? (
                <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">{rec.summary}</p>
              ) : (
                <p className="text-[12px] text-gray-500 mt-0.5">by {rec.actor}</p>
              )}
              {rec.reason && (
                <p
                  className="text-[11px] mt-2 px-2.5 py-1.5 rounded-lg leading-relaxed"
                  style={{ background: "var(--gray-50)", color: "var(--gray-500)", border: "1px solid var(--gray-100)" }}
                >
                  {rec.reason}
                </p>
              )}
              <p className="text-[11px] text-gray-400 mt-1.5 tabular-nums">{displayTime}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActionTimeline — vertical timeline.
// accordion=true wraps in a collapsible header, collapsed by default.
// ---------------------------------------------------------------------------
export function ActionTimeline({
  records,
  title = "Approval timeline",
  accordion = false,
}: {
  records: ActionRecord[];
  title?: string;
  accordion?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (records.length === 0) return null;

  if (accordion) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--gray-100)" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
          style={{ background: open ? "var(--gray-50)" : "#fff" }}
          aria-expanded={open}
        >
          <div className="flex items-center gap-2">
            {/* Clock icon */}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "var(--gray-400)" }}>
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 5v3.2l2.2 2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{ background: "var(--gray-100)", color: "var(--gray-500)" }}
            >
              {records.length}
            </span>
          </div>
          <svg
            width="13" height="13" viewBox="0 0 13 13" fill="none"
            style={{
              color: "var(--gray-400)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
          >
            <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          <div style={{ borderTop: "1px solid var(--gray-100)", padding: "14px 12px 4px" }}>
            <TimelineItems records={records} />
          </div>
        )}
      </div>
    );
  }

  // Non-accordion mode (used in approval-modal.tsx GroupContextPanel)
  return (
    <section>
      <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-4">{title}</p>
      <TimelineItems records={records} />
    </section>
  );
}
