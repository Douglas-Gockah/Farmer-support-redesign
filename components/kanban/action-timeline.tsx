"use client";

import type { ActionRecord } from "./types";

// ---------------------------------------------------------------------------
// ActionTimeline — vertical timeline matching the reference design.
// Shows: green checkmark • action (bold) • by actor • comment • timestamp
// No stage pills. Renders nothing when records is empty.
// ---------------------------------------------------------------------------
export function ActionTimeline({
  records,
  title = "Approval timeline",
}: {
  records: ActionRecord[];
  title?: string;
}) {
  if (records.length === 0) return null;

  return (
    <section>
      <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-4">
        {title}
      </p>
      <div>
        {records.map((rec, idx) => {
          const isLast = idx === records.length - 1;

          // Format timestamp: "Apr 14, 2025 • 10:32 AM"
          let displayTime = rec.timestamp;
          try {
            const d = new Date(rec.timestamp);
            if (!isNaN(d.getTime())) {
              displayTime = d.toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              }) + " • " + d.toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit", hour12: true,
              });
            }
          } catch {
            // keep raw timestamp
          }

          return (
            <div key={rec.id} className="flex gap-3">
              {/* Spine */}
              <div className="flex flex-col items-center shrink-0" style={{ width: 20 }}>
                {/* Green checkmark circle */}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--green-600)" }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path
                      d="M2 5.5l2 2 4-4"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {/* Connector line */}
                {!isLast && (
                  <div
                    className="flex-1 w-px mt-1"
                    style={{ background: "var(--gray-200)", minHeight: 20 }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-5 min-w-0">
                {/* Action — primary text */}
                <p className="text-[13px] font-semibold text-gray-900 leading-snug">
                  {rec.action}
                </p>

                {/* Actor */}
                <p className="text-[12px] text-gray-500 mt-0.5">
                  by {rec.actor}
                </p>

                {/* Comment / reason */}
                {rec.reason && (
                  <p
                    className="text-[11px] mt-2 px-2.5 py-1.5 rounded-lg leading-relaxed"
                    style={{
                      background: "var(--gray-50)",
                      color: "var(--gray-500)",
                      border: "1px solid var(--gray-100)",
                    }}
                  >
                    {rec.reason}
                  </p>
                )}

                {/* Timestamp */}
                <p className="text-[11px] text-gray-400 mt-1.5 tabular-nums">
                  {displayTime}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
