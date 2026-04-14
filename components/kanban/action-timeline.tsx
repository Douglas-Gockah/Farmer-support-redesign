"use client";

import type { ActionRecord, Stage } from "./types";
import { initials, avatarColor } from "./helpers";

// ---------------------------------------------------------------------------
// Stage display metadata
// ---------------------------------------------------------------------------
const STAGE_META: Record<Stage, { label: string; color: string; bg: string }> = {
  synced:               { label: "Pending Scoring",        color: "#B45309", bg: "#FFFBEB" },
  pending_approval:     { label: "Pending Approval",       color: "#2563EB", bg: "#EFF6FF" },
  agent_confirmation:   { label: "Manager Confirmation",   color: "#16A34A", bg: "#F0FDF4" },
  finance_disbursement: { label: "Finance & Disbursement", color: "#7C3AED", bg: "#F5F3FF" },
  disbursed:            { label: "Disbursed",              color: "#374151", bg: "#F9FAFB" },
  rejected:             { label: "Rejected",               color: "#DC2626", bg: "#FEF2F2" },
  opted_out:            { label: "Cash Opt-Out",           color: "#B45309", bg: "#FFFBEB" },
};

// ---------------------------------------------------------------------------
// ActionTimeline — renders a list of ActionRecord as a vertical timeline.
// Renders nothing when records is empty.
// ---------------------------------------------------------------------------
export function ActionTimeline({
  records,
  title = "Action Timeline",
}: {
  records: ActionRecord[];
  title?: string;
}) {
  if (records.length === 0) return null;

  return (
    <section>
      <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
        {title}
      </p>
      <div>
        {records.map((rec, idx) => {
          const ini    = initials(rec.actor);
          const bg     = avatarColor(rec.actor);
          const meta   = STAGE_META[rec.stage] ?? STAGE_META.synced;
          const isLast = idx === records.length - 1;

          return (
            <div key={rec.id} className="flex gap-3">
              {/* Spine */}
              <div className="flex flex-col items-center shrink-0" style={{ width: 28 }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: bg }}
                >
                  {ini}
                </div>
                {!isLast && (
                  <div
                    className="flex-1 w-px mt-1"
                    style={{ background: "var(--gray-200)", minHeight: 16 }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2 flex-wrap mb-0.5">
                  <span className="text-[12px] font-semibold text-gray-900">{rec.actor}</span>
                  <span className="text-[10px] text-gray-400 shrink-0 tabular-nums">{rec.timestamp}</span>
                </div>

                {/* Stage badge */}
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1"
                  style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}22` }}
                >
                  {meta.label}
                </span>

                <p className="text-[12px] text-gray-600">{rec.action}</p>

                {rec.reason && (
                  <p
                    className="text-[11px] mt-1.5 px-2 py-1 rounded-md italic"
                    style={{
                      background: "var(--gray-50)",
                      color: "var(--gray-500)",
                      border: "1px solid var(--gray-100)",
                    }}
                  >
                    "{rec.reason}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
