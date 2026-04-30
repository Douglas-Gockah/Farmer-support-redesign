"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DATE_PRESETS, GHANA_REGIONS, COMMUNITIES, DISTRICTS } from "./constants";
import { fmtDate, presetDates, calDays, isSameDay, inRange } from "./helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ActiveFilters {
  search: string;
  community: string | null;
  region: string | null;
  district: string | null;
  agent: string | null;
  datePreset: string | null;
}

interface FilterBarProps {
  agents: string[];
  onFilterChange: (filters: ActiveFilters) => void;
  rightSlot?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------
function FilterPopover({
  popoverRef,
  children,
  open,
  width = 220,
}: {
  popoverRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  open: boolean;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div
      ref={popoverRef as React.RefObject<HTMLDivElement>}
      style={{
        position: "absolute",
        top: 40,
        left: 0,
        zIndex: 50,
        background: "#ffffff",
        borderRadius: "10px",
        border: "1px solid var(--gray-200)",
        boxShadow: "0px 8px 24px rgba(16,24,40,0.12)",
        width,
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function PopoverSearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: "relative", borderBottom: "1px solid #f3f4f6" }}>
      <svg
        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}
        width="15" height="15" viewBox="0 0 16 16" fill="none"
      >
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          paddingLeft: 38,
          paddingRight: 14,
          height: 46,
          border: "none",
          fontSize: 14,
          color: "#374151",
          background: "transparent",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function OptionList<T extends string>({ items, selected, onSelect }: { items: T[]; selected: T | null; onSelect: (item: T) => void }) {
  return (
    <div style={{ maxHeight: 208, overflowY: "auto" }}>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "7px 14px",
            fontSize: "0.8125rem",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: selected === item ? "var(--green-600)" : "var(--gray-700)",
            fontWeight: selected === item ? 600 : 400,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-50)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {item}
        </button>
      ))}
      {items.length === 0 && (
        <p style={{ padding: "10px 14px", fontSize: "0.75rem", color: "var(--gray-400)" }}>No matches found.</p>
      )}
    </div>
  );
}

const ChevronDownIcon = ({ open }: { open?: boolean }) => (
  <svg
    width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"
    style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}
  >
    <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

// Filter chip — container div with trigger + optional X clear button
function FilterChip({
  active,
  isOpen = false,
  onTriggerClick,
  onClear,
  children,
}: {
  active: boolean;
  isOpen?: boolean;
  onTriggerClick: () => void;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        display:     "inline-flex",
        alignItems:  "center",
        height:      34,
        borderRadius: 8,
        border:      `1px solid ${active ? "#1ab373" : "#d4d4d4"}`,
        background:  active ? "#e8f7f1" : hover ? "#f5f5f5" : "#fff",
        overflow:    "hidden",
        transition:  "background 0.12s, border-color 0.12s",
        flexShrink:  0,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={onTriggerClick}
        style={{
          display:     "inline-flex",
          alignItems:  "center",
          gap:         6,
          height:      "100%",
          paddingLeft: 12,
          paddingRight: 10,
          background:  "none",
          border:      "none",
          cursor:      "pointer",
          color:       active ? "#15803d" : "#525252",
          fontSize:    "0.8125rem",
          fontWeight:  active ? 600 : 500,
          whiteSpace:  "nowrap",
        }}
      >
        {children}
        <ChevronDownIcon open={isOpen} />
      </button>
      {active && onClear && (
        <>
          <div aria-hidden="true" style={{ width: 1, alignSelf: "stretch", margin: "7px 0", background: "#86efac" }} />
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            style={{
              display:    "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width:      32,
              height:     "100%",
              background: "none",
              border:     "none",
              cursor:     "pointer",
              color:      "#15803d",
            }}
            aria-label="Clear filter"
          >
            <XIcon />
          </button>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilterBar
// ---------------------------------------------------------------------------
export function FilterBar({ agents, onFilterChange, rightSlot }: FilterBarProps) {
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [search,          setSearch]          = useState("");
  const [datePickerOpen,  setDatePickerOpen]  = useState(false);
  const [datePreset,      setDatePreset]      = useState<string | null>(null);
  const [calMonth,        setCalMonth]        = useState(() => new Date());
  const [regionsOpen,     setRegionsOpen]     = useState(false);
  const [selectedRegion,  setSelectedRegion]  = useState<string | null>(null);
  const [regionSearch,    setRegionSearch]    = useState("");
  const [districtsOpen,   setDistrictsOpen]   = useState(false);
  const [selectedDistrict,setSelectedDistrict]= useState<string | null>(null);
  const [districtSearch,  setDistrictSearch]  = useState("");
  const [communityOpen,   setCommunityOpen]   = useState(false);
  const [selectedCommunity,setSelectedCommunity]=useState<string | null>(null);
  const [communitySearch, setCommunitySearch] = useState("");
  const [agentOpen,       setAgentOpen]       = useState(false);
  const [selectedAgent,   setSelectedAgent]   = useState<string | null>(null);

  const dateRef      = useRef<HTMLDivElement>(null!);
  const regionsRef   = useRef<HTMLDivElement>(null!);
  const distRef      = useRef<HTMLDivElement>(null!);
  const communityRef = useRef<HTMLDivElement>(null!);
  const agentRef     = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dateRef.current      && !dateRef.current.contains(e.target as Node))      setDatePickerOpen(false);
      if (regionsRef.current   && !regionsRef.current.contains(e.target as Node))   setRegionsOpen(false);
      if (distRef.current      && !distRef.current.contains(e.target as Node))      setDistrictsOpen(false);
      if (communityRef.current && !communityRef.current.contains(e.target as Node)) setCommunityOpen(false);
      if (agentRef.current     && !agentRef.current.contains(e.target as Node))     setAgentOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    onFilterChange({ search, community: selectedCommunity, region: selectedRegion, district: selectedDistrict, agent: selectedAgent, datePreset });
  }, [search, selectedCommunity, selectedRegion, selectedDistrict, selectedAgent, datePreset, onFilterChange]);

  function closeAll() {
    setDatePickerOpen(false); setRegionsOpen(false); setDistrictsOpen(false);
    setCommunityOpen(false);  setAgentOpen(false);
  }

  const today = new Date();
  const [dateStart, dateEnd] = datePreset ? presetDates(datePreset, today) : [null, null];

  const filteredRegions     = GHANA_REGIONS.filter((r) => r.toLowerCase().includes(regionSearch.toLowerCase()));
  const filteredDistricts   = DISTRICTS.filter((d) => d.toLowerCase().includes(districtSearch.toLowerCase()));
  const filteredCommunities = COMMUNITIES.filter((c) => c.toLowerCase().includes(communitySearch.toLowerCase()));

  const hasActiveFilters    = !!(datePreset || selectedRegion || selectedDistrict || selectedCommunity || selectedAgent);
  const activeFilterCount   = [datePreset, selectedRegion, selectedDistrict, selectedCommunity, selectedAgent].filter(Boolean).length;

  function clearAll() {
    setDatePreset(null); setSelectedRegion(null); setSelectedDistrict(null);
    setSelectedCommunity(null); setSelectedAgent(null);
  }

  return (
    <>
      {/* ── Row 1: search + export + mobile filter toggle ── */}
      <div
        className="flex items-center gap-2"
        style={{ background: "#ffffff", padding: "10px 16px", borderBottom: "1px solid var(--gray-100)" }}
      >
        {/* Search input — Treesyt icon-input pattern */}
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <svg
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }}
            width="14" height="14" viewBox="0 0 16 16" fill="none"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by group name or reference code…"
            style={{
              width: "100%",
              paddingLeft: 32,
              paddingRight: 12,
              height: 36,
              borderRadius: "var(--radius)",
              border: "1px solid var(--gray-300)",
              fontSize: "0.875rem",
              color: "var(--gray-800)",
              background: "#ffffff",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s, box-shadow 0.15s",
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

        {/* Mobile filter toggle */}
        <button
          className="flex lg:hidden items-center gap-1.5 shrink-0"
          style={{
            height: 36, padding: "0 12px",
            borderRadius: "var(--radius)",
            border: filtersVisible ? "1.5px solid var(--green-500)" : "1px solid var(--gray-300)",
            color: filtersVisible ? "var(--green-600)" : "var(--gray-600)",
            background: filtersVisible ? "var(--green-50)" : "#ffffff",
            fontSize: "0.875rem", fontWeight: 500,
            cursor: "pointer",
          }}
          onClick={() => setFiltersVisible((v) => !v)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>

        {/* Right slot + export */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {rightSlot}
          <button
            className="hidden sm:flex items-center gap-2 shrink-0"
            style={{
              height: 36, padding: "0 16px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--green-500)",
              color: "var(--green-600)",
              background: "#ffffff",
              fontSize: "0.875rem", fontWeight: 500,
              cursor: "not-allowed",
              opacity: 0.6,
            }}
            disabled
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Export data
          </button>
        </div>
      </div>

      {/* ── Row 2: filter pills ── */}
      <div
        className={`${filtersVisible ? "flex" : "hidden"} lg:flex flex-wrap items-center gap-2`}
        style={{ background: "var(--gray-50)", padding: "8px 16px", borderBottom: "1px solid var(--gray-100)" }}
      >

        {/* 1. Date picker */}
        <div ref={dateRef} style={{ position: "relative" }}>
          <FilterChip
            active={!!datePreset}
            isOpen={datePickerOpen}
            onTriggerClick={() => { const next = !datePickerOpen; closeAll(); setDatePickerOpen(next); }}
            onClear={() => setDatePreset(null)}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5 1v2M9 1v2M1 6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {datePreset ?? "All Time"}
          </FilterChip>

          {datePickerOpen && (
            <div
              style={{
                position: "absolute", top: 40, left: 0, zIndex: 50,
                background: "#ffffff",
                borderRadius: "10px",
                border: "1px solid var(--gray-200)",
                boxShadow: "0px 8px 24px rgba(16,24,40,0.12)",
                display: "flex", width: 520,
              }}
            >
              {/* Presets */}
              <div style={{ width: 168, borderRight: "1px solid var(--gray-100)", paddingTop: 8, paddingBottom: 8, flexShrink: 0 }}>
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setDatePreset(p); setCalMonth(new Date()); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "7px 16px", border: "none", background: "transparent",
                      fontSize: "0.8125rem", cursor: "pointer",
                      color: datePreset === p ? "var(--green-600)" : "var(--gray-700)",
                      fontWeight: datePreset === p ? 600 : 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-50)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {p}
                  </button>
                ))}
                <div style={{ borderTop: "1px solid var(--gray-100)", marginTop: 8, paddingTop: 8, paddingLeft: 12, paddingRight: 12 }}>
                  {["Days up to today", "Days starting today"].map((label) => (
                    <div key={label} className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                      <input type="number" defaultValue={1} min={1}
                        style={{
                          width: 44, height: 28, textAlign: "center",
                          borderRadius: "var(--radius)", border: "1px solid var(--gray-200)",
                          fontSize: "0.75rem", outline: "none",
                        }}
                      />
                      <span style={{ fontSize: "0.6875rem", color: "var(--gray-500)", fontWeight: 500 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div style={{ flex: 1, padding: 16 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                  {[fmtDate(dateStart), fmtDate(dateEnd)].map((d, i) => (
                    <div key={i} style={{ flex: 1, height: 32, borderRadius: "var(--radius)", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", paddingLeft: 10, fontSize: "0.75rem", fontWeight: 500, color: "var(--gray-700)" }}>{d}</div>
                  ))}
                </div>
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <button onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                    style={{ width: 28, height: 28, borderRadius: "var(--radius)", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-500)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-100)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-800)" }}>
                    {calMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </span>
                  <button onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                    style={{ width: 28, height: 28, borderRadius: "var(--radius)", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-500)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-100)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                    <div key={d} style={{ textAlign: "center", fontSize: "0.625rem", fontWeight: 700, color: "var(--gray-400)", padding: "4px 0" }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
                  {calDays(calMonth).map((d, i) => {
                    if (!d) return <div key={`e-${i}`} />;
                    const isToday = isSameDay(d, today);
                    const isStart = dateStart && isSameDay(d, dateStart);
                    const isEnd   = dateEnd   && isSameDay(d, dateEnd);
                    const inRng   = inRange(d, dateStart, dateEnd);
                    return (
                      <button key={d.toISOString()} onClick={() => {}}
                        style={{
                          height: 28, width: "100%", borderRadius: "9999px", border: "none", cursor: "pointer",
                          fontSize: "0.75rem", fontWeight: isToday ? 700 : 400,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: (isStart || isEnd) ? "var(--green-600)" : inRng ? "var(--green-50)" : isToday ? "var(--green-25)" : "transparent",
                          color: (isStart || isEnd) ? "#fff" : inRng ? "var(--green-700)" : "var(--gray-700)",
                        }}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Regions */}
        <div ref={regionsRef} style={{ position: "relative" }}>
          <FilterChip
            active={!!selectedRegion}
            isOpen={regionsOpen}
            onTriggerClick={() => { const next = !regionsOpen; closeAll(); setRegionsOpen(next); }}
            onClear={() => { setSelectedRegion(null); setSelectedDistrict(null); setRegionSearch(""); }}
          >
            {selectedRegion ?? "All Regions"}
          </FilterChip>
          {regionsOpen && (
            <div style={{ position: "absolute", top: 42, left: 0, zIndex: 50, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0px 8px 24px rgba(16,24,40,0.12)", width: 240, overflow: "hidden" }}>
              <PopoverSearchInput value={regionSearch} onChange={setRegionSearch} placeholder="Search for region…" />
              <div style={{ maxHeight: 240, overflowY: "auto", padding: "4px 0" }}>
                <OptionList items={filteredRegions} selected={selectedRegion} onSelect={(r) => { setSelectedRegion(r); setSelectedDistrict(null); setRegionsOpen(false); setRegionSearch(""); }} />
              </div>
            </div>
          )}
        </div>

        {/* 3. Districts */}
        <div ref={distRef} style={{ position: "relative" }}>
          <FilterChip
            active={!!selectedDistrict}
            isOpen={districtsOpen}
            onTriggerClick={() => { const next = !districtsOpen; closeAll(); setDistrictsOpen(next); }}
            onClear={() => { setSelectedDistrict(null); setDistrictSearch(""); }}
          >
            {selectedDistrict ?? "All Districts"}
          </FilterChip>
          {districtsOpen && (
            <div style={{ position: "absolute", top: 42, left: 0, zIndex: 50, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0px 8px 24px rgba(16,24,40,0.12)", width: 240, overflow: "hidden" }}>
              <PopoverSearchInput value={districtSearch} onChange={setDistrictSearch} placeholder="Search for district…" />
              <div style={{ maxHeight: 240, overflowY: "auto", padding: "4px 0" }}>
                <OptionList items={filteredDistricts} selected={selectedDistrict} onSelect={(d) => { setSelectedDistrict(d); setDistrictsOpen(false); setDistrictSearch(""); }} />
              </div>
            </div>
          )}
        </div>

        {/* 4. Communities */}
        <div ref={communityRef} style={{ position: "relative" }}>
          <FilterChip
            active={!!selectedCommunity}
            isOpen={communityOpen}
            onTriggerClick={() => { const next = !communityOpen; closeAll(); setCommunityOpen(next); }}
            onClear={() => { setSelectedCommunity(null); setCommunitySearch(""); }}
          >
            {selectedCommunity ?? "All Communities"}
          </FilterChip>
          {communityOpen && (
            <div style={{ position: "absolute", top: 42, left: 0, zIndex: 50, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0px 8px 24px rgba(16,24,40,0.12)", width: 240, overflow: "hidden" }}>
              <PopoverSearchInput value={communitySearch} onChange={setCommunitySearch} placeholder="Search for community…" />
              <div style={{ maxHeight: 240, overflowY: "auto", padding: "4px 0" }}>
                <OptionList items={filteredCommunities} selected={selectedCommunity} onSelect={(c) => { setSelectedCommunity(c); setCommunityOpen(false); setCommunitySearch(""); }} />
              </div>
            </div>
          )}
        </div>

        {/* 5. Agent */}
        <div ref={agentRef} style={{ position: "relative" }}>
          <FilterChip
            active={!!selectedAgent}
            isOpen={agentOpen}
            onTriggerClick={() => { const next = !agentOpen; closeAll(); setAgentOpen(next); }}
            onClear={() => setSelectedAgent(null)}
          >
            {selectedAgent ?? "Agent"}
          </FilterChip>
          {agentOpen && (
            <div style={{ position: "absolute", top: 42, left: 0, zIndex: 50, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0px 8px 24px rgba(16,24,40,0.12)", width: 220, overflow: "hidden" }}>
              <div style={{ maxHeight: 260, overflowY: "auto", padding: "4px 0" }}>
                <OptionList items={agents} selected={selectedAgent} onSelect={(a) => { setSelectedAgent(a); setAgentOpen(false); }} />
              </div>
            </div>
          )}
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1"
            style={{
              height: 32, padding: "0 12px",
              borderRadius: "9999px",
              border: "1px solid var(--error-200)",
              background: "var(--error-50)",
              color: "var(--error-600)",
              fontSize: "0.75rem", fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Clear filters
          </button>
        )}
      </div>
    </>
  );
}
