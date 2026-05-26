"use client";

import { useState, useRef } from "react";
import type { AppScreen } from "./sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApprovalStatus = "Pending" | "Ticket activated" | "Approved" | "Rejected";

interface PurchaseRequest {
  id:                  string;
  refCode:             string;
  dateOfRequest:       string;
  community:           string;
  agentName:           string;
  commodity:           string;
  expectedQty:         string;
  approvalStatus:      ApprovalStatus;
  totalPrice:          number;
  isRecoveryPurchase?: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_REQUESTS: PurchaseRequest[] = [
  {
    id: "1", refCode: "CS-2410-00111-DMF", dateOfRequest: "Jul 13, 2025",
    community: "Boro",        agentName: "Hashim Sufyan Tagra",   commodity: "Soybeans",
    expectedQty: "5,000.00 kg", approvalStatus: "Ticket activated", totalPrice: 25000, isRecoveryPurchase: true,
  },
  {
    id: "2", refCode: "CS-2410-00111-DMF", dateOfRequest: "Jul 15, 2025",
    community: "Kolbayiri",   agentName: "Abdul Jalilu Mohammed", commodity: "Shea nuts",
    expectedQty: "1.00 kg",     approvalStatus: "Pending",          totalPrice: 4.80,
  },
  {
    id: "3", refCode: "CS-2410-00109-SM",  dateOfRequest: "Jul 25, 2025",
    community: "Kolbayiri",   agentName: "Abdul Jalilu Mohammed", commodity: "Shea nuts",
    expectedQty: "5,100.00 kg", approvalStatus: "Pending",          totalPrice: 33609,
  },
  {
    id: "4", refCode: "CS-2410-00108-AA",  dateOfRequest: "Jun 1, 2025",
    community: "Linpou",      agentName: "Zakaria Yakubu",        commodity: "Shea nuts",
    expectedQty: "10,000.00 kg",approvalStatus: "Ticket activated", totalPrice: 50000, isRecoveryPurchase: true,
  },
  {
    id: "5", refCode: "CS-2410-00107-AA",  dateOfRequest: "Jun 3, 2025",
    community: "Badimsuguru", agentName: "Damtonu Bariche",       commodity: "Shea nuts",
    expectedQty: "1.00 kg",     approvalStatus: "Pending",          totalPrice: 4.80,
  },
  {
    id: "6", refCode: "CS-2410-00106-SM",  dateOfRequest: "Jun 10, 2025",
    community: "Tambiigu",    agentName: "Inusah Bukari",         commodity: "Shea nuts",
    expectedQty: "4,000.00 kg", approvalStatus: "Ticket activated", totalPrice: 20000, isRecoveryPurchase: true,
  },
  {
    id: "7", refCode: "CS-2410-00105-KSS", dateOfRequest: "Jun 23, 2025",
    community: "TUVUU",       agentName: "Mutari Ibrahim",        commodity: "Shea nuts",
    expectedQty: "3,000.00 kg", approvalStatus: "Pending",          totalPrice: 18000,
  },
  {
    id: "8", refCode: "CS-2410-00104-AS",  dateOfRequest: "May 12, 2025",
    community: "Jablajo",     agentName: "Fusheni Tinaibei",      commodity: "Shea nuts",
    expectedQty: "6,000.00 kg", approvalStatus: "Pending",          totalPrice: 36000,
  },
  {
    id: "9", refCode: "CS-2410-00103-ABY", dateOfRequest: "May 16, 2025",
    community: "Jablajo",     agentName: "Fusheni Tinaibei",      commodity: "Shea nuts",
    expectedQty: "10,000.00 kg",approvalStatus: "Ticket activated", totalPrice: 60000, isRecoveryPurchase: true,
  },
  {
    id: "10",refCode: "CS-2410-00102-JB",  dateOfRequest: "May 14, 2025",
    community: "Puzene",      agentName: "Abass Sakulo",          commodity: "Shea nuts",
    expectedQty: "10,000.00 kg",approvalStatus: "Pending",          totalPrice: 60000,
  },
];

// ─── PRE data ────────────────────────────────────────────────────────────────

type PaymentStatus = "Full Payment" | "Pending payment" | "Partial payment";

interface PRERequest {
  id:                 string;
  dateOfRequest:      string;
  requestingOfficer:  string;
  community:          string;
  subRequests:        number;
  noOfBags:           number;
  totalExpense:       number;
  progress:           string;
  paymentStatus:      PaymentStatus;
  isRecovery?:        boolean;
}

const MOCK_PRE_REQUESTS: PRERequest[] = [
  { id: "1",  dateOfRequest: "Nov 17, 2025", requestingOfficer: "Joseph Mensah",  community: "Apengu",      subRequests: 5,  noOfBags: 5,  totalExpense: 82000, progress: "5/5",  paymentStatus: "Full Payment",    isRecovery: true },
  { id: "2",  dateOfRequest: "Nov 25, 2025", requestingOfficer: "Ama Kusi",       community: "Amsterdam",   subRequests: 9,  noOfBags: 50, totalExpense: 82000, progress: "0/9",  paymentStatus: "Pending payment" },
  { id: "3",  dateOfRequest: "Nov 18, 2025", requestingOfficer: "Ama Appiah",     community: "Aba",         subRequests: 4,  noOfBags: 2,  totalExpense: 82000, progress: "0/4",  paymentStatus: "Pending payment" },
  { id: "4",  dateOfRequest: "Nov 19, 2025", requestingOfficer: "Joseph Mensah",  community: "Akosa",       subRequests: 5,  noOfBags: 25, totalExpense: 82000, progress: "0/5",  paymentStatus: "Pending payment", isRecovery: true },
  { id: "5",  dateOfRequest: "Nov 20, 2025", requestingOfficer: "Bernard Bortey", community: "Kowie",       subRequests: 3,  noOfBags: 15, totalExpense: 82000, progress: "2/3",  paymentStatus: "Partial payment" },
  { id: "6",  dateOfRequest: "Nov 21, 2025", requestingOfficer: "Bernard Bortey", community: "Dagbanjado",  subRequests: 1,  noOfBags: 30, totalExpense: 82000, progress: "1/6",  paymentStatus: "Partial payment", isRecovery: true },
  { id: "7",  dateOfRequest: "Nov 22, 2025", requestingOfficer: "Bernard Bortey", community: "Bachuriyiri", subRequests: 3,  noOfBags: 8,  totalExpense: 82000, progress: "2/3",  paymentStatus: "Partial payment" },
  { id: "8",  dateOfRequest: "Nov 23, 2025", requestingOfficer: "Joseph Mensah",  community: "Apengu",      subRequests: 4,  noOfBags: 40, totalExpense: 82000, progress: "0/4",  paymentStatus: "Pending payment" },
  { id: "9",  dateOfRequest: "Nov 24, 2025", requestingOfficer: "Ama Kusi",       community: "Nasia",       subRequests: 5,  noOfBags: 22, totalExpense: 82000, progress: "0/5",  paymentStatus: "Pending payment", isRecovery: true },
  { id: "10", dateOfRequest: "Nov 24, 2025", requestingOfficer: "Ama Kusi",       community: "Apengu",      subRequests: 14, noOfBags: 22, totalExpense: 82000, progress: "0/4",  paymentStatus: "Pending payment" },
];

// ─── Screen label map ─────────────────────────────────────────────────────────

const SCREEN_LABELS: Partial<Record<AppScreen, string>> = {
  "purchases-dashboard":       "Dashboard",
  "purchases-list":            "Purchase List",
  "purchases-requests":        "Purchase Requests",
  "purchases-reconciliations": "Reconciliations",
  "purchases-pres":            "PREs",
  "purchases-warehouse":       "Warehouse Stock",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
      style={{ background: s.bg, color: s.color, whiteSpace: "nowrap" }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function paymentChip(status: PaymentStatus) {
  const cfg: Record<PaymentStatus, { bg: string; color: string }> = {
    "Full Payment":    { bg: "#f0fdf4", color: "#15803d" },
    "Pending payment": { bg: "#fffbeb", color: "#d97706" },
    "Partial payment": { bg: "#eff6ff", color: "#1d4ed8" },
  };
  const s = cfg[status];
  return (
    <span
      style={{
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, whiteSpace: "nowrap",
      }}
    >
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
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ transform: dir === "right" ? "rotate(180deg)" : undefined }}
      aria-hidden="true"
    >
      <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DoubleChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ transform: dir === "right" ? "rotate(180deg)" : undefined }}
      aria-hidden="true"
    >
      <path d="M7 10L3 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 10L7 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Recovery indicator icon with tooltip ─────────────────────────────────────

function RecoveryIndicator({
  title = "Recovery purchase request",
  body  = "This purchase request was submitted and activated as part of a pre-financing recovery request.",
}: { title?: string; body?: string } = {}) {
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);

  function showTip() {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTip({ top: r.bottom + 8, left: r.left - 12 });
  }

  return (
    <>
      <button
        ref={ref}
        onMouseEnter={showTip}
        onMouseLeave={() => setTip(null)}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center" }}
        aria-label={title}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.2" />
          <path d="M8 5v.5M8 7.5v4" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {tip && (
        <div
          style={{
            position: "fixed",
            top: tip.top,
            left: tip.left,
            zIndex: 9999,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            padding: "16px 20px",
            maxWidth: 280,
            pointerEvents: "none",
          }}
        >
          <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f59e0b", margin: "0 0 8px" }}>
            {title}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0, lineHeight: 1.55 }}>
            {body}
          </p>
        </div>
      )}
    </>
  );
}

// ─── Filter pill ──────────────────────────────────────────────────────────────

function FilterPill({ label, calendar }: { label: string; calendar?: boolean }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 transition-colors"
      style={{
        height: 34, paddingLeft: 12, paddingRight: 10,
        borderRadius: 8, border: "1px solid #e5e7eb",
        background: "#fff", fontSize: 13, fontWeight: 500, color: "#374151", whiteSpace: "nowrap",
      }}
    >
      {calendar && (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="#6b7280" strokeWidth="1.3" />
          <path d="M4 1v3M10 1v3" stroke="#6b7280" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M1 5.5h12" stroke="#6b7280" strokeWidth="1.3" />
        </svg>
      )}
      {label}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3 5l4 4 4-4" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ─── Purchase Requests table ──────────────────────────────────────────────────

function PurchaseRequestsTable({ searchQuery }: { searchQuery: string }) {
  const [copied,      setCopied]      = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalRows  = 130;
  const totalPages = 13;

  const q = searchQuery.toLowerCase().trim();
  const rows = q
    ? MOCK_REQUESTS.filter(
        (r) =>
          r.refCode.toLowerCase().includes(q) ||
          r.community.toLowerCase().includes(q) ||
          r.agentName.toLowerCase().includes(q) ||
          r.commodity.toLowerCase().includes(q)
      )
    : MOCK_REQUESTS;

  function copyRef(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  const TH = ({ children, right, sticky }: { children?: React.ReactNode; right?: boolean; sticky?: boolean }) => (
    <th
      style={{
        padding: "10px 14px",
        textAlign: right ? "right" : "left",
        fontSize: 11, fontWeight: 600, color: "#6b7280",
        textTransform: "uppercase", letterSpacing: "0.05em",
        borderBottom: "1px solid #e5e7eb", background: "#f9fafb", whiteSpace: "nowrap",
        ...(sticky ? { position: "sticky", left: 0, zIndex: 2 } : {}),
      }}
    >
      {children}
    </th>
  );

  return (
    <div className="flex flex-col" style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
          <thead>
            <tr>
              <TH sticky>Reference Code</TH>
              <TH>Date of Request</TH>
              <TH>Community</TH>
              <TH>Agent's Name</TH>
              <TH>Commodity</TH>
              <TH>Expected Quantity</TH>
              <TH>Approval Status</TH>
              <TH right>Total Price</TH>
              <TH>Action</TH>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "40px 14px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                  No results match your search
                </td>
              </tr>
            ) : rows.map((row, i) => (
              <tr
                key={row.id}
                style={{ borderBottom: i < rows.length - 1 ? "1px solid #f3f4f6" : undefined, transition: "background 0.1s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f9fafb")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "")}
              >
                {/* Reference Code */}
                <td style={{ padding: "12px 14px", position: "sticky", left: 0, zIndex: 1, background: "#fff", whiteSpace: "nowrap" }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#111827", letterSpacing: "0.03em" }}>
                      {row.refCode}
                    </span>
                    <button
                      onClick={() => copyRef(row.refCode)}
                      style={{ color: copied === row.refCode ? "#16a34a" : "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 2, borderRadius: 4, display: "flex", alignItems: "center" }}
                      title="Copy reference code"
                    >
                      {copied === row.refCode ? (
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l3.5 3.5 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : <CopyIcon />}
                    </button>
                  </div>
                </td>

                {/* Date */}
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>
                  {row.dateOfRequest}
                </td>

                {/* Community + recovery indicator */}
                <td style={{ padding: "12px 14px" }}>
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: 13, color: "#374151" }}>{row.community}</span>
                    {row.isRecoveryPurchase && <RecoveryIndicator />}
                  </div>
                </td>

                {/* Agent */}
                <td style={{ padding: "12px 14px", maxWidth: 160 }}>
                  <span
                    title={row.agentName}
                    style={{ fontSize: 13, color: "#374151", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {row.agentName}
                  </span>
                </td>

                {/* Commodity */}
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{row.commodity}</td>

                {/* Expected Qty */}
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 500, color: "#111827", textAlign: "right" }}>
                  {row.expectedQty}
                </td>

                {/* Approval Status */}
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{approvalChip(row.approvalStatus)}</td>

                {/* Total Price */}
                <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>
                  GHS {fmtPrice(row.totalPrice)}
                </td>

                {/* Action */}
                <td style={{ padding: "12px 14px" }}>
                  <button
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", cursor: "pointer" }}
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
        style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap", gap: 12 }}
      >
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          Total Rows: <strong style={{ color: "#111827" }}>{q ? rows.length : totalRows.toLocaleString()}</strong>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: currentPage === 1 ? "#d1d5db" : "#374151", cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronIcon dir="left" />
          </button>

          {[1, 2, 3, 4].map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              style={{ width: 30, height: 30, borderRadius: 6, border: currentPage === p ? "1.5px solid #1ab373" : "1px solid #e5e7eb", background: currentPage === p ? "#f0fdf4" : "#fff", color: currentPage === p ? "#15803d" : "#374151", fontSize: 13, fontWeight: currentPage === p ? 600 : 400, cursor: "pointer" }}
            >
              {p}
            </button>
          ))}

          <span style={{ fontSize: 13, color: "#9ca3af", padding: "0 2px" }}>…</span>

          <button
            onClick={() => setCurrentPage(totalPages)}
            style={{ width: 30, height: 30, borderRadius: 6, border: currentPage === totalPages ? "1.5px solid #1ab373" : "1px solid #e5e7eb", background: currentPage === totalPages ? "#f0fdf4" : "#fff", color: currentPage === totalPages ? "#15803d" : "#374151", fontSize: 13, fontWeight: currentPage === totalPages ? 600 : 400, cursor: "pointer" }}
          >
            {totalPages}
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: currentPage === totalPages ? "#d1d5db" : "#374151", cursor: currentPage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronIcon dir="right" />
          </button>

          <div className="flex items-center gap-1.5" style={{ marginLeft: 8 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Go to</span>
            <input
              type="number" min={1} max={totalPages} defaultValue="" placeholder="—"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = parseInt((e.target as HTMLInputElement).value, 10);
                  if (!isNaN(v) && v >= 1 && v <= totalPages) setCurrentPage(v);
                }
              }}
              style={{ width: 48, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", padding: "0 8px", fontSize: 13, textAlign: "center", outline: "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PREs table ──────────────────────────────────────────────────────────────

function PREsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  const PRETH = ({ children, right, center }: { children?: React.ReactNode; right?: boolean; center?: boolean }) => (
    <th
      style={{
        padding: "10px 14px",
        textAlign: center ? "center" : right ? "right" : "left",
        fontSize: 11, fontWeight: 600, color: "#6b7280",
        textTransform: "uppercase", letterSpacing: "0.05em",
        borderBottom: "1px solid #e5e7eb", background: "#f9fafb", whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );

  return (
    <div className="flex flex-col" style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
          <thead>
            <tr>
              <PRETH>Date of request</PRETH>
              <PRETH>Requesting officer</PRETH>
              <PRETH>Community</PRETH>
              <PRETH center>Sub requests</PRETH>
              <PRETH center>No of bags</PRETH>
              <PRETH right>Total expense</PRETH>
              <PRETH right>Progress</PRETH>
              <PRETH>Payment Status</PRETH>
            </tr>
          </thead>
          <tbody>
            {MOCK_PRE_REQUESTS.map((row, i) => (
              <tr
                key={row.id}
                style={{ borderBottom: i < MOCK_PRE_REQUESTS.length - 1 ? "1px solid #f3f4f6" : undefined, transition: "background 0.1s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f9fafb")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "")}
              >
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.dateOfRequest}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{row.requestingOfficer}</td>
                <td style={{ padding: "12px 14px" }}>
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: 13, color: "#374151" }}>{row.community}</span>
                    {row.isRecovery && (
                      <RecoveryIndicator
                        title="Recovery PREs"
                        body="This PREs was submitted and activated as part of a pre-financing recovery request."
                      />
                    )}
                  </div>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151", textAlign: "center" }}>{row.subRequests}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151", textAlign: "center" }}>{row.noOfBags}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 500, color: "#111827", textAlign: "right", whiteSpace: "nowrap" }}>
                  GHS {fmtPrice(row.totalExpense)}
                </td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 500, color: "#374151", textAlign: "right" }}>{row.progress}</td>
                <td style={{ padding: "12px 14px" }}>{paymentChip(row.paymentStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap", gap: 12 }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Total Rows: <strong style={{ color: "#111827" }}>{MOCK_PRE_REQUESTS.length}</strong>
        </span>

        <div className="flex items-center gap-1.5">
          {/* First */}
          <button
            onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
            style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: currentPage === 1 ? "#d1d5db" : "#374151", cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          ><DoubleChevronIcon dir="left" /></button>

          {/* Prev */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
            style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: currentPage === 1 ? "#d1d5db" : "#374151", cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          ><ChevronIcon dir="left" /></button>

          {/* Page numbers */}
          {[1, 2, 3, 4].map((p) => (
            <button
              key={p} onClick={() => setCurrentPage(p)}
              style={{ width: 30, height: 30, borderRadius: 6, border: currentPage === p ? "1.5px solid #1ab373" : "1px solid #e5e7eb", background: currentPage === p ? "#f0fdf4" : "#fff", color: currentPage === p ? "#15803d" : "#374151", fontSize: 13, fontWeight: currentPage === p ? 600 : 400, cursor: "pointer" }}
            >{p}</button>
          ))}

          {/* Next */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: currentPage === totalPages ? "#d1d5db" : "#374151", cursor: currentPage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          ><ChevronIcon dir="right" /></button>

          {/* Last */}
          <button
            onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
            style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: currentPage === totalPages ? "#d1d5db" : "#374151", cursor: currentPage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          ><DoubleChevronIcon dir="right" /></button>

          <span style={{ fontSize: 13, color: "#9ca3af", padding: "0 2px" }}>. . . . .</span>

          {/* Last page number button */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            style={{ width: 30, height: 30, borderRadius: 6, border: currentPage === totalPages ? "1.5px solid #1ab373" : "1px solid #e5e7eb", background: currentPage === totalPages ? "#f0fdf4" : "#fff", color: currentPage === totalPages ? "#15803d" : "#374151", fontSize: 13, fontWeight: currentPage === totalPages ? 600 : 400, cursor: "pointer" }}
          >{totalPages}</button>

          <div className="flex items-center gap-1.5" style={{ marginLeft: 8 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Go to</span>
            <input
              type="number" min={1} max={totalPages} defaultValue="" placeholder="—"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = parseInt((e.target as HTMLInputElement).value, 10);
                  if (!isNaN(v) && v >= 1 && v <= totalPages) setCurrentPage(v);
                }
              }}
              style={{ width: 48, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", padding: "0 8px", fontSize: 13, textAlign: "center", outline: "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder panel ────────────────────────────────────────────────────────

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ height: 400, color: "#9ca3af" }}>
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
  onNavigate:      (screen: AppScreen) => void;
}

export default function PurchasesScreen({ activeSubScreen, onNavigate }: PurchasesScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isRequests = activeSubScreen === "purchases-requests";
  const isPres     = activeSubScreen === "purchases-pres";
  const label = SCREEN_LABELS[activeSubScreen] ?? "Purchases";

  return (
    <div className="flex flex-col" style={{ height: "100%", overflowY: "auto" }}>

      {/* ── Page header ── */}
      <div style={{ padding: "20px 28px 0", borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>Purchases</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 10l4-3-4-3" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{label}</span>
        </div>

        {/* Search + Export (Purchase Requests only) */}
        {isRequests && (
          <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
            <div
              className="flex items-center gap-2 flex-1"
              style={{ height: 40, paddingLeft: 12, paddingRight: 12, border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", maxWidth: 440 }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="6.5" cy="6.5" r="5" stroke="#9ca3af" strokeWidth="1.4" />
                <path d="M10.5 10.5l3 3" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search for commodity"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#111827", background: "transparent" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", alignItems: "center" }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            <button
              className="inline-flex items-center gap-2 ml-auto"
              style={{ height: 40, paddingLeft: 14, paddingRight: 14, borderRadius: 8, border: "1.5px solid #1ab373", background: "#fff", fontSize: 13, fontWeight: 500, color: "#1ab373", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Export data
            </button>
          </div>
        )}

        {/* Non-requests header: title + export */}
        {!isRequests && (
          <div className="flex items-center justify-between" style={{ marginBottom: isPres ? 14 : 16 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>{label}</h1>
            <button
              className="inline-flex items-center gap-2"
              style={{
                height: isPres ? 40 : 36, paddingLeft: 14, paddingRight: 14, borderRadius: 8,
                border: isPres ? "1.5px solid #1ab373" : "1px solid #e5e7eb",
                background: "#fff", fontSize: 13, fontWeight: 500,
                color: isPres ? "#1ab373" : "#374151", cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Export data
            </button>
          </div>
        )}
      </div>

      {/* ── Filter bar ── */}
      {(isRequests || isPres) && (
        <div
          className="flex items-center gap-2"
          style={{ padding: "12px 28px", background: "#fff", borderBottom: "1px solid #f3f4f6", overflowX: "auto", flexShrink: 0 }}
        >
          {isRequests ? (
            <>
              <FilterPill label="All Time" calendar />
              <FilterPill label="All Agents" />
              <FilterPill label="All Communities" />
              <FilterPill label="Approval Status" />
              <button
                className="inline-flex items-center gap-1.5"
                style={{ height: 34, paddingLeft: 10, paddingRight: 12, borderRadius: 8, border: "1px dashed #d1d5db", background: "transparent", fontSize: 13, fontWeight: 500, color: "#6b7280", whiteSpace: "nowrap", cursor: "pointer" }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Add filter
              </button>
            </>
          ) : (
            <>
              <FilterPill label="All time" calendar />
              <FilterPill label="All Agents" />
              <FilterPill label="All Communities" />
              <FilterPill label="Payment Status" />
            </>
          )}
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ padding: "20px 28px", flex: 1 }}>
        {isRequests ? (
          <PurchaseRequestsTable searchQuery={searchQuery} />
        ) : isPres ? (
          <PREsTable />
        ) : (
          <PlaceholderPanel title={label} />
        )}
      </div>
    </div>
  );
}
