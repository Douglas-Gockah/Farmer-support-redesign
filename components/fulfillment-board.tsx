"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { ColumnHeader } from "@/components/kanban/column-header";
import { FULFILLMENT_COLUMNS } from "@/components/kanban/constants";
import { MOCK_REQUESTS } from "@/components/kanban/mock-data";

function EmptyColState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: "#F3F4F6" }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="6" width="16" height="13" rx="2.5" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M8 6V5a3 3 0 016 0v1" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[12px] text-gray-400">No items here yet</p>
        <p className="text-[11px] text-gray-300 mt-0.5">Coming soon</p>
      </div>
    </div>
  );
}

export default function FulfillmentBoard() {
  const [mobileColId, setMobileColId] = useState(FULFILLMENT_COLUMNS[0].id);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "#F9FAFB" }}>

      {/* ── Mobile: column tab strip ── */}
      <div className="lg:hidden shrink-0 flex overflow-x-auto gap-2 px-4 py-2.5 bg-white border-b border-gray-200 scrollbar-none">
        {FULFILLMENT_COLUMNS.map((col) => {
          const count    = MOCK_REQUESTS.filter((r) => r.stage === col.id).length;
          const isActive = mobileColId === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setMobileColId(col.id)}
              className="shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors"
              style={isActive
                ? { background: col.dotColor, color: "white" }
                : { background: "#F3F4F6", color: "#6B7280" }}
            >
              {col.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Mobile: single column view ── */}
      <div className="lg:hidden flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {(() => {
            const cards = MOCK_REQUESTS.filter((r) => r.stage === mobileColId);
            if (cards.length === 0) return <EmptyColState />;
            return cards.map((r) => (
              <KanbanCard key={r.id} r={r} ctaLabel="" onCta={() => {}} onView={() => {}} />
            ));
          })()}
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
          {FULFILLMENT_COLUMNS.map((col) => {
            const cards = MOCK_REQUESTS.filter((r) => r.stage === col.id);
            return (
              <div
                key={col.id}
                style={{
                  width: 288, minWidth: 288, flexShrink: 0,
                  display: "flex", flexDirection: "column",
                  height: "100%", overflow: "hidden",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <ColumnHeader label={col.label} dotColor={col.dotColor} count={cards.length} />
                </div>
                <ScrollArea className="flex-1 min-h-0">
                  <div style={{ paddingBottom: 16 }}>
                    {cards.length === 0 ? (
                      <EmptyColState />
                    ) : (
                      cards.map((r) => (
                        <KanbanCard key={r.id} r={r} ctaLabel="" onCta={() => {}} onView={() => {}} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
