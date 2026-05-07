"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColumnHeader } from "@/components/kanban/column-header";
import { RECOVERIES_COLUMNS } from "@/components/kanban/constants";

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parseInputDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toInputValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Set Timeframe Modal ──────────────────────────────────────────────────────

function SetTimeframeModal({
  current,
  onConfirm,
  onClose,
}: {
  current: { start: Date; end: Date } | null;
  onConfirm: (start: Date, end: Date) => void;
  onClose: () => void;
}) {
  const [startVal, setStartVal] = useState(current ? toInputValue(current.start) : "");
  const [endVal,   setEndVal]   = useState(current ? toInputValue(current.end)   : "");
  const [error,    setError]    = useState<string | null>(null);

  function handleConfirm() {
    if (!startVal || !endVal) { setError("Please select both a start and end date."); return; }
    const s = parseInputDate(startVal);
    const e = parseInputDate(endVal);
    if (e <= s) { setError("End date must be after the start date."); return; }
    onConfirm(s, e);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          width: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2" width="14" height="13" rx="2.5" stroke="#16a34a" strokeWidth="1.5"/>
                <path d="M5 1v2.5M11 1v2.5M1 6.5h14" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="5.5" cy="10.5" r="0.9" fill="#16a34a"/>
                <circle cx="8" cy="10.5" r="0.9" fill="#16a34a"/>
                <circle cx="10.5" cy="10.5" r="0.9" fill="#16a34a"/>
              </svg>
            </div>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0 }}>Set Recovery Timeframe</p>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#6b7280", lineHeight: 1.55, margin: 0 }}>
            Define the start and end date for the active recovery period.
            Field agents will be notified via the mobile app once confirmed.
          </p>
        </div>

        {/* Mobile notification note */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 12px", borderRadius: 8,
          background: "#eff6ff", border: "1px solid #bfdbfe",
          marginBottom: 20,
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <rect x="4" y="1" width="8" height="13" rx="2" stroke="#3b82f6" strokeWidth="1.4"/>
            <line x1="8" y1="12" x2="8" y2="12" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="6.5" y1="3" x2="9.5" y2="3" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 500 }}>
            This will trigger a recovery banner on field agents' mobile app.
          </span>
        </div>

        {/* Date inputs */}
        <div style={{ display: "flex", gap: 12, marginBottom: error ? 10 : 22 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Start date
            </label>
            <input
              type="date"
              value={startVal}
              onChange={(e) => { setStartVal(e.target.value); setError(null); }}
              style={{
                width: "100%", height: 40,
                paddingLeft: 12, paddingRight: 12,
                borderRadius: 8, border: "1.5px solid #d1d5db",
                fontSize: "0.875rem", color: "#374151",
                outline: "none", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#16a34a")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#d1d5db")}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              End date
            </label>
            <input
              type="date"
              value={endVal}
              min={startVal || undefined}
              onChange={(e) => { setEndVal(e.target.value); setError(null); }}
              style={{
                width: "100%", height: 40,
                paddingLeft: 12, paddingRight: 12,
                borderRadius: 8, border: "1.5px solid #d1d5db",
                fontSize: "0.875rem", color: "#374151",
                outline: "none", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#16a34a")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#d1d5db")}
            />
          </div>
        </div>

        {/* Validation error */}
        {error && (
          <p style={{ fontSize: "0.75rem", color: "var(--error-600)", marginBottom: 16, marginTop: -4 }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, height: 40, borderRadius: 8,
              border: "1.5px solid #e5e7eb", background: "#fff",
              fontSize: "0.875rem", fontWeight: 600, color: "#374151",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1, height: 40, borderRadius: 8,
              border: "none", background: "#16a34a",
              fontSize: "0.875rem", fontWeight: 600, color: "#fff",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#15803d")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#16a34a")}
          >
            Confirm timeframe
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Recovery Timeframe Banner ────────────────────────────────────────────────

function RecoveryBanner({
  start,
  end,
  onEdit,
}: {
  start: Date;
  end: Date;
  onEdit: () => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isExpired    = daysLeft < 0;
  const isEndingSoon = !isExpired && daysLeft <= 3;

  const dotColor   = isExpired ? "#ef4444" : isEndingSoon ? "#f59e0b" : "#16a34a";
  const bgColor    = isExpired ? "#fef2f2" : isEndingSoon ? "#fffbeb" : "#f0fdf4";
  const borderColor= isExpired ? "#fecaca" : isEndingSoon ? "#fde68a" : "#bbf7d0";
  const headColor  = isExpired ? "#991b1b" : isEndingSoon ? "#92400e" : "#14532d";
  const subColor   = isExpired ? "#dc2626" : isEndingSoon ? "#b45309" : "#16a34a";
  const btnBorder  = isExpired ? "#fca5a5" : isEndingSoon ? "#fcd34d" : "#86efac";
  const btnColor   = isExpired ? "#991b1b" : isEndingSoon ? "#92400e" : "#15803d";

  const label = isExpired
    ? "Recovery period has ended"
    : daysLeft === 0
      ? "Recoveries in progress · Last day"
      : `Recoveries in progress · ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`;

  return (
    <div
      className="flex items-center gap-3 shrink-0"
      style={{ padding: "10px 20px", background: bgColor, borderBottom: `1px solid ${borderColor}` }}
    >
      {/* Pulsing status dot */}
      <span className="relative flex shrink-0" style={{ width: 10, height: 10 }}>
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full"
          style={{ background: dotColor, opacity: 0.5 }}
        />
        <span
          className="relative inline-flex rounded-full"
          style={{ width: 10, height: 10, background: dotColor }}
        />
      </span>

      {/* Label */}
      <div className="flex-1 flex items-baseline gap-3 flex-wrap">
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: headColor }}>
          {label}
        </span>
        <span style={{ fontSize: "0.8125rem", color: subColor }}>
          {fmtShort(start)} – {fmtShort(end)}
        </span>
      </div>

      {/* Mobile notification indicator */}
      <div
        className="hidden sm:flex items-center gap-1.5 shrink-0"
        style={{ fontSize: "0.6875rem", fontWeight: 500, color: subColor, opacity: 0.8 }}
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <rect x="4" y="1" width="8" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <line x1="8" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        Field agents notified
      </div>

      {/* Edit button */}
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"
        style={{
          height: 30, padding: "0 12px",
          borderRadius: 8,
          border: `1px solid ${btnBorder}`,
          background: "rgba(255,255,255,0.65)",
          fontSize: "0.75rem", fontWeight: 600,
          color: btnColor, cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.95)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.65)")}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M8.5 1.5a1.414 1.414 0 012 2L3.75 10.25l-2.5.5.5-2.5L8.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Edit timeframe
      </button>
    </div>
  );
}

// ─── Empty column placeholder ─────────────────────────────────────────────────

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

// ─── RecoveriesBoard ──────────────────────────────────────────────────────────

export default function RecoveriesBoard() {
  const [mobileColId, setMobileColId] = useState(RECOVERIES_COLUMNS[0].id);
  const [timeframe,   setTimeframe]   = useState<{ start: Date; end: Date } | null>(null);
  const [modalOpen,   setModalOpen]   = useState(false);

  function handleConfirm(start: Date, end: Date) {
    setTimeframe({ start, end });
    setModalOpen(false);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "var(--gray-50)" }}>

      {/* ── Recovery timeframe banner (shown when timeframe is active) ── */}
      {timeframe && (
        <RecoveryBanner
          start={timeframe.start}
          end={timeframe.end}
          onEdit={() => setModalOpen(true)}
        />
      )}

      {/* ── Toolbar ── */}
      <div
        className="flex items-center justify-between shrink-0 px-5 py-2"
        style={{ background: "#fff", borderBottom: "1px solid var(--gray-100)" }}
      >
        <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: 0 }}>
          {timeframe
            ? `Active period: ${fmtShort(timeframe.start)} – ${fmtShort(timeframe.end)}`
            : "No recovery timeframe set"}
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 shrink-0"
          style={{
            height: 34, padding: "0 14px",
            borderRadius: 8,
            border: timeframe ? "1px solid #16a34a" : "1px solid #d1d5db",
            background: timeframe ? "#f0fdf4" : "#fff",
            fontSize: "0.8125rem", fontWeight: 600,
            color: timeframe ? "#15803d" : "#374151",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = timeframe ? "#dcfce7" : "#f9fafb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = timeframe ? "#f0fdf4" : "#fff")}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="14" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 1v2.5M11 1v2.5M1 6.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {timeframe ? "Edit timeframe" : "Set recovery timeframe"}
        </button>
      </div>

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
      <div className="hidden lg:block" style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
        <div
          style={{
            display: "flex", flexDirection: "row",
            gap: 12, padding: "16px 20px",
            height: "100%", minWidth: "max-content",
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

      {/* ── Set / Edit timeframe modal ── */}
      {modalOpen && (
        <SetTimeframeModal
          current={timeframe}
          onConfirm={handleConfirm}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
