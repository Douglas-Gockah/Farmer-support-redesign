"use client";

import { useState } from "react";
import type { AppScreen } from "./sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApprovalStatus = "Pending" | "Ticket activated" | "Approved" | "Rejected";
type SourcingStatus = "Pending" | "In progress" | "Completed";
type DisbursementStatus = "Pending" | "Disbursed" | "Partial";

interface PurchaseRequest {
  id: string;
  refCode: string;
  dateOfRequest: string;
  community: string;
  agentName: string;
  commodity: string;
  expectedQty: string;
  approvalStatus: ApprovalStatus;
  totalPrice: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_REQUESTS: PurchaseRequest[] = [
  {
    id: "1",
    refCode: "CS-2605-41523-NRT",
    dateOfRequest: "May 22, 2025",
    community: "Tamale Central",
    agentName: "Amadu Bawah",
    commodity: "Shea nuts",
    expectedQty: "500 kg",
    approvalStatus: "Pending",
    totalPrice: 2500,
  },
  {
    id: "2",
    refCode: "CS-2605-31209-SBN",
    dateOfRequest: "May 21, 2025",
    community: "Yendi North",
    agentName: "Fatima Issah",
    commodity: "Soybeans",
    expectedQty: "750 kg",
    approvalStatus: "Ticket activated",
    totalPrice: 3375,
  },
  {
    id: "3",
    refCode: "CS-2605-28847-NRT",
    dateOfRequest: "May 21, 2025",
    community: "Bawku West",
    agentName: "Alhassan Fuseini",
    commodity: "Shea nuts",
    expectedQty: "300 kg",
    approvalStatus: "Ticket activated",
    totalPrice: 1500,
  },
  {
    id: "4",
    refCode: "CS-2605-19034-SBN",
    dateOfRequest: "May 20, 2025",
    community: "Walewale",
    agentName: "Mariama Salifu",
    commodity: "Soybeans",
    expectedQty: "620 kg",
    approvalStatus: "Pending",
    totalPrice: 2790,
  },
  {
    id: "5",
    refCode: "CS-2604-77410-NRT",
    dateOfRequest: "May 19, 2025",
    community: "Damongo",
    agentName: "Ibrahim Yakubu",
    commodity: "Shea nuts",
    expectedQty: "410 kg",
    approvalStatus: "Approved",
    totalPrice: 2050,
  },
  {
    id: "6",
    refCode: "CS-2604-65021-SBN",
    dateOfRequest: "May 18, 2025",
    community: "Tolon",
    agentName: "Aisha Mahama",
    commodity: "Soybeans",
    expectedQty: "890 kg",
    approvalStatus: "Ticket activated",
    totalPrice: 4005,
  },
  {
    id: "7",
    refCode: "CS-2604-53398-NRT",
    dateOfRequest: "May 17, 2025",
    community: "Savelugu",
    agentName: "Seidu Alhassan",
    commodity: "Shea nuts",
    expectedQty: "555 kg",
    approvalStatus: "Pending",
    totalPrice: 2775,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function approvalChip(status: ApprovalStatus) {
  const cfg: Record<ApprovalStatus, { bg: string; color: string; dot: string }> = {
    "Pending":          { bg: "#fefce8", color: "#854d0e", dot: "#ca8a04" },
    "Ticket activated": { bg: "#f0fdf4", color: "#15803d", dot: "#16a34a" },
    "Approved":         { bg: "#eff6ff", color: "#1d4ed8", dot: "#2563eb" },
    "Rejected":         { bg: "#fef2f2", color: "#b91c1c", dot: "#dc2626" },
  };
  const s = cfg[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }}
      />
      {status}
    </span>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 11V3a1 1 0 011-1h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="3" r="1.2" fill="currentColor" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="13" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ transform: dir === "right" ? "rotate(180deg)" : undefined }}
      aria-hidden="true"
    >
      <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Filter pill ──────────────────────────────────────────────────────────────

function FilterPill({ label }: { label: string }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 transition-colors"
      style={{
        height: 34,
        paddingLeft: 12,
        paddingRight: 10,
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#fff",
        fontSize: 13,
        fontWeight: 500,
        color: "#374151",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3 5l4 4 4-4" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ─── Sub-nav tabs ─────────────────────────────────────────────────────────────

const TABS: { label: string; screen: AppScreen }[] = [
  { label: "Dashboard",         screen: "purchases-dashboard"       },
  { label: "Purchase List",     screen: "purchases-list"            },
  { label: "Purchase Requests", screen: "purchases-requests"        },
  { label: "Reconciliations",   screen: "purchases-reconciliations" },
  { label: "PREs",              screen: "purchases-pres"            },
  { label: "Warehouse stock",   screen: "purchases-warehouse"       },
];

// ─── Purchase Requests table ──────────────────────────────────────────────────

function PurchaseRequestsTable() {
  const [copied, setCopied] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalRows = 4740;
  const totalPages = 190;

  function copyRef(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <th
      style={{
        padding: "10px 14px",
        textAlign: right ? "right" : "left",
        fontSize: 11,
        fontWeight: 600,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        borderBottom: "1px solid #e5e7eb",
        background: "#f9fafb",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );

  return (
    <div
      className="flex flex-col"
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* Table scroll container */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
          <thead>
            <tr>
              <TH>Reference Code</TH>
              <TH>Date of Request</TH>
              <TH>Community</TH>
              <TH>Agent Name</TH>
              <TH>Commodity</TH>
              <TH>Expected Qty</TH>
              <TH>Approval Status</TH>
              <TH right>Total Price</TH>
              <TH>Action</TH>
            </tr>
          </thead>
          <tbody>
            {MOCK_REQUESTS.map((row, i) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: i < MOCK_REQUESTS.length - 1 ? "1px solid #f3f4f6" : undefined,
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f9fafb")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "")}
              >
                {/* Reference Code */}
                <td style={{ padding: "12px 14px" }}>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#111827",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {row.refCode}
                    </span>
                    <button
                      onClick={() => copyRef(row.refCode)}
                      style={{
                        color: copied === row.refCode ? "#16a34a" : "#9ca3af",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 2,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Copy reference code"
                    >
                      {copied === row.refCode ? (
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l3.5 3.5 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <CopyIcon />
                      )}
                    </button>
                  </div>
                </td>

                {/* Date */}
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>
                  {row.dateOfRequest}
                </td>

                {/* Community */}
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>
                  {row.community}
                </td>

                {/* Agent */}
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>
                  {row.agentName}
                </td>

                {/* Commodity */}
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>
                  {row.commodity}
                </td>

                {/* Expected Qty */}
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 500, color: "#111827" }}>
                  {row.expectedQty}
                </td>

                {/* Approval Status */}
                <td style={{ padding: "12px 14px" }}>
                  {approvalChip(row.approvalStatus)}
                </td>

                {/* Total Price */}
                <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>
                  GHS {row.totalPrice.toLocaleString()}
                </td>

                {/* Action */}
                <td style={{ padding: "12px 14px" }}>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      color: "#6b7280",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fff")}
                    title="More actions"
                  >
                    <DotsIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #e5e7eb",
          background: "#f9fafb",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Row count */}
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          Total Rows: <strong style={{ color: "#111827" }}>{totalRows.toLocaleString()}</strong>
        </span>

        {/* Pagination */}
        <div className="flex items-center gap-1.5">
          {/* Prev */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: currentPage === 1 ? "#d1d5db" : "#374151",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronIcon dir="left" />
          </button>

          {/* Page buttons */}
          {[1, 2, 3, 4].map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                border: currentPage === p ? "1.5px solid #1ab373" : "1px solid #e5e7eb",
                background: currentPage === p ? "#f0fdf4" : "#fff",
                color: currentPage === p ? "#15803d" : "#374151",
                fontSize: 13,
                fontWeight: currentPage === p ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}

          <span style={{ fontSize: 13, color: "#9ca3af", padding: "0 2px" }}>…</span>

          <button
            onClick={() => setCurrentPage(totalPages)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: currentPage === totalPages ? "1.5px solid #1ab373" : "1px solid #e5e7eb",
              background: currentPage === totalPages ? "#f0fdf4" : "#fff",
              color: currentPage === totalPages ? "#15803d" : "#374151",
              fontSize: 13,
              fontWeight: currentPage === totalPages ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {totalPages}
          </button>

          {/* Next */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: currentPage === totalPages ? "#d1d5db" : "#374151",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronIcon dir="right" />
          </button>

          {/* Go to page */}
          <div className="flex items-center gap-1.5" style={{ marginLeft: 8 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              defaultValue=""
              placeholder="—"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = parseInt((e.target as HTMLInputElement).value, 10);
                  if (!isNaN(v) && v >= 1 && v <= totalPages) setCurrentPage(v);
                }
              }}
              style={{
                width: 48,
                height: 30,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                padding: "0 8px",
                fontSize: 13,
                textAlign: "center",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder panel for unbuilt screens ────────────────────────────────────

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height: 400, color: "#9ca3af" }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 16 }}>
        <rect x="4" y="4" width="40" height="40" rx="10" stroke="#d1d5db" strokeWidth="2" />
        <path d="M16 24h16M24 16v16" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p style={{ fontSize: 15, fontWeight: 500, color: "#6b7280" }}>{title}</p>
      <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>This screen is coming soon</p>
    </div>
  );
}

// ─── Main PurchasesScreen ─────────────────────────────────────────────────────

interface PurchasesScreenProps {
  activeSubScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export default function PurchasesScreen({ activeSubScreen, onNavigate }: PurchasesScreenProps) {
  const isRequests = activeSubScreen === "purchases-requests";
  const activeTab = TABS.find((t) => t.screen === activeSubScreen) ?? TABS[2];

  return (
    <div className="flex flex-col" style={{ height: "100%", overflowY: "auto" }}>
      {/* ── Page header ── */}
      <div
        style={{
          padding: "20px 28px 0",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>Purchases</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 10l4-3-4-3" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{activeTab.label}</span>
        </div>

        {/* Title + Export */}
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
            {activeTab.label}
          </h1>
          <button
            className="inline-flex items-center gap-2"
            style={{
              height: 36,
              paddingLeft: 14,
              paddingRight: 14,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 13,
              fontWeight: 500,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Export data
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-end gap-0" style={{ overflowX: "auto" }}>
          {TABS.map((tab) => {
            const active = tab.screen === activeSubScreen;
            return (
              <button
                key={tab.screen}
                onClick={() => onNavigate(tab.screen)}
                style={{
                  height: 40,
                  paddingLeft: 16,
                  paddingRight: 16,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#1ab373" : "#6b7280",
                  borderBottom: active ? "2.5px solid #1ab373" : "2.5px solid transparent",
                  background: "transparent",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filter bar (only for Purchase Requests) ── */}
      {isRequests && (
        <div
          className="flex items-center gap-2"
          style={{
            padding: "14px 28px",
            background: "#fff",
            borderBottom: "1px solid #f3f4f6",
            overflowX: "auto",
            flexShrink: 0,
          }}
        >
          <FilterPill label="All Time" />
          <FilterPill label="All Agents" />
          <FilterPill label="All Communities" />
          <FilterPill label="Approval Status" />
          <FilterPill label="Sourcing status" />
          <FilterPill label="Disbursement Status" />
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ padding: "20px 28px", flex: 1 }}>
        {isRequests ? (
          <PurchaseRequestsTable />
        ) : (
          <PlaceholderPanel title={activeTab.label} />
        )}
      </div>
    </div>
  );
}
