"use client";

import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FulfillmentCard } from "@/components/kanban/fulfillment-card";
import { ColumnHeader } from "@/components/kanban/column-header";
import FulfillmentSlideOver from "@/components/fulfillment-slide-over";
import FulfillmentOptOutModal from "@/components/fulfillment-opt-out-modal";
import { FULFILLMENT_COLUMNS } from "@/components/kanban/constants";
import { MOCK_FULFILLMENT_REQUESTS } from "@/components/kanban/mock-data";
import type { FulfillmentRequest, FulfillmentStage } from "@/components/kanban/types";

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------
interface FulfillmentFilters {
  datePreset:  string | null;
  region:      string | null;
  district:    string | null;
  community:   string | null;
  agent:       string | null;
  status:      FulfillmentStage | null;
}

const STATUS_OPTIONS: { value: FulfillmentStage; label: string }[] = [
  { value: "pending_fulfillment", label: "Pending Fulfilment" },
  { value: "partially_fulfilled", label: "Partially Fulfilled" },
  { value: "fully_fulfilled",     label: "Fully Fulfilled"    },
  { value: "opted_out",           label: "Cash Opt-Outs"      },
];

const DATE_PRESETS = ["Today", "Yesterday", "This Week", "Last Week", "This Month", "Last Month"];

const REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
  "Greater Accra", "North East", "Northern", "Oti", "Savannah",
  "Upper East", "Upper West", "Volta", "Western", "Western North",
];

const DISTRICTS = [
  "Tamale Metro", "Sawla-Tuna-Kalba", "Bole", "Wa East",
];

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------
function FulfillmentFilterBar({
  filters,
  communities,
  agents,
  onChange,
}: {
  filters: FulfillmentFilters;
  communities: string[];
  agents: string[];
  onChange: (f: FulfillmentFilters) => void;
}) {
  function set(key: keyof FulfillmentFilters, value: string | null) {
    onChange({ ...filters, [key]: value });
  }

  const activeCount = Object.values(filters).filter(Boolean).length;

  const selectCls =
    "h-8 pl-2.5 pr-7 text-[12px] font-medium rounded-lg border border-gray-200 bg-white text-gray-700 appearance-none cursor-pointer hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/30";

  return (
    <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-white border-b border-gray-100 overflow-x-auto scrollbar-none">
      {/* Date */}
      <div className="relative shrink-0">
        <select
          className={selectCls}
          value={filters.datePreset ?? ""}
          onChange={(e) => set("datePreset", e.target.value || null)}
        >
          <option value="">All time</option>
          {DATE_PRESETS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <ChevronIcon />
      </div>

      {/* Region */}
      <div className="relative shrink-0">
        <select
          className={selectCls}
          value={filters.region ?? ""}
          onChange={(e) => set("region", e.target.value || null)}
        >
          <option value="">All Regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <ChevronIcon />
      </div>

      {/* District */}
      <div className="relative shrink-0">
        <select
          className={selectCls}
          value={filters.district ?? ""}
          onChange={(e) => set("district", e.target.value || null)}
        >
          <option value="">All Districts</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <ChevronIcon />
      </div>

      {/* Community */}
      <div className="relative shrink-0">
        <select
          className={selectCls}
          value={filters.community ?? ""}
          onChange={(e) => set("community", e.target.value || null)}
        >
          <option value="">All Communities</option>
          {communities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <ChevronIcon />
      </div>

      {/* Agent */}
      <div className="relative shrink-0">
        <select
          className={selectCls}
          value={filters.agent ?? ""}
          onChange={(e) => set("agent", e.target.value || null)}
        >
          <option value="">All Agents</option>
          {agents.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <ChevronIcon />
      </div>

      {/* Status */}
      <div className="relative shrink-0">
        <select
          className={selectCls}
          value={filters.status ?? ""}
          onChange={(e) => set("status", (e.target.value as FulfillmentStage) || null)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <ChevronIcon />
      </div>

      {/* Clear all */}
      {activeCount > 0 && (
        <button
          onClick={() => onChange({ datePreset: null, region: null, district: null, community: null, agent: null, status: null })}
          className="shrink-0 h-8 px-3 rounded-lg text-[12px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors whitespace-nowrap"
        >
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyColState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: "#F3F4F6" }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect
            x="3" y="6" width="16" height="13" rx="2.5"
            stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="3 2"
          />
          <path
            d="M8 6V5a3 3 0 016 0v1"
            stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[12px] text-gray-400">No items here yet</p>
      </div>
    </div>
  );
}

// Map column ids to FulfillmentStage values
const COL_STAGE_MAP: Record<string, FulfillmentRequest["fulfillmentStage"]> = {
  pending_fulfillment: "pending_fulfillment",
  partially_fulfilled: "partially_fulfilled",
  fully_fulfilled:     "fully_fulfilled",
  opted_out:           "opted_out",
};

const DEFAULT_FILTERS: FulfillmentFilters = {
  datePreset: null, region: null, district: null,
  community: null, agent: null, status: null,
};

export default function FulfillmentBoard() {
  const [mobileColId, setMobileColId] = useState(FULFILLMENT_COLUMNS[0].id);
  const [selectedReq, setSelectedReq] = useState<FulfillmentRequest | null>(null);
  const [optOutReq, setOptOutReq] = useState<FulfillmentRequest | null>(null);
  const [filters, setFilters] = useState<FulfillmentFilters>(DEFAULT_FILTERS);

  // Derive unique communities and agents from mock data
  const communities = useMemo(
    () => Array.from(new Set(MOCK_FULFILLMENT_REQUESTS.map((r) => r.community))).sort(),
    [],
  );
  const agents = useMemo(
    () => Array.from(new Set(MOCK_FULFILLMENT_REQUESTS.map((r) => r.agent))).sort(),
    [],
  );

  // Apply filters (community, agent, status are functional; date/region/district are UI-only)
  const filtered = useMemo(() => {
    return MOCK_FULFILLMENT_REQUESTS.filter((r) => {
      if (filters.community && r.community !== filters.community) return false;
      if (filters.agent    && r.agent    !== filters.agent)        return false;
      if (filters.status   && r.fulfillmentStage !== filters.status) return false;
      return true;
    });
  }, [filters]);

  // All four columns are shown
  const displayCols = FULFILLMENT_COLUMNS;

  function cardsForCol(colId: string): FulfillmentRequest[] {
    const stage = COL_STAGE_MAP[colId];
    if (!stage) return [];
    return filtered.filter((r) => r.fulfillmentStage === stage);
  }

  function handleCardClick(r: FulfillmentRequest) {
    if (r.fulfillmentStage === "opted_out") {
      setOptOutReq(r);
    } else {
      setSelectedReq(r);
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "#F9FAFB" }}>
      {/* Slide-over panel — pending / partial / full */}
      {selectedReq && (
        <FulfillmentSlideOver
          req={selectedReq}
          onClose={() => setSelectedReq(null)}
        />
      )}

      {/* Opt-out modal */}
      {optOutReq && (
        <FulfillmentOptOutModal
          req={optOutReq}
          onClose={() => setOptOutReq(null)}
        />
      )}

      {/* ── Filter bar ── */}
      <FulfillmentFilterBar
        filters={filters}
        communities={communities}
        agents={agents}
        onChange={setFilters}
      />

      {/* ── Mobile: column tab strip ── */}
      <div className="lg:hidden shrink-0 flex overflow-x-auto gap-2 px-4 py-2.5 bg-white border-b border-gray-200 scrollbar-none">
        {displayCols.map((col) => {
          const count = cardsForCol(col.id).length;
          const isActive = mobileColId === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setMobileColId(col.id)}
              className="shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors"
              style={
                isActive
                  ? { background: col.dotColor, color: "white" }
                  : { background: "#F3F4F6", color: "#6B7280" }
              }
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
            const cards = cardsForCol(mobileColId);
            if (cards.length === 0) return <EmptyColState />;
            return cards.map((r) => (
              <FulfillmentCard key={r.id} req={r} onView={() => handleCardClick(r)} />
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
          {displayCols.map((col) => {
            const cards = cardsForCol(col.id);
            return (
              <div
                key={col.id}
                style={{
                  width: 288,
                  minWidth: 288,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <ColumnHeader
                    label={col.label}
                    dotColor={col.dotColor}
                    count={cards.length}
                  />
                </div>
                <ScrollArea className="flex-1 min-h-0">
                  <div style={{ paddingBottom: 16 }}>
                    {cards.length === 0 ? (
                      <EmptyColState />
                    ) : (
                      cards.map((r) => (
                        <FulfillmentCard
                          key={r.id}
                          req={r}
                          onView={() => handleCardClick(r)}
                        />
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
