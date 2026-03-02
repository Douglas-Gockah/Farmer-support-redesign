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
  /** Agent names derived from current request data */
  agents: string[];
  /** Called whenever any filter value changes */
  onFilterChange: (filters: ActiveFilters) => void;
}

// ---------------------------------------------------------------------------
// Reusable searchable dropdown popover
// ---------------------------------------------------------------------------
function FilterPopover({
  trigger,
  open,
  children,
  popoverRef,
}: {
  trigger: React.ReactNode;
  open: boolean;
  children: React.ReactNode;
  popoverRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={popoverRef} className="relative">
      {trigger}
      {open && (
        <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2" style={{ width: 220 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative px-3 mb-2">
      <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-7 pr-3 h-8 rounded-lg border border-gray-200 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
      />
    </div>
  );
}

function OptionList<T extends string>({
  items,
  selected,
  onSelect,
}: {
  items: T[];
  selected: T | null;
  onSelect: (item: T) => void;
}) {
  return (
    <div className="max-h-52 overflow-y-auto">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors"
          style={{ color: selected === item ? "#16A34A" : "#374151", fontWeight: selected === item ? 700 : 400 }}
        >
          {item}
        </button>
      ))}
      {items.length === 0 && (
        <p className="px-4 py-3 text-[12px] text-gray-400">No matches found.</p>
      )}
    </div>
  );
}

const ChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// FilterBar
// ---------------------------------------------------------------------------
export function FilterBar({ agents, onFilterChange }: FilterBarProps) {
  // Mobile filter panel toggle
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Date picker
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePreset,     setDatePreset]     = useState<string | null>(null);
  const [calMonth,       setCalMonth]       = useState(() => new Date());

  // Region
  const [regionsOpen,     setRegionsOpen]     = useState(false);
  const [selectedRegion,  setSelectedRegion]  = useState<string | null>(null);
  const [regionSearch,    setRegionSearch]    = useState("");

  // District
  const [districtsOpen,    setDistrictsOpen]    = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [districtSearch,   setDistrictSearch]   = useState("");

  // Community
  const [communityOpen,     setCommunityOpen]     = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [communitySearch,   setCommunitySearch]   = useState("");

  // Agent
  const [agentOpen,     setAgentOpen]     = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Refs for outside-click close
  const dateRef      = useRef<HTMLDivElement>(null);
  const regionsRef   = useRef<HTMLDivElement>(null);
  const distRef      = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const agentRef     = useRef<HTMLDivElement>(null);

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

  // Emit filter changes upward
  useEffect(() => {
    onFilterChange({ search, community: selectedCommunity, region: selectedRegion, district: selectedDistrict, agent: selectedAgent, datePreset });
  }, [search, selectedCommunity, selectedRegion, selectedDistrict, selectedAgent, datePreset, onFilterChange]);

  // Close all popovers helper
  function closeAll() {
    setDatePickerOpen(false); setRegionsOpen(false); setDistrictsOpen(false);
    setCommunityOpen(false);  setAgentOpen(false);
  }

  // Computed date range
  const today = new Date();
  const [dateStart, dateEnd] = datePreset ? presetDates(datePreset, today) : [null, null];

  // Filtered lists
  const filteredRegions     = GHANA_REGIONS.filter((r) => r.toLowerCase().includes(regionSearch.toLowerCase()));
  const filteredDistricts   = DISTRICTS.filter((d) => d.toLowerCase().includes(districtSearch.toLowerCase()));
  const filteredCommunities = COMMUNITIES.filter((c) => c.toLowerCase().includes(communitySearch.toLowerCase()));

  const hasActiveFilters = !!(datePreset || selectedRegion || selectedDistrict || selectedCommunity || selectedAgent);

  function clearAll() {
    setDatePreset(null); setSelectedRegion(null); setSelectedDistrict(null);
    setSelectedCommunity(null); setSelectedAgent(null);
  }

  const pillBase = "flex items-center gap-1.5 h-8 px-3 rounded-full border border-gray-300 text-[12px] font-semibold text-gray-600 bg-white hover:border-gray-400 transition-colors";

  const activeFilterCount = [datePreset, selectedRegion, selectedDistrict, selectedCommunity, selectedAgent].filter(Boolean).length;

  return (
    <>
      {/* ── Row 1: search + export + mobile filter toggle ── */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
        <div className="relative flex-1 sm:flex-none" style={{ maxWidth: 320 }}>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] bg-white"
          />
        </div>

        {/* Mobile filter toggle */}
        <button
          className="flex lg:hidden items-center gap-1.5 h-9 px-3 rounded-lg border text-[13px] font-semibold transition-colors shrink-0"
          style={{ borderColor: filtersVisible ? "#16A34A" : "#D1D5DB", color: filtersVisible ? "#16A34A" : "#6B7280", background: "white" }}
          onClick={() => setFiltersVisible((v) => !v)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>

        {/* Desktop export button */}
        <button
          className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg border text-[13px] font-semibold transition-colors ml-auto shrink-0"
          style={{ borderColor: "#16A34A", color: "#16A34A", background: "white" }}
          disabled
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Export data
        </button>
      </div>

      {/* ── Row 2: filter pills — always visible on lg+, toggleable on mobile ── */}
      <div className={`${filtersVisible ? "flex" : "hidden"} lg:flex flex-wrap items-center gap-2 px-4 sm:px-6 py-2 bg-white border-b border-gray-200`}>

        {/* 1. Date picker */}
        <div ref={dateRef} className="relative">
          <button
            className={pillBase}
            onClick={() => { const next = !datePickerOpen; closeAll(); setDatePickerOpen(next); }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 1v2M9 1v2M1 6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {datePreset ?? "All Time"}
          </button>

          {datePickerOpen && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 flex" style={{ width: 520 }}>
              {/* Left: presets */}
              <div className="w-44 border-r border-gray-100 py-2 shrink-0">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setDatePreset(p); setCalMonth(new Date()); }}
                    className="w-full text-left px-4 py-2 text-[13px] font-medium transition-colors hover:bg-gray-50"
                    style={{ color: datePreset === p ? "#16A34A" : "#374151", fontWeight: datePreset === p ? 700 : 500 }}
                  >
                    {p}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2 px-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue={1} min={1} className="w-12 h-7 rounded border border-gray-200 text-center text-[12px] focus:outline-none focus:ring-1 focus:ring-[#16A34A]" />
                    <span className="text-[11px] text-gray-500 font-medium">Days up to today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue={1} min={1} className="w-12 h-7 rounded border border-gray-200 text-center text-[12px] focus:outline-none focus:ring-1 focus:ring-[#16A34A]" />
                    <span className="text-[11px] text-gray-500 font-medium">Days starting today</span>
                  </div>
                </div>
              </div>
              {/* Right: calendar */}
              <div className="flex-1 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-8 rounded border border-gray-200 flex items-center px-3 text-[12px] font-medium text-gray-700">{fmtDate(dateStart)}</div>
                  <div className="w-3 h-px bg-gray-300" />
                  <div className="flex-1 h-8 rounded border border-gray-200 flex items-center px-3 text-[12px] font-medium text-gray-700">{fmtDate(dateEnd)}</div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <span className="text-[13px] font-bold text-gray-800">
                    {calMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </span>
                  <button onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-0.5">
                  {calDays(calMonth).map((d, i) => {
                    if (!d) return <div key={`e-${i}`} />;
                    const isToday = isSameDay(d, today);
                    const isStart = dateStart && isSameDay(d, dateStart);
                    const isEnd   = dateEnd   && isSameDay(d, dateEnd);
                    const inRng   = inRange(d, dateStart, dateEnd);
                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() => {}}
                        className="h-7 w-full rounded-full text-[12px] font-medium flex items-center justify-center transition-colors"
                        style={{
                          background: (isStart || isEnd) ? "#16A34A" : inRng ? "#DCFCE7" : isToday ? "#F0FDF4" : "transparent",
                          color:      (isStart || isEnd) ? "white"   : inRng ? "#15803D" : "#374151",
                          fontWeight: isToday ? 700 : 400,
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
        <div ref={regionsRef} className="relative">
          <button className={pillBase} onClick={() => { const next = !regionsOpen; closeAll(); setRegionsOpen(next); }}>
            {selectedRegion ?? "All Regions"} <ChevronDown />
          </button>
          {regionsOpen && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2" style={{ width: 220 }}>
              <SearchInput value={regionSearch} onChange={setRegionSearch} placeholder="Search for region" />
              <OptionList
                items={filteredRegions}
                selected={selectedRegion}
                onSelect={(r) => { setSelectedRegion(r); setSelectedDistrict(null); setRegionsOpen(false); setRegionSearch(""); }}
              />
            </div>
          )}
        </div>

        {/* 3. Districts */}
        <div ref={distRef} className="relative">
          <button
            className={pillBase}
            style={{ color: selectedDistrict ? "#374151" : "#9CA3AF" }}
            onClick={() => { const next = !districtsOpen; closeAll(); setDistrictsOpen(next); }}
          >
            {selectedDistrict ?? "All Districts"} <ChevronDown />
          </button>
          {districtsOpen && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2" style={{ width: 220 }}>
              <SearchInput value={districtSearch} onChange={setDistrictSearch} placeholder="Search for district" />
              <OptionList
                items={filteredDistricts}
                selected={selectedDistrict}
                onSelect={(d) => { setSelectedDistrict(d); setDistrictsOpen(false); setDistrictSearch(""); }}
              />
            </div>
          )}
        </div>

        {/* 4. Communities */}
        <div ref={communityRef} className="relative">
          <button
            className="flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12px] font-semibold bg-white transition-colors"
            style={{
              borderColor: selectedCommunity ? "#16A34A" : "#D1D5DB",
              color:       selectedCommunity ? "#15803D" : "#6B7280",
            }}
            onClick={() => { const next = !communityOpen; closeAll(); setCommunityOpen(next); }}
          >
            {selectedCommunity ?? "All Communities"} <ChevronDown />
          </button>
          {communityOpen && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2" style={{ width: 220 }}>
              <SearchInput value={communitySearch} onChange={setCommunitySearch} placeholder="Search for community..." />
              <OptionList
                items={filteredCommunities}
                selected={selectedCommunity}
                onSelect={(c) => { setSelectedCommunity(c); setCommunityOpen(false); setCommunitySearch(""); }}
              />
            </div>
          )}
        </div>

        {/* 5. Agent */}
        <div ref={agentRef} className="relative">
          <button
            className={pillBase}
            style={{ color: selectedAgent ? "#374151" : "#9CA3AF" }}
            onClick={() => { const next = !agentOpen; closeAll(); setAgentOpen(next); }}
          >
            {selectedAgent ?? "Agent"} <ChevronDown />
          </button>
          {agentOpen && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2" style={{ width: 200 }}>
              <OptionList
                items={agents}
                selected={selectedAgent}
                onSelect={(a) => { setSelectedAgent(a); setAgentOpen(false); }}
              />
            </div>
          )}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 h-8 px-3 rounded-full text-[12px] font-semibold transition-colors"
            style={{ color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Clear filters
          </button>
        )}
      </div>
    </>
  );
}
