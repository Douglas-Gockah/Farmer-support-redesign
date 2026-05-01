"use client";

import { useState, useRef, useEffect } from "react";
import { fmtDate, presetDates, calDays, isSameDay, inRange } from "./helpers";

const DATE_PRESETS = [
  "Today", "Yesterday", "This Week", "Last Week",
  "This Month", "Last Month", "This Year", "Last Year",
];

// ─── DateFilterChip ───────────────────────────────────────────────────────────
// Self-contained calendar date-picker chip.
// `value`    — currently selected preset label (or null = "All Time")
// `onSelect` — called with the chosen preset string, or null to clear

export function DateFilterChip({
  value,
  onSelect,
}: {
  value:    string | null;
  onSelect: (preset: string | null) => void;
}) {
  const [open,     setOpen]     = useState(false);
  const [hover,    setHover]    = useState(false);
  const [calMonth, setCalMonth] = useState(() => new Date());
  const ref = useRef<HTMLDivElement>(null);

  const today    = new Date();
  const isActive = value !== null;
  const [dateStart, dateEnd] = isActive ? presetDates(value!, today) : [null, null];

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>

      {/* ── Trigger chip ─────────────────────────────────────────────────── */}
      <div
        style={{
          display:      "inline-flex",
          alignItems:   "center",
          height:       34,
          borderRadius: 8,
          border:       `1px solid ${isActive ? "#1ab373" : "#d4d4d4"}`,
          background:   isActive ? "#e8f7f1" : hover ? "#f5f5f5" : "#fff",
          overflow:     "hidden",
          transition:   "background 0.12s, border-color 0.12s",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          6,
            height:       "100%",
            paddingLeft:  12,
            paddingRight: 10,
            background:   "none",
            border:       "none",
            cursor:       "pointer",
            color:        isActive ? "#15803d" : "#525252",
            fontSize:     "0.8125rem",
            fontWeight:   isActive ? 600 : 500,
            whiteSpace:   "nowrap",
          }}
        >
          {/* Calendar icon */}
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M5 1v2M9 1v2M1 6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {value ?? "All Time"}
          {/* Chevron */}
          <svg
            width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"
            style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0, color: isActive ? "#15803d" : "#9ca3af" }}
          >
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Clear (×) — only when a preset is selected */}
        {isActive && (
          <>
            <div aria-hidden="true" style={{ width: 1, alignSelf: "stretch", margin: "7px 0", background: "#86efac" }} />
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(null); setOpen(false); }}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: "100%", background: "none", border: "none", cursor: "pointer", color: "#15803d" }}
              aria-label="Clear date filter"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── Date picker panel ─────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position:     "absolute",
            top:          42,
            left:         0,
            zIndex:       9999,
            background:   "#ffffff",
            borderRadius: 12,
            border:       "1px solid #e5e7eb",
            boxShadow:    "0px 8px 24px rgba(16,24,40,0.12)",
            display:      "flex",
            overflow:     "hidden",
          }}
        >
          {/* Left — preset list */}
          <div style={{ width: 156, borderRight: "1px solid #f3f4f6", paddingTop: 8, paddingBottom: 8, flexShrink: 0 }}>
            {DATE_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => { onSelect(p); setCalMonth(new Date()); }}
                style={{
                  display:    "block",
                  width:      "100%",
                  textAlign:  "left",
                  padding:    "8px 16px",
                  border:     "none",
                  background: value === p ? "#f0fdf4" : "transparent",
                  fontSize:   "0.9375rem",
                  cursor:     "pointer",
                  color:      value === p ? "#15803d" : "#374151",
                  fontWeight: value === p ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (value !== p) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={(e) => { if (value !== p) e.currentTarget.style.background = value === p ? "#f0fdf4" : "transparent"; }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Right — calendar */}
          <div style={{ padding: "16px 20px 16px 16px" }}>
            {/* Date range display */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[fmtDate(dateStart), fmtDate(dateEnd)].map((d, i) => (
                <div
                  key={i}
                  style={{
                    flex:         1,
                    height:       34,
                    borderRadius: 8,
                    border:       "1px solid #e5e7eb",
                    display:      "flex",
                    alignItems:   "center",
                    paddingLeft:  12,
                    fontSize:     "0.8125rem",
                    fontWeight:   500,
                    color:        d === "—" ? "#9ca3af" : "#374151",
                    minWidth:     110,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Month navigation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <button
                onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>
                {calMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {/* Day-of-week headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", padding: "4px 0" }}>{d}</div>
              ))}
            </div>

            {/* Calendar days */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
              {calDays(calMonth).map((d, i) => {
                if (!d) return <div key={`e-${i}`} />;
                const isToday = isSameDay(d, today);
                const isStart = !!(dateStart && isSameDay(d, dateStart));
                const isEnd   = !!(dateEnd   && isSameDay(d, dateEnd));
                const inRng   = inRange(d, dateStart, dateEnd);
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => {}}
                    style={{
                      height:     32,
                      width:      "100%",
                      borderRadius: "50%",
                      border:     "none",
                      cursor:     "default",
                      fontSize:   "0.8125rem",
                      fontWeight: isToday ? 700 : 400,
                      display:    "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: (isStart || isEnd) ? "#16a34a" : inRng ? "#dcfce7" : isToday ? "#e8f7f1" : "transparent",
                      color:      (isStart || isEnd) ? "#fff"    : inRng ? "#15803d" : isToday ? "#15803d" : "#374151",
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
  );
}
