"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColumnHeader } from "@/components/kanban/column-header";
import { RECOVERIES_COLUMNS } from "@/components/kanban/constants";

function EmptyColState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: "var(--gray-100)" }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="16" height="16" rx="3" stroke="var(--gray-300)" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M11 8v6M8 11h6" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[12px] text-gray-400">No items here yet</p>
        <p className="text-[11px] text-gray-300 mt-0.5">Coming soon</p>
      </div>
    </div>
  );
}

export default function RecoveriesBoard() {
  const [mobileColId, setMobileColId] = useState(RECOVERIES_COLUMNS[0].id);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "var(--gray-50)" }}>

      {/* ── Mobile: column tab strip ── */}
      <div className="lg:hidden shrink-0 flex overflow-x-auto gap-2 px-4 py-2.5 bg-white border-b border-gray-200 scrollbar-none">
        {RECOVERIES_COLUMNS.map((col) => {
          const isActive = mobileColId === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setMobileColId(col.id)}
              className="shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors"
              style={isActive
                ? { background: col.dotColor, color: "white" }
                : { background: "var(--gray-100)", color: "var(--gray-500)" }}
            >
              {col.label} (0)
            </button>
          );
        })}
      </div>

      {/* ── Mobile: empty state ── */}
      <div className="lg:hidden flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <EmptyColState />
        </div>
      </div>

      {/* ── Desktop: all columns, horizontal scroll ── */}
      <div
        className="hidden lg:block"
        style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 12,
            padding: "16px 20px",
            height: "100%",
            minWidth: "max-content",
          }}
        >
          {RECOVERIES_COLUMNS.map((col) => (
            <div
              key={col.id}
              style={{
                width: 288, minWidth: 288, flexShrink: 0,
                display: "flex", flexDirection: "column",
                height: "100%", overflow: "hidden",
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <ColumnHeader label={col.label} dotColor={col.dotColor} count={0} />
              </div>
              <ScrollArea className="flex-1 min-h-0">
                <div style={{ paddingBottom: 16 }}>
                  <EmptyColState />
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
