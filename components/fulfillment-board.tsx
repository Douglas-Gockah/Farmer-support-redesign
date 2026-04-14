"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
  datePreset: string | null;
  region:     string | null;
  district:   string | null;
  community:  string | null;
  agent:      string | null;
  status:     FulfillmentStage | null;
}

const STATUS_OPTIONS: { value: FulfillmentStage; label: string }[] = [
  { value: "pending_fulfillment", label: "Pending Fulfilment"  },
  { value: "partially_fulfilled", label: "Partially Fulfilled" },
  { value: "fully_fulfilled",     label: "Fully Fulfilled"     },
  { value: "opted_out",           label: "Cash Opt-Outs"       },
];

const DATE_PRESETS = ["Today", "Yesterday", "This Week", "Last Week", "This Month", "Last Month"];

const REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
  "Greater Accra", "North East", "Northern", "Oti", "Savannah",
  "Upper East", "Upper West", "Volta", "Western", "Western North",
];

const DISTRICTS = ["Tamale Metro", "Sawla-Tuna-Kalba", "Bole", "Wa East"];

// ---------------------------------------------------------------------------
// Shared pill-button + dropdown filter component
// ---------------------------------------------------------------------------
function FilterPill<T extends string>({
  label,
  value,
  options,
  onSelect,
  searchable = false,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onSelect: (v: T | null) => void;
  searchable?: boolean;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, minWidth: 180 });
  const ref        = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isActive   = value !== null;
  const displayLabel = isActive
    ? options.find((o) => o.value === value)?.label ?? label
    : label;
  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  function calcCoords() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 6, left: r.left, minWidth: Math.max(180, r.width) });
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    function reposition() { calcCoords(); }
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  const pillStyle: React.CSSProperties = isActive
    ? {
        height: 32, padding: "0 12px",
        borderRadius: 999,
        border: "1.5px solid var(--green-500)",
        background: "var(--green-50)",
        color: "var(--green-600)",
        fontSize: "0.75rem", fontWeight: 600,
        display: "flex", alignItems: "center", gap: 6,
        cursor: "pointer", whiteSpace: "nowrap",
        transition: "all 0.15s",
      }
    : {
        height: 32, padding: "0 12px",
        borderRadius: 999,
        border: "1px solid var(--gray-200)",
        background: "#ffffff",
        color: "var(--gray-600)",
        fontSize: "0.75rem", fontWeight: 500,
        display: "flex", alignItems: "center", gap: 6,
        cursor: "pointer", whiteSpace: "nowrap",
        transition: "all 0.15s",
      };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        ref={triggerRef}
        style={pillStyle}
        onClick={() => { calcCoords(); setOpen((v) => !v); setQuery(""); }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.borderColor = "var(--gray-300)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.borderColor = "var(--gray-200)";
        }}
      >
        {displayLabel}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="py-1 overflow-hidden"
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            minWidth: coords.minWidth,
            zIndex: 9999,
            background: "#ffffff",
            border: "1px solid var(--gray-200)",
            borderRadius: 10,
            boxShadow: "0px 8px 24px rgba(16,24,40,0.12)",
          }}
        >
          {/* Search box */}
          {searchable && (
            <div className="px-2 pt-1 pb-1">
              <input
                autoFocus
                type="text"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: 30,
                  borderRadius: 6,
                  border: "1px solid var(--gray-300)",
                  padding: "0 8px",
                  fontSize: "0.75rem",
                  color: "var(--gray-700)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--green-500)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,179,115,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--gray-300)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          )}

          {/* Clear */}
          {isActive && (
            <button
              className="flex items-center gap-1.5 w-full text-left px-3 py-1.5 transition-colors"
              style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--error-600)" }}
              onClick={() => { onSelect(null); setOpen(false); setQuery(""); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--error-50)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Clear
            </button>
          )}

          {/* Options */}
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[11px]" style={{ color: "var(--gray-400)" }}>No results</p>
            ) : filtered.map((o) => {
              const isSelected = value === o.value;
              return (
                <button
                  key={o.value}
                  className="flex items-center justify-between w-full text-left px-3 py-1.5 transition-colors"
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "var(--green-600)" : "var(--gray-700)",
                    background: isSelected ? "var(--green-25)" : "transparent",
                  }}
                  onClick={() => { onSelect(o.value); setOpen(false); setQuery(""); }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--gray-50)"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {o.label}
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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
  function set<K extends keyof FulfillmentFilters>(key: K, value: FulfillmentFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const activeCount  = Object.values(filters).filter(Boolean).length;
  const dateOptions  = DATE_PRESETS.map((d) => ({ value: d, label: d }));
  const regionOpts   = REGIONS.map((r)    => ({ value: r, label: r }));
  const districtOpts = DISTRICTS.map((d)  => ({ value: d, label: d }));
  const communityOpts = communities.map((c) => ({ value: c, label: c }));
  const agentOpts    = agents.map((a)     => ({ value: a, label: a }));

  return (
    <div
      className="shrink-0 flex items-center gap-2 px-4 sm:px-6 py-2.5 overflow-x-auto scrollbar-none"
      style={{ background: "#ffffff", borderBottom: "1px solid var(--gray-100)" }}
    >
      <FilterPill
        label="All time"
        value={filters.datePreset}
        options={dateOptions}
        onSelect={(v) => set("datePreset", v)}
      />
      <FilterPill
        label="All Regions"
        value={filters.region}
        options={regionOpts}
        onSelect={(v) => set("region", v)}
        searchable
      />
      <FilterPill
        label="All Districts"
        value={filters.district}
        options={districtOpts}
        onSelect={(v) => set("district", v)}
      />
      <FilterPill
        label="All Communities"
        value={filters.community}
        options={communityOpts}
        onSelect={(v) => set("community", v)}
        searchable
      />
      <FilterPill
        label="All Agents"
        value={filters.agent}
        options={agentOpts}
        onSelect={(v) => set("agent", v)}
        searchable
      />
      <FilterPill
        label="Fulfilment Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onSelect={(v) => set("status", v)}
      />

      {/* Clear all */}
      {activeCount > 0 && (
        <button
          className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full whitespace-nowrap transition-colors"
          style={{
            fontSize: "0.75rem", fontWeight: 600,
            color: "var(--error-600)",
            background: "var(--error-50)",
            border: "1px solid var(--error-200)",
          }}
          onClick={() => onChange({ datePreset: null, region: null, district: null, community: null, agent: null, status: null })}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--error-100)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--error-50)")}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Clear ({activeCount})
        </button>
      )}
    </div>
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
        style={{ background: "var(--gray-100)" }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect
            x="3" y="6" width="16" height="13" rx="2.5"
            stroke="var(--gray-300)" strokeWidth="1.5" strokeDasharray="3 2"
          />
          <path
            d="M8 6V5a3 3 0 016 0v1"
            stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round"
          />
        </svg>
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>No items here yet</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage → column map
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// FulfillmentBoard
// ---------------------------------------------------------------------------
export default function FulfillmentBoard() {
  const [mobileColId, setMobileColId] = useState(FULFILLMENT_COLUMNS[0].id);
  const [selectedReq, setSelectedReq] = useState<FulfillmentRequest | null>(null);
  const [optOutReq,   setOptOutReq]   = useState<FulfillmentRequest | null>(null);
  const [filters,     setFilters]     = useState<FulfillmentFilters>(DEFAULT_FILTERS);

  const communities = useMemo(
    () => Array.from(new Set(MOCK_FULFILLMENT_REQUESTS.map((r) => r.community))).sort(),
    [],
  );
  const agents = useMemo(
    () => Array.from(new Set(MOCK_FULFILLMENT_REQUESTS.map((r) => r.agent))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    return MOCK_FULFILLMENT_REQUESTS.filter((r) => {
      if (filters.community && r.community          !== filters.community)   return false;
      if (filters.agent     && r.agent              !== filters.agent)        return false;
      if (filters.status    && r.fulfillmentStage   !== filters.status)       return false;
      return true;
    });
  }, [filters]);

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
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "var(--gray-50)" }}>

      {selectedReq && (
        <FulfillmentSlideOver req={selectedReq} onClose={() => setSelectedReq(null)} />
      )}
      {optOutReq && (
        <FulfillmentOptOutModal req={optOutReq} onClose={() => setOptOutReq(null)} />
      )}

      {/* ── Filter bar ── */}
      <FulfillmentFilterBar
        filters={filters}
        communities={communities}
        agents={agents}
        onChange={setFilters}
      />

      {/* ── Mobile: column tab strip ── */}
      <div
        className="lg:hidden shrink-0 flex overflow-x-auto gap-2 px-4 py-2.5 scrollbar-none"
        style={{ background: "#ffffff", borderBottom: "1px solid var(--gray-200)" }}
      >
        {FULFILLMENT_COLUMNS.map((col) => {
          const count    = cardsForCol(col.id).length;
          const isActive = mobileColId === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setMobileColId(col.id)}
              className="shrink-0 h-8 px-3 rounded-full whitespace-nowrap transition-colors"
              style={isActive
                ? { background: col.dotColor, color: "#ffffff", fontSize: "0.75rem", fontWeight: 600 }
                : { background: "var(--gray-100)", color: "var(--gray-500)", fontSize: "0.75rem", fontWeight: 500 }}
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
        <div style={{ display: "flex", flexDirection: "row", gap: 12, padding: "16px 20px", height: "100%", minWidth: "max-content" }}>
          {FULFILLMENT_COLUMNS.map((col) => {
            const cards = cardsForCol(col.id);
            return (
              <div
                key={col.id}
                style={{ width: 288, minWidth: 288, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
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
                        <FulfillmentCard key={r.id} req={r} onView={() => handleCardClick(r)} />
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
