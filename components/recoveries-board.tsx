"use client";

import { useState, useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColumnHeader } from "@/components/kanban/column-header";
import { RECOVERIES_COLUMNS } from "@/components/kanban/constants";
import { FilterBar, type ActiveFilters } from "@/components/kanban/filter-bar";
import { presetDates, avatarColor, initials } from "@/components/kanban/helpers";

// ─── Constants ────────────────────────────────────────────────────────────────

const INTEREST_RATE    = 0.05;  // 5% per month
const DEFAULT_PENALTY  = 0.15;  // 15% on cash

// ─── Types ────────────────────────────────────────────────────────────────────

type RecoveryStage =
  | "rec_pending_review"
  | "rec_approved"
  | "rec_rejected"
  | "rec_pending_recovery"
  | "rec_partial"
  | "rec_full";

interface RecoveryRequest {
  id:               string;
  groupName:        string;
  community:        string;
  region:           string;
  district:         string;
  agent:            string;
  farmersSupported: number;
  amountPerFarmer:  number;
  submittedDate:    Date;
  stage:            RecoveryStage;
  disbursedDate:    string;
  transactionId:    string;
}

// ─── Mock recovery requests ───────────────────────────────────────────────────
// Derived from fully/partially fulfilled cash support groups

const MOCK_RECOVERY_REQUESTS: RecoveryRequest[] = [
  {
    id: "REC-001", groupName: "Kumbungu Crop Growers",
    community: "Tamale", region: "Northern", district: "Tamale Metro",
    agent: "Kofi Mensah", farmersSupported: 21, amountPerFarmer: 400,
    submittedDate: new Date(2025, 11, 15), stage: "rec_pending_review",
    disbursedDate: "15 Aug 2025", transactionId: "TXN-FS-2024-016",
  },
  {
    id: "REC-002", groupName: "Jirapa Fields Cooperative",
    community: "Wa", region: "Upper West", district: "Wa East",
    agent: "Ama Owusu", farmersSupported: 20, amountPerFarmer: 400,
    submittedDate: new Date(2025, 11, 12), stage: "rec_pending_review",
    disbursedDate: "10 Aug 2025", transactionId: "TXN-FS-2024-022",
  },
  {
    id: "REC-003", groupName: "Bole Agri Cooperative",
    community: "Bole", region: "Savannah", district: "Bole",
    agent: "Kwame Asante", farmersSupported: 14, amountPerFarmer: 600,
    submittedDate: new Date(2025, 11, 10), stage: "rec_pending_review",
    disbursedDate: "5 Sep 2025", transactionId: "TXN-FS-2024-014",
  },
  {
    id: "REC-004", groupName: "Tolon Cooperative Society",
    community: "Tamale", region: "Northern", district: "Tamale Metro",
    agent: "Akosua Boateng", farmersSupported: 28, amountPerFarmer: 500,
    submittedDate: new Date(2025, 11, 8), stage: "rec_pending_review",
    disbursedDate: "12 Sep 2025", transactionId: "TXN-FS-2024-015",
  },
  {
    id: "REC-005", groupName: "Sawla Farming Alliance",
    community: "Sawla-Tuna-Kalba", region: "Savannah", district: "Sawla-Tuna-Kalba",
    agent: "Yaw Darko", farmersSupported: 17, amountPerFarmer: 450,
    submittedDate: new Date(2025, 10, 22), stage: "rec_approved",
    disbursedDate: "18 Jul 2025", transactionId: "TXN-FS-2024-019",
  },
  {
    id: "REC-006", groupName: "Wa East Food Coalition",
    community: "Wa", region: "Upper West", district: "Wa East",
    agent: "Abena Frimpong", farmersSupported: 32, amountPerFarmer: 350,
    submittedDate: new Date(2025, 10, 18), stage: "rec_approved",
    disbursedDate: "20 Jul 2025", transactionId: "TXN-FS-2024-020",
  },
  {
    id: "REC-007", groupName: "Tamale Metro Food Group",
    community: "Tamale", region: "Northern", district: "Tamale Metro",
    agent: "Kweku Boateng", farmersSupported: 25, amountPerFarmer: 520,
    submittedDate: new Date(2025, 10, 5), stage: "rec_pending_recovery",
    disbursedDate: "1 Jun 2025", transactionId: "TXN-FS-2024-018",
  },
  {
    id: "REC-008", groupName: "Bole United Farmers",
    community: "Bole", region: "Savannah", district: "Bole",
    agent: "Adjoa Tetteh", farmersSupported: 19, amountPerFarmer: 480,
    submittedDate: new Date(2025, 9, 14), stage: "rec_partial",
    disbursedDate: "10 May 2025", transactionId: "TXN-FS-2024-017",
  },
  {
    id: "REC-009", groupName: "Bolgatanga Growers Coop",
    community: "Tamale", region: "Northern", district: "Tamale Metro",
    agent: "Kojo Annan", farmersSupported: 23, amountPerFarmer: 420,
    submittedDate: new Date(2025, 8, 2), stage: "rec_full",
    disbursedDate: "15 Apr 2025", transactionId: "TXN-FS-2024-013",
  },
];

const ALL_RECOVERY_AGENTS = [...new Set(MOCK_RECOVERY_REQUESTS.map((r) => r.agent))].sort();

const DEFAULT_FILTERS: ActiveFilters = {
  search: "", community: null, region: null, district: null, agent: null, datePreset: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtShort(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function toInputValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseInputDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ─── Recovery Request Card ────────────────────────────────────────────────────

function RecoveryCard({
  req,
  onReview,
}: {
  req: RecoveryRequest;
  onReview: () => void;
}) {
  const [hover, setHover] = useState(false);
  const color = avatarColor(req.groupName);
  const ini   = initials(req.groupName);
  const total = req.farmersSupported * req.amountPerFarmer;

  return (
    <div
      className="bg-white rounded-xl mx-3 mb-3 cursor-pointer"
      style={{
        border:     `1px solid ${hover ? "#d1d5db" : "#f3f4f6"}`,
        padding:    16,
        transition: "border-color 0.12s, box-shadow 0.12s",
        boxShadow:  hover ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onReview}
    >
      {/* Group identity */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          background: `${color}20`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "0.6875rem", fontWeight: 700, color }}>{ini}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", lineHeight: 1.3, marginBottom: 2 }}>
            {req.groupName}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            {req.community} · Cash support
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px" }}>
          <p style={{ fontSize: "0.625rem", color: "#9ca3af", fontWeight: 500, marginBottom: 2 }}>Farmers</p>
          <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>{req.farmersSupported}</p>
        </div>
        <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px" }}>
          <p style={{ fontSize: "0.625rem", color: "#9ca3af", fontWeight: 500, marginBottom: 2 }}>Total amount</p>
          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#111827" }}>
            GHS {total.toLocaleString("en-GH")}
          </p>
        </div>
      </div>

      {/* Footer: submission date + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "0.6875rem", color: "#9ca3af" }}>
          Submitted {fmtShort(req.submittedDate)}
        </p>
        {req.stage === "rec_pending_review" && (
          <button
            onClick={(e) => { e.stopPropagation(); onReview(); }}
            style={{
              height: 28, padding: "0 12px",
              borderRadius: 6,
              background: "#16a34a", color: "#fff",
              border: "none", fontSize: "0.75rem", fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#15803d")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#16a34a")}
          >
            Review
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Recovery Approval Modal ──────────────────────────────────────────────────

function RecoveryApprovalModal({
  req,
  onClose,
  onApprove,
}: {
  req: RecoveryRequest;
  onClose: () => void;
  onApprove: (id: string, unitPrice: number) => void;
}) {
  const [unitPriceStr, setUnitPriceStr] = useState("0.00");
  const [confirmed,    setConfirmed]    = useState(false);

  const unitPrice      = parseFloat(unitPriceStr) || 0;
  const hasValidPrice  = unitPrice > 0;
  const canApprove     = confirmed && hasValidPrice;
  const totalAmount    = req.farmersSupported * req.amountPerFarmer;
  const expectedQty    = hasValidPrice ? req.amountPerFarmer / unitPrice : null;
  const recoveryValue  = req.amountPerFarmer * (1 + DEFAULT_PENALTY);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16,
          padding: 28, width: "100%", maxWidth: 480,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0 }}>
            Recovery request
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "none",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Group identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
            background: "#e8f7f1",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
              <circle cx="9"  cy="6" r="4" stroke="#16a34a" strokeWidth="1.6"/>
              <circle cx="18" cy="6" r="3" stroke="#16a34a" strokeWidth="1.6"/>
              <path d="M1 21c0-4.418 3.582-7 8-7h1c4.418 0 8 2.582 8 7"
                stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M21 14c3 0 4.5 1.5 4.5 4"
                stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111827", marginBottom: 3 }}>
              {req.groupName}
            </p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Cash support</p>
          </div>
          <span style={{
            padding: "4px 12px", borderRadius: 20, flexShrink: 0,
            background: "#fef3c7", color: "#d97706",
            fontSize: "0.8125rem", fontWeight: 600,
          }}>
            Pending
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Farmers supported", value: String(req.farmersSupported) },
            { label: "Amount per farmer",  value: `GHS ${req.amountPerFarmer.toFixed(2)}` },
            { label: "Total amount",       value: `GHS ${totalAmount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: "0.6875rem", color: "#9ca3af", marginBottom: 5 }}>{label}</p>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Important notice */}
        <div style={{
          background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 10, padding: "14px 16px", marginBottom: 20,
        }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>Important:</p>
          <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: 10 }}>
            Before you approve this request, please take a moment to review these key details:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ fontSize: "0.875rem", color: "#374151", marginBottom: 4 }}>
              <strong>Interest Rate:</strong> {INTEREST_RATE * 100}% per month
            </li>
            <li style={{ fontSize: "0.875rem", color: "#374151", marginBottom: hasValidPrice ? 4 : 0 }}>
              <strong>Default Penalty:</strong> {DEFAULT_PENALTY * 100}% on cash
            </li>
            {hasValidPrice && expectedQty !== null && (
              <>
                <li style={{ fontSize: "0.875rem", color: "#374151", marginBottom: 4 }}>
                  <strong>Expected Quantity per Farmer:</strong> {expectedQty.toFixed(2)} kg (based on the unit price)
                </li>
                <li style={{ fontSize: "0.875rem", color: "#374151" }}>
                  <strong>Total Cash Recovery Value per Farmer</strong> (including penalty): GHS {Math.round(recoveryValue)}
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Unit price input */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: 8 }}>
            Unit price (GHS per kg)
          </label>
          <div style={{
            display: "flex", height: 48,
            border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center",
              paddingLeft: 14, paddingRight: 14,
              borderRight: "1px solid #e5e7eb", background: "#f9fafb",
              fontSize: "0.875rem", fontWeight: 500, color: "#6b7280",
              flexShrink: 0,
            }}>
              GHS
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitPriceStr}
              onChange={(e) => setUnitPriceStr(e.target.value)}
              style={{
                flex: 1, paddingLeft: 14, paddingRight: 14,
                border: "none", outline: "none",
                fontSize: "0.9375rem", color: "#111827", background: "transparent",
              }}
            />
          </div>
        </div>

        {/* Confirmation checkbox */}
        <label
          style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            cursor: "pointer", marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
              border: `2px solid ${confirmed ? "#16a34a" : "#d1d5db"}`,
              background: confirmed ? "#16a34a" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.12s, border-color 0.12s",
            }}
            onClick={() => setConfirmed((v) => !v)}
          >
            {confirmed && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.5, userSelect: "none" }}>
            I have reviewed the details of this request and confirm my decision to proceed with approval.
          </span>
        </label>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, height: 48, borderRadius: 10,
              border: "1.5px solid #16a34a", background: "transparent",
              color: "#16a34a", fontSize: "0.9375rem", fontWeight: 600, cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={() => { if (canApprove) onApprove(req.id, unitPrice); }}
            disabled={!canApprove}
            style={{
              flex: 2, height: 48, borderRadius: 10,
              border: "none",
              background: canApprove ? "#16a34a" : "#e5e7eb",
              color: canApprove ? "#fff" : "#9ca3af",
              fontSize: "0.9375rem", fontWeight: 600,
              cursor: canApprove ? "pointer" : "not-allowed",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => { if (canApprove) e.currentTarget.style.background = "#15803d"; }}
            onMouseLeave={(e) => { if (canApprove) e.currentTarget.style.background = "#16a34a"; }}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
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
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28,
        width: "100%", maxWidth: 440,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2" width="14" height="13" rx="2.5" stroke="#16a34a" strokeWidth="1.5"/>
                <path d="M5 1v2.5M11 1v2.5M1 6.5h14" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="5.5" cy="10.5" r="0.9" fill="#16a34a"/>
                <circle cx="8"   cy="10.5" r="0.9" fill="#16a34a"/>
                <circle cx="10.5" cy="10.5" r="0.9" fill="#16a34a"/>
              </svg>
            </div>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0 }}>
              Set Recovery Timeframe
            </p>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#6b7280", lineHeight: 1.55, margin: 0 }}>
            Define the start and end date for the active recovery period.
            Field agents will be notified via the mobile app once confirmed.
          </p>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 12px", borderRadius: 8,
          background: "#eff6ff", border: "1px solid #bfdbfe", marginBottom: 20,
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <rect x="4" y="1" width="8" height="13" rx="2" stroke="#3b82f6" strokeWidth="1.4"/>
            <line x1="8" y1="11.5" x2="8" y2="11.5" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="6.5" y1="3" x2="9.5" y2="3" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 500 }}>
            This will trigger a recovery banner on field agents' mobile app.
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: error ? 10 : 22 }}>
          {[
            { label: "Start date", val: startVal, set: (v: string) => { setStartVal(v); setError(null); }, min: undefined },
            { label: "End date",   val: endVal,   set: (v: string) => { setEndVal(v);   setError(null); }, min: startVal || undefined },
          ].map(({ label, val, set, min }) => (
            <div key={label} style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {label}
              </label>
              <input
                type="date" value={val} min={min}
                onChange={(e) => set(e.target.value)}
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
          ))}
        </div>

        {error && (
          <p style={{ fontSize: "0.75rem", color: "var(--error-600)", marginBottom: 16, marginTop: -6 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, height: 40, borderRadius: 8,
              border: "1.5px solid #e5e7eb", background: "#fff",
              fontSize: "0.875rem", fontWeight: 600, color: "#374151", cursor: "pointer",
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
              fontSize: "0.875rem", fontWeight: 600, color: "#fff", cursor: "pointer",
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
  start, end, onEdit,
}: { start: Date; end: Date; onEdit: () => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const endDay = new Date(end); endDay.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isExpired    = daysLeft < 0;
  const isEndingSoon = !isExpired && daysLeft <= 3;

  const dotColor  = isExpired ? "#ef4444" : isEndingSoon ? "#f59e0b" : "#16a34a";
  const bgColor   = isExpired ? "#fef2f2" : isEndingSoon ? "#fffbeb" : "#f0fdf4";
  const bdColor   = isExpired ? "#fecaca" : isEndingSoon ? "#fde68a" : "#bbf7d0";
  const headColor = isExpired ? "#991b1b" : isEndingSoon ? "#92400e" : "#14532d";
  const subColor  = isExpired ? "#dc2626" : isEndingSoon ? "#b45309" : "#16a34a";
  const btnBorder = isExpired ? "#fca5a5" : isEndingSoon ? "#fcd34d" : "#86efac";
  const btnColor  = isExpired ? "#991b1b" : isEndingSoon ? "#92400e" : "#15803d";

  const label = isExpired
    ? "Recovery period has ended"
    : daysLeft === 0
      ? "Recoveries in progress · Last day"
      : `Recoveries in progress · ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`;

  return (
    <div
      className="flex items-center gap-3 shrink-0"
      style={{ padding: "10px 20px", background: bgColor, borderBottom: `1px solid ${bdColor}` }}
    >
      <span className="relative flex shrink-0" style={{ width: 10, height: 10 }}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: dotColor, opacity: 0.5 }} />
        <span className="relative inline-flex rounded-full" style={{ width: 10, height: 10, background: dotColor }} />
      </span>

      <div className="flex-1 flex items-baseline gap-3 flex-wrap">
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: headColor }}>{label}</span>
        <span style={{ fontSize: "0.8125rem", color: subColor }}>{fmtShort(start)} – {fmtShort(end)}</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 shrink-0"
        style={{ fontSize: "0.6875rem", fontWeight: 500, color: subColor, opacity: 0.8 }}>
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <rect x="4" y="1" width="8" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <line x1="8" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        Field agents notified
      </div>

      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"
        style={{
          height: 30, padding: "0 12px", borderRadius: 8,
          border: `1px solid ${btnBorder}`, background: "rgba(255,255,255,0.65)",
          fontSize: "0.75rem", fontWeight: 600, color: btnColor, cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.95)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.65)")}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M8.5 1.5a1.414 1.414 0 012 2L3.75 10.25l-2.5.5.5-2.5L8.5 1.5z"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
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
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--gray-100)" }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="16" height="16" rx="3" stroke="var(--gray-300)" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M11 8v6M8 11h6" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[12px] text-gray-400">No items here yet</p>
        <p className="text-[11px] text-gray-300 mt-0.5">No results match your filters</p>
      </div>
    </div>
  );
}

// ─── RecoveriesBoard ──────────────────────────────────────────────────────────

export default function RecoveriesBoard() {
  const [mobileColId,    setMobileColId]    = useState(RECOVERIES_COLUMNS[0].id);
  const [timeframe,      setTimeframe]      = useState<{ start: Date; end: Date } | null>(null);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [reviewingReq,   setReviewingReq]   = useState<RecoveryRequest | null>(null);
  const [stageOverrides, setStageOverrides] = useState<Record<string, RecoveryStage>>({});
  const [filters,        setFilters]        = useState<ActiveFilters>(DEFAULT_FILTERS);

  const handleFilterChange = useCallback((f: ActiveFilters) => setFilters(f), []);

  // Apply filters + stage overrides to mock data
  const filteredRequests = useMemo(() => {
    return MOCK_RECOVERY_REQUESTS.map((r) => ({
      ...r,
      stage: (stageOverrides[r.id] ?? r.stage) as RecoveryStage,
    })).filter((req) => {
      const { search, region, district, community, agent, datePreset } = filters;
      if (search    && !req.groupName.toLowerCase().includes(search.toLowerCase())) return false;
      if (region    && req.region    !== region)    return false;
      if (district  && req.district  !== district)  return false;
      if (community && req.community !== community)  return false;
      if (agent     && req.agent     !== agent)      return false;
      if (datePreset) {
        const [ds, de] = presetDates(datePreset, new Date());
        if (req.submittedDate < ds || req.submittedDate > de) return false;
      }
      return true;
    });
  }, [filters, stageOverrides]);

  function cardsForCol(colId: string) {
    return filteredRequests.filter((r) => r.stage === colId);
  }

  function handleApprove(id: string, unitPrice: number) {
    setStageOverrides((prev) => ({ ...prev, [id]: "rec_approved" }));
    setReviewingReq(null);
  }

  const timeframeRightSlot = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"
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
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "var(--gray-50)" }}>

      {/* ── Filter bar (with timeframe CTA in right slot) ── */}
      <FilterBar
        agents={ALL_RECOVERY_AGENTS}
        onFilterChange={handleFilterChange}
        rightSlot={timeframeRightSlot}
      />

      {/* ── Recovery timeframe banner (visible when timeframe is set) ── */}
      {timeframe && (
        <RecoveryBanner
          start={timeframe.start}
          end={timeframe.end}
          onEdit={() => setModalOpen(true)}
        />
      )}

      {/* ── Mobile: column tab strip ── */}
      <div className="lg:hidden shrink-0 flex overflow-x-auto gap-2 px-4 py-2.5 bg-white border-b border-gray-200 scrollbar-none">
        {RECOVERIES_COLUMNS.map((col) => {
          const count    = cardsForCol(col.id).length;
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
              {col.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Mobile: single column ── */}
      <div className="lg:hidden flex-1 overflow-y-auto">
        <div className="py-3">
          {(() => {
            const cards = cardsForCol(mobileColId);
            if (cards.length === 0) return <EmptyColState />;
            return cards.map((r) => (
              <RecoveryCard
                key={r.id}
                req={r}
                onReview={() => setReviewingReq(r)}
              />
            ));
          })()}
        </div>
      </div>

      {/* ── Desktop: all columns ── */}
      <div className="hidden lg:block" style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
        <div style={{
          display: "flex", flexDirection: "row",
          gap: 12, padding: "16px 20px",
          height: "100%", minWidth: "max-content",
        }}>
          {RECOVERIES_COLUMNS.map((col) => {
            const cards = cardsForCol(col.id);
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
                  <div style={{ paddingTop: 8, paddingBottom: 16 }}>
                    {cards.length === 0
                      ? <EmptyColState />
                      : cards.map((r) => (
                          <RecoveryCard
                            key={r.id}
                            req={r}
                            onReview={() => setReviewingReq(r)}
                          />
                        ))
                    }
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recovery approval modal ── */}
      {reviewingReq && (
        <RecoveryApprovalModal
          req={reviewingReq}
          onClose={() => setReviewingReq(null)}
          onApprove={handleApprove}
        />
      )}

      {/* ── Set/edit timeframe modal ── */}
      {modalOpen && (
        <SetTimeframeModal
          current={timeframe}
          onConfirm={(s, e) => { setTimeframe({ start: s, end: e }); setModalOpen(false); }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
