"use client";

import { useState, useRef, useEffect } from "react";
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
type DisbursementStatus = "Disbursed" | "Pending" | "Partial";

interface SubRequestItem {
  id:                 string;
  refCode:            string;
  itemDescription:    string;
  unitCost:           number;
  numberOfBags:       number;
  momoName:           string;
  momoNumber:         string;
  disbursed1st:       boolean;
  disbursed2nd:       boolean;
  disbursed3rd:       boolean;
  disbursementStatus: DisbursementStatus;
}

interface PRERequest {
  id:                      string;
  dateOfRequest:           string;
  requestingOfficer:       string;
  community:               string;
  subRequests:             number;
  noOfBags:                number;
  totalExpense:            number;
  progress:                string;
  paymentStatus:           PaymentStatus;
  isRecovery?:             boolean;
  commodity?:              string;
  discussedWithLogistics?: boolean;
  subRequestItems?:        SubRequestItem[];
  bagsRecovered?:          number;
  bagsRecoveredWeight?:    number;
  bagsPurchased?:          number;
  bagsPurchasedWeight?:    number;
  bagsMixed?:              number;
  bagsMixedWeight?:        number;
}

const MOCK_PRE_REQUESTS: PRERequest[] = [
  { id: "1",  dateOfRequest: "Nov 17, 2025", requestingOfficer: "Joseph Mensah",  community: "Gbimsi",      subRequests: 4,  noOfBags: 147, totalExpense: 3087, progress: "4/4",  paymentStatus: "Full Payment",    isRecovery: true, commodity: "Shea nuts", discussedWithLogistics: true,
    bagsRecovered: 62, bagsRecoveredWeight: 4960, bagsPurchased: 60, bagsPurchasedWeight: 4800, bagsMixed: 25, bagsMixedWeight: 2000,
    subRequestItems: [
      { id: "sr1-1", refCode: "PRE-2605-00156-ASH", itemDescription: "Sewing and weighing",    unitCost: 2.00,  numberOfBags: 147, momoName: "Alhassan Saaka Haadi", momoNumber: "0245295772", disbursed1st: true, disbursed2nd: true, disbursed3rd: true, disbursementStatus: "Disbursed" },
      { id: "sr1-2", refCode: "PRE-2605-00157-ASH", itemDescription: "Offloading and Packing", unitCost: 2.00,  numberOfBags: 147, momoName: "Alhassan Saaka Haadi", momoNumber: "0245295772", disbursed1st: true, disbursed2nd: true, disbursed3rd: true, disbursementStatus: "Disbursed" },
      { id: "sr1-3", refCode: "PRE-2605-00158-ASH", itemDescription: "Loading from community", unitCost: 2.00,  numberOfBags: 147, momoName: "Alhassan Saaka Haadi", momoNumber: "0245295772", disbursed1st: true, disbursed2nd: true, disbursed3rd: true, disbursementStatus: "Disbursed" },
      { id: "sr1-4", refCode: "PRE-2605-00159-ASH", itemDescription: "Tricycle Transport",     unitCost: 15.00, numberOfBags: 147, momoName: "Alhassan Saaka Haadi", momoNumber: "0245295772", disbursed1st: true, disbursed2nd: true, disbursed3rd: true, disbursementStatus: "Disbursed" },
    ] },
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

// ─── Check circle (disbursement indicator) ───────────────────────────────────

function CheckCircle({ checked }: { checked: boolean }) {
  if (!checked) return (
    <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1.5px solid #d1d5db", background: "#fff", display: "inline-block" }} />
  );
  return (
    <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1.5px solid #16a34a", background: "#f0fdf4", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function disbursementChip(status: DisbursementStatus) {
  const cfg: Record<DisbursementStatus, { bg: string; color: string; dot: string }> = {
    "Disbursed": { bg: "#f0fdf4", color: "#15803d", dot: "#16a34a" },
    "Pending":   { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
    "Partial":   { bg: "#eff6ff", color: "#1d4ed8", dot: "#2563eb" },
  };
  const s = cfg[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
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
    const tooltipW = 296;
    const tooltipH = 90;
    const left = Math.min(r.left - 12, window.innerWidth - tooltipW - 8);
    const top = r.bottom + 8 + tooltipH > window.innerHeight
      ? r.top - tooltipH - 8
      : r.bottom + 8;
    setTip({ top, left });
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

function PREsTable({ onRowClick }: { onRowClick: (id: string) => void }) {
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
                style={{ borderBottom: i < MOCK_PRE_REQUESTS.length - 1 ? "1px solid #f3f4f6" : undefined, transition: "background 0.1s", cursor: "pointer" }}
                onClick={() => onRowClick(row.id)}
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

// ─── Purchase List ────────────────────────────────────────────────────────────

type DisbursementStatusLabel = "Successful" | "Not applicable" | "Pending" | "Failed";

interface CommodityItem {
  commodity:   string;
  quantityKg:  number;
  amountGHS:   number;
}

interface PurchaseEntry {
  id:                   string;
  referenceCode:        string;
  dateOfPurchase:       string;
  agent:                string;
  agentHasWarning?:     boolean;
  farmerName:           string;
  farmerId?:            string;
  community?:           string;
  momoNumber?:          string;
  walletName?:          string;
  isRecoveryPurchase?:  boolean;
  totalQuantityKg:      number;
  totalPriceGHS:        number;
  disbursementStatus:   DisbursementStatusLabel;
  commodityItems?:      CommodityItem[];
}

const MOCK_ACTIVATED_ENTRIES: PurchaseEntry[] = [
  { id: "a1",  referenceCode: "CS-2605-00273-ARB-200263", dateOfPurchase: "May 30, 2026", agent: "Abdul Razak Bushran", agentHasWarning: true, farmerName: "Iddrisu Abdulai",  farmerId: "149812", community: "Tamale",   momoNumber: "0244123456", walletName: "Abdulai Iddrisu",             totalQuantityKg: 32.88,    totalPriceGHS: 197.28,     disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 32.88, amountGHS: 197.28 }] },
  { id: "a2",  referenceCode: "CS-2605-00273-ARB-200184", dateOfPurchase: "May 30, 2026", agent: "Abdul Razak Bushran", agentHasWarning: true, farmerName: "Iddrisu Abdulai",  farmerId: "149812", community: "Tamale",   momoNumber: "0244123456", walletName: "Abdulai Iddrisu",             totalQuantityKg: 3921.20,  totalPriceGHS: 23527.20,   disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 1960.60, amountGHS: 11763.60 }, { commodity: "Shea nuts", quantityKg: 1960.60, amountGHS: 11763.60 }] },
  { id: "a3",  referenceCode: "CS-2605-00271-ZY-200181",  dateOfPurchase: "May 21, 2026", agent: "Zakaria Yakubu",     farmerName: "Salifu Issah",     isRecoveryPurchase: true, farmerId: "148901", community: "Savelugu", momoNumber: "0557891234", walletName: "Issah Salifu / GCB",          totalQuantityKg: 306.70,   totalPriceGHS: 1840.20,    disbursementStatus: "Not applicable",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 153.35, amountGHS: 920.10 }, { commodity: "Soybeans", quantityKg: 153.35, amountGHS: 920.10 }] },
  { id: "a4",  referenceCode: "CS-2605-00271-ZY-199989",  dateOfPurchase: "May 21, 2026", agent: "Zakaria Yakubu",     farmerName: "Salifu Issah",     isRecoveryPurchase: true, farmerId: "148901", community: "Savelugu", momoNumber: "0557891234", walletName: "Issah Salifu / GCB",          totalQuantityKg: 18928.30, totalPriceGHS: 113569.80,  disbursementStatus: "Not applicable",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 9464.15, amountGHS: 56784.90 }, { commodity: "Soybeans", quantityKg: 9464.15, amountGHS: 56784.90 }] },
  { id: "a5",  referenceCode: "CS-2605-00264-ZY-199985",  dateOfPurchase: "May 12, 2026", agent: "Zakaria Yakubu",     farmerName: "Tettevi Belinda",                            farmerId: "149993", community: "Yendi",    momoNumber: "0240452347", walletName: "Gbewa Quality/ Seidu Misbaw", totalQuantityKg: 401.30,   totalPriceGHS: 2327.54,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 100.15, amountGHS: 580.87 }, { commodity: "Soybeans", quantityKg: 100.05, amountGHS: 580.29 }, { commodity: "Soybeans", quantityKg: 100.50, amountGHS: 582.90 }, { commodity: "Soybeans", quantityKg: 100.60, amountGHS: 583.48 }] },
  { id: "a6",  referenceCode: "CS-2605-00260-KM-199812",  dateOfPurchase: "May 10, 2026", agent: "Kofi Mensah",        farmerName: "Abena Owusu",                                farmerId: "149701", community: "Kumbungu", momoNumber: "0246543210", walletName: "Owusu Abena",                  totalQuantityKg: 580.00,   totalPriceGHS: 3480.00,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 290.00, amountGHS: 1740.00 }, { commodity: "Shea nuts", quantityKg: 290.00, amountGHS: 1740.00 }] },
  { id: "a7",  referenceCode: "CS-2605-00258-AO-199776",  dateOfPurchase: "May 8, 2026",  agent: "Ama Owusu",          farmerName: "Alidu Fuseini",    isRecoveryPurchase: true, farmerId: "149650", community: "Tolon",    momoNumber: "0241987654", walletName: "Fuseini Alidu",                totalQuantityKg: 1200.50,  totalPriceGHS: 7203.00,    disbursementStatus: "Pending",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 600.25, amountGHS: 3601.50 }, { commodity: "Soybeans", quantityKg: 600.25, amountGHS: 3601.50 }] },
  { id: "a8",  referenceCode: "CS-2605-00255-AB-199701",  dateOfPurchase: "May 5, 2026",  agent: "Akosua Boateng",     farmerName: "Mariama Dauda",                              farmerId: "149580", community: "Karaga",   momoNumber: "0243765432", walletName: "Dauda Mariama",                totalQuantityKg: 750.00,   totalPriceGHS: 4500.00,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 250.00, amountGHS: 1500.00 }, { commodity: "Shea nuts", quantityKg: 250.00, amountGHS: 1500.00 }, { commodity: "Shea nuts", quantityKg: 250.00, amountGHS: 1500.00 }] },
  { id: "a9",  referenceCode: "CS-2605-00253-KA-199640",  dateOfPurchase: "May 3, 2026",  agent: "Kwame Asante",       farmerName: "Rahinatu Yahaya",                            farmerId: "149510", community: "Gushegu",  momoNumber: "0248321098", walletName: "Yahaya Rahinatu",               totalQuantityKg: 430.60,   totalPriceGHS: 2583.60,    disbursementStatus: "Not applicable",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 215.30, amountGHS: 1291.80 }, { commodity: "Soybeans", quantityKg: 215.30, amountGHS: 1291.80 }] },
  { id: "a10", referenceCode: "CS-2605-00251-ZY-199588",  dateOfPurchase: "May 1, 2026",  agent: "Zakaria Yakubu",     farmerName: "Fuseini Dramani",  isRecoveryPurchase: true, farmerId: "149460", community: "Savelugu", momoNumber: "0557654321", walletName: "Dramani Fuseini",               totalQuantityKg: 2105.00,  totalPriceGHS: 12630.00,   disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 701.67, amountGHS: 4210.00 }, { commodity: "Soybeans", quantityKg: 701.67, amountGHS: 4210.00 }, { commodity: "Soybeans", quantityKg: 701.66, amountGHS: 4210.00 }] },
  { id: "a11", referenceCode: "CS-2605-00247-ARB-199410", dateOfPurchase: "Apr 28, 2026", agent: "Abdul Razak Bushran", agentHasWarning: true, farmerName: "Issaka Sumaila",   farmerId: "149320", community: "Tamale",   momoNumber: "0244876543", walletName: "Sumaila Issaka",               totalQuantityKg: 875.20,   totalPriceGHS: 5251.20,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 437.60, amountGHS: 2625.60 }, { commodity: "Shea nuts", quantityKg: 437.60, amountGHS: 2625.60 }] },
  { id: "a12", referenceCode: "CS-2605-00244-KM-199325",  dateOfPurchase: "Apr 25, 2026", agent: "Kofi Mensah",        farmerName: "Bawah Naabu",                                farmerId: "149210", community: "Kumbungu", momoNumber: "0246234567", walletName: "Naabu Bawah",                  totalQuantityKg: 320.00,   totalPriceGHS: 1920.00,    disbursementStatus: "Failed",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 320.00, amountGHS: 1920.00 }] },
  { id: "a13", referenceCode: "CS-2605-00241-AO-199258",  dateOfPurchase: "Apr 22, 2026", agent: "Ama Owusu",          farmerName: "Habiba Ziblim",    isRecoveryPurchase: true, farmerId: "149150", community: "Tolon",    momoNumber: "0241543210", walletName: "Ziblim Habiba",                totalQuantityKg: 615.80,   totalPriceGHS: 3694.80,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 205.27, amountGHS: 1231.60 }, { commodity: "Soybeans", quantityKg: 205.27, amountGHS: 1231.60 }, { commodity: "Soybeans", quantityKg: 205.26, amountGHS: 1231.60 }] },
  { id: "a14", referenceCode: "CS-2605-00238-AB-199180",  dateOfPurchase: "Apr 19, 2026", agent: "Akosua Boateng",     farmerName: "Sulley Abdulai",                             farmerId: "149080", community: "Karaga",   momoNumber: "0243098765", walletName: "Abdulai Sulley",               totalQuantityKg: 490.00,   totalPriceGHS: 2940.00,    disbursementStatus: "Pending",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 245.00, amountGHS: 1470.00 }, { commodity: "Shea nuts", quantityKg: 245.00, amountGHS: 1470.00 }] },
  { id: "a15", referenceCode: "CS-2605-00235-KA-199102",  dateOfPurchase: "Apr 16, 2026", agent: "Kwame Asante",       farmerName: "Aminu Tampuri",    isRecoveryPurchase: true, farmerId: "149010", community: "Gushegu",  momoNumber: "0248765432", walletName: "Tampuri Aminu",                totalQuantityKg: 1050.40,  totalPriceGHS: 6302.40,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 350.13, amountGHS: 2100.80 }, { commodity: "Soybeans", quantityKg: 350.13, amountGHS: 2100.80 }, { commodity: "Soybeans", quantityKg: 350.14, amountGHS: 2100.80 }] },
];

const MOCK_DISBURSED_ENTRIES: PurchaseEntry[] = [
  { id: "d1",  referenceCode: "CS-2602-00180-ZY-196340",  dateOfPurchase: "Mar 28, 2026", agent: "Zakaria Yakubu",   farmerName: "Abiba Mahama",    isRecoveryPurchase: true, farmerId: "148205", community: "Savelugu", momoNumber: "0557112233", walletName: "Mahama Abiba",    totalQuantityKg: 1500.00,  totalPriceGHS: 9000.00,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 750.00, amountGHS: 4500.00 }, { commodity: "Soybeans", quantityKg: 750.00, amountGHS: 4500.00 }] },
  { id: "d2",  referenceCode: "CS-2602-00177-KM-196210",  dateOfPurchase: "Mar 25, 2026", agent: "Kofi Mensah",      farmerName: "Fati Seidu",                        farmerId: "148101", community: "Kumbungu", momoNumber: "0246445566", walletName: "Seidu Fati",      totalQuantityKg: 820.50,   totalPriceGHS: 4923.00,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 410.25, amountGHS: 2461.50 }, { commodity: "Shea nuts", quantityKg: 410.25, amountGHS: 2461.50 }] },
  { id: "d3",  referenceCode: "CS-2602-00174-AO-196088",  dateOfPurchase: "Mar 22, 2026", agent: "Ama Owusu",        farmerName: "Rahinatu Bawah",  isRecoveryPurchase: true, farmerId: "147980", community: "Tolon",    momoNumber: "0241334455", walletName: "Bawah Rahinatu", totalQuantityKg: 450.00,   totalPriceGHS: 2700.00,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 150.00, amountGHS: 900.00 }, { commodity: "Soybeans", quantityKg: 150.00, amountGHS: 900.00 }, { commodity: "Soybeans", quantityKg: 150.00, amountGHS: 900.00 }] },
  { id: "d4",  referenceCode: "CS-2602-00171-AB-195990",  dateOfPurchase: "Mar 19, 2026", agent: "Akosua Boateng",   farmerName: "Mariama Naabu",                     farmerId: "147870", community: "Karaga",   momoNumber: "0243556677", walletName: "Naabu Mariama",  totalQuantityKg: 2340.00,  totalPriceGHS: 14040.00,   disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 1170.00, amountGHS: 7020.00 }, { commodity: "Shea nuts", quantityKg: 1170.00, amountGHS: 7020.00 }] },
  { id: "d5",  referenceCode: "CS-2602-00168-KA-195880",  dateOfPurchase: "Mar 15, 2026", agent: "Kwame Asante",     farmerName: "Bintu Alhassan",  isRecoveryPurchase: true, farmerId: "147760", community: "Gushegu",  momoNumber: "0248778899", walletName: "Alhassan Bintu", totalQuantityKg: 675.80,   totalPriceGHS: 4054.80,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 337.90, amountGHS: 2027.40 }, { commodity: "Soybeans", quantityKg: 337.90, amountGHS: 2027.40 }] },
  { id: "d6",  referenceCode: "CS-2602-00165-ZY-195750",  dateOfPurchase: "Mar 10, 2026", agent: "Zakaria Yakubu",   farmerName: "Zenabu Mahama",                     farmerId: "147640", community: "Savelugu", momoNumber: "0557990011", walletName: "Mahama Zenabu",  totalQuantityKg: 910.00,   totalPriceGHS: 5460.00,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 455.00, amountGHS: 2730.00 }, { commodity: "Shea nuts", quantityKg: 455.00, amountGHS: 2730.00 }] },
  { id: "d7",  referenceCode: "CS-2602-00162-KM-195630",  dateOfPurchase: "Mar 5, 2026",  agent: "Kofi Mensah",      farmerName: "Habiba Ziblim",                     farmerId: "147520", community: "Kumbungu", momoNumber: "0246112233", walletName: "Ziblim Habiba",  totalQuantityKg: 380.20,   totalPriceGHS: 2281.20,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 190.10, amountGHS: 1140.60 }, { commodity: "Shea nuts", quantityKg: 190.10, amountGHS: 1140.60 }] },
  { id: "d8",  referenceCode: "CS-2601-00158-AO-195500",  dateOfPurchase: "Feb 28, 2026", agent: "Ama Owusu",        farmerName: "Hawa Abukari",    isRecoveryPurchase: true, farmerId: "147390", community: "Tolon",    momoNumber: "0241223344", walletName: "Abukari Hawa",   totalQuantityKg: 1725.00,  totalPriceGHS: 10350.00,   disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 575.00, amountGHS: 3450.00 }, { commodity: "Soybeans", quantityKg: 575.00, amountGHS: 3450.00 }, { commodity: "Soybeans", quantityKg: 575.00, amountGHS: 3450.00 }] },
  { id: "d9",  referenceCode: "CS-2601-00155-AB-195380",  dateOfPurchase: "Feb 22, 2026", agent: "Akosua Boateng",   farmerName: "Amina Iddrisu",                     farmerId: "147260", community: "Karaga",   momoNumber: "0243334455", walletName: "Iddrisu Amina",  totalQuantityKg: 560.00,   totalPriceGHS: 3360.00,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 280.00, amountGHS: 1680.00 }, { commodity: "Shea nuts", quantityKg: 280.00, amountGHS: 1680.00 }] },
  { id: "d10", referenceCode: "CS-2601-00152-KA-195250",  dateOfPurchase: "Feb 15, 2026", agent: "Kwame Asante",     farmerName: "Safiatu Tampuri",                   farmerId: "147130", community: "Gushegu",  momoNumber: "0248556677", walletName: "Tampuri Safiatu",totalQuantityKg: 2100.00,  totalPriceGHS: 12600.00,   disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Soybeans", quantityKg: 700.00, amountGHS: 4200.00 }, { commodity: "Soybeans", quantityKg: 700.00, amountGHS: 4200.00 }, { commodity: "Soybeans", quantityKg: 700.00, amountGHS: 4200.00 }] },
  { id: "d11", referenceCode: "CS-2601-00149-ZY-195110",  dateOfPurchase: "Feb 8, 2026",  agent: "Zakaria Yakubu",   farmerName: "Ramatu Fuseini",                    farmerId: "146990", community: "Savelugu", momoNumber: "0557778899", walletName: "Fuseini Ramatu", totalQuantityKg: 430.00,   totalPriceGHS: 2580.00,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 215.00, amountGHS: 1290.00 }, { commodity: "Shea nuts", quantityKg: 215.00, amountGHS: 1290.00 }] },
  { id: "d12", referenceCode: "CS-2601-00146-KM-194990",  dateOfPurchase: "Jan 30, 2026", agent: "Kofi Mensah",      farmerName: "Fatimatu Dauda",                    farmerId: "146860", community: "Kumbungu", momoNumber: "0246890123", walletName: "Dauda Fatimatu", totalQuantityKg: 800.60,   totalPriceGHS: 4803.60,    disbursementStatus: "Successful",
    commodityItems: [{ commodity: "Shea nuts", quantityKg: 400.30, amountGHS: 2401.80 }, { commodity: "Shea nuts", quantityKg: 400.30, amountGHS: 2401.80 }] },
];

function disbursementStatusStyle(status: DisbursementStatusLabel): React.CSSProperties {
  switch (status) {
    case "Successful":     return { color: "#16a34a", fontWeight: 600 };
    case "Not applicable": return { color: "#6b7280" };
    case "Pending":        return { color: "#d97706", fontWeight: 600 };
    case "Failed":         return { color: "#dc2626", fontWeight: 600 };
  }
}

// ─── Purchase detail slide-over ───────────────────────────────────────────────

function PurchaseDetailPanel({
  entry,
  onClose,
}: {
  entry: PurchaseEntry;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline">("overview");

  const items = entry.commodityItems ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200 }}
        aria-hidden="true"
      />

      {/* Panel — scrollable */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 520,
          background: "#fff", zIndex: 201, overflowY: "auto",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.13)",
        }}
        role="dialog"
        aria-label="Purchase details"
      >
        {/* ── Header ── */}
        <div style={{ padding: "28px 28px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Purchase Details</h1>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "1.5px solid #d1d5db", background: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, color: "#6b7280",
            }}
            aria-label="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Farmer ── */}
        <div style={{ padding: "0 28px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#6366f1", color: "#fff", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, fontWeight: 700,
            }}
          >
            {entry.farmerName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>{entry.farmerName}</p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
              {[entry.farmerId, entry.community].filter(Boolean).join(" | ") || "—"}
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ padding: "0 28px 18px" }}>
          <div style={{ display: "inline-flex", background: "#f3f4f6", borderRadius: 8, padding: "3px", gap: 2 }}>
            {(["overview", "timeline"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  height: 32, paddingLeft: 18, paddingRight: 18, borderRadius: 6,
                  border: activeTab === tab ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
                  background: activeTab === tab ? "#fff" : "transparent",
                  boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)" : "none",
                  fontSize: 13, fontWeight: activeTab === tab ? 600 : 500,
                  color: activeTab === tab ? "#111827" : "#6b7280",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {tab === "overview" ? "Overview" : "Timeline"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick links ── */}
        <div style={{ padding: "0 28px 20px", display: "flex", gap: 28, flexWrap: "wrap" }}>
          <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#1ab373", textDecoration: "none" }}>
            <ExternalLinkIcon />
            View purchase request
          </a>
          <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#1ab373", textDecoration: "none" }}>
            <ExternalLinkIcon />
            View purchase reconciliations
          </a>
        </div>

        {/* ── Request details ── */}
        <div style={{ borderTop: "1px solid #f3f4f6" }}>
          <div style={{ padding: "10px 28px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>Request details</p>
          </div>
          <div style={{ padding: "16px 28px 20px" }}>
            {/* Row 1 — 3 cols */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px", marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 5px" }}>Purchase date</p>
                <p style={{ fontSize: 14, color: "#111827", margin: 0 }}>{entry.dateOfPurchase}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 5px" }}>Who bought items</p>
                <p style={{ fontSize: 14, color: "#111827", margin: 0 }}>{entry.agent}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 5px" }}>Community</p>
                <p style={{ fontSize: 14, color: "#111827", margin: 0 }}>{entry.community ?? "—"}</p>
              </div>
            </div>
            {/* Row 2 — 2 cols */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 5px" }}>MoMo number</p>
                <p style={{ fontSize: 14, color: "#111827", margin: 0 }}>{entry.momoNumber ?? "—"}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 5px" }}>Wallet name</p>
                <p style={{ fontSize: 14, color: "#111827", margin: 0 }}>{entry.walletName ?? "—"}</p>
              </div>
            </div>
            <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "#1ab373", textDecoration: "none" }}>
              Edit wallet details
            </a>
          </div>
        </div>

        {/* ── Commodity Bought ── */}
        <div style={{ borderTop: "1px solid #f3f4f6" }}>
          <div style={{ padding: "10px 28px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>Commodity Bought</p>
          </div>
          <div style={{ padding: "0 28px 28px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px 0 8px", textAlign: "left",  fontSize: 13, fontWeight: 700, color: "#111827", borderBottom: "1px solid #e5e7eb" }}>Commodity</th>
                  <th style={{ padding: "12px 0 8px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#111827", borderBottom: "1px solid #e5e7eb" }}>Quantity</th>
                  <th style={{ padding: "12px 0 8px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#111827", borderBottom: "1px solid #e5e7eb" }}>Amount</th>
                  <th style={{ padding: "12px 0 8px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#111827", borderBottom: "1px solid #e5e7eb" }}>App sourced weight</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ padding: "10px 0", fontSize: 13, color: "#374151", borderBottom: "1px solid #f3f4f6" }}>{item.commodity}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, color: "#374151", borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap" }}>
                      {item.quantityKg.toFixed(2)} kg
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, color: "#374151", borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap" }}>
                      GHS {item.amountGHS.toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 0 10px 16px", borderBottom: "1px solid #f3f4f6" }}>
                      <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "#1ab373", textDecoration: "none" }}>View</a>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "20px 0", fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
                      No commodity items available
                    </td>
                  </tr>
                )}
                {items.length > 0 && (
                  <>
                    {/* Total */}
                    <tr>
                      <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 700, color: "#111827", borderBottom: "1px solid #f3f4f6" }}>Total</td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#111827", borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap" }}>
                        {entry.totalQuantityKg.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
                      </td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#111827", borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap" }}>
                        GHS {entry.totalPriceGHS.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ borderBottom: "1px solid #f3f4f6" }} />
                    </tr>
                    {/* Amount due farmer */}
                    <tr>
                      <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 700, color: "#111827" }}>Amount due farmer</td>
                      <td />
                      <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
                        GHS {entry.totalPriceGHS.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td />
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function PurchaseListScreen() {
  const [activeTab,      setActiveTab]      = useState<"activated" | "disbursed">("activated");
  const [search,         setSearch]         = useState("");
  const [copiedId,       setCopiedId]       = useState<string | null>(null);
  const [page,           setPage]           = useState(1);
  const [selectedEntry,  setSelectedEntry]  = useState<PurchaseEntry | null>(null);

  const entries = activeTab === "activated" ? MOCK_ACTIVATED_ENTRIES : MOCK_DISBURSED_ENTRIES;
  const totalPages = activeTab === "activated" ? 210 : 195;
  const totalRowsHardcoded = 5228;

  const q = search.toLowerCase().trim();
  const filtered = q
    ? entries.filter(
        (e) =>
          e.referenceCode.toLowerCase().includes(q) ||
          e.agent.toLowerCase().includes(q) ||
          e.farmerName.toLowerCase().includes(q)
      )
    : entries;

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const PLTh = ({ children, right }: { children?: React.ReactNode; right?: boolean }) => (
    <th style={{
      padding: "10px 14px",
      textAlign: right ? "right" : "left",
      fontSize: 11, fontWeight: 600, color: "#6b7280",
      textTransform: "uppercase", letterSpacing: "0.05em",
      borderBottom: "1px solid #e5e7eb", background: "#f9fafb", whiteSpace: "nowrap",
    }}>
      {children}
    </th>
  );

  return (
    <>
    {selectedEntry && (
      <PurchaseDetailPanel
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    )}
    <div className="flex flex-col" style={{ height: "100%", overflowY: "auto" }}>

      {/* Header */}
      <div style={{ padding: "20px 28px 0", borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
        {/* Breadcrumb + export row */}
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 13, color: "#9ca3af" }}>Purchases</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 10l4-3-4-3" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Purchase List</span>
          </div>
          <button
            className="inline-flex items-center gap-2"
            style={{ height: 40, paddingLeft: 14, paddingRight: 14, borderRadius: 8, border: "1.5px solid #1ab373", background: "#fff", fontSize: 13, fontWeight: 500, color: "#1ab373", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Export data
          </button>
        </div>

        {/* Tabs — segmented control */}
        <div style={{ paddingTop: 16 }}>
          <div style={{ display: "inline-flex", background: "#f3f4f6", borderRadius: 8, padding: "3px", gap: 2 }}>
            {(["disbursed", "activated"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); setSearch(""); }}
                style={{
                  height: 32, paddingLeft: 18, paddingRight: 18,
                  borderRadius: 6,
                  border: activeTab === tab ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
                  background: activeTab === tab ? "#fff" : "transparent",
                  boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)" : "none",
                  fontSize: 13, fontWeight: activeTab === tab ? 600 : 500,
                  color: activeTab === tab ? "#111827" : "#6b7280",
                  cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                }}
              >
                {tab === "disbursed" ? "Disbursed" : "Activated"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{ padding: "12px 28px", background: "#fff", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}
      >
        {/* Search */}
        <div
          className="flex items-center gap-2"
          style={{ height: 40, paddingLeft: 12, paddingRight: 12, border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", maxWidth: 520, marginBottom: 10 }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="#9ca3af" strokeWidth="1.4" />
            <path d="M10.5 10.5l3 3" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by purchase request reference"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#111827", background: "transparent" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", alignItems: "center" }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          <FilterPill label="All Time" calendar />
          <FilterPill label="All Agents" />
          <FilterPill label="Disbursement Status" />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 28px", flex: 1, overflowY: "auto" }}>
        <div style={{ border: "1px solid #e5e7eb", overflow: "clip", background: "#fff", borderRadius: 12 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
              <thead>
                <tr>
                  <PLTh>Reference code</PLTh>
                  <PLTh>Date of purchase</PLTh>
                  <PLTh>Agent</PLTh>
                  <PLTh>Farmers name</PLTh>
                  <PLTh right>Total quantity</PLTh>
                  <PLTh right>Total price</PLTh>
                  <PLTh>Disbursement status</PLTh>
                  <PLTh>Action</PLTh>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "40px 14px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                      No results match your search
                    </td>
                  </tr>
                ) : filtered.map((row, i) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.1s", cursor: "pointer" }}
                    onClick={() => setSelectedEntry(row)}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f9fafb")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "")}
                  >
                    {/* Reference code */}
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#111827", letterSpacing: "0.03em" }}>
                          {row.referenceCode}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyCode(row.referenceCode); }}
                          style={{ color: copiedId === row.referenceCode ? "#16a34a" : "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 2, borderRadius: 4, display: "flex", alignItems: "center" }}
                          title="Copy reference code"
                        >
                          {copiedId === row.referenceCode ? (
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8l3.5 3.5 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : <CopyIcon />}
                        </button>
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>
                      {row.dateOfPurchase}
                    </td>

                    {/* Agent */}
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 13, color: "#374151" }}>{row.agent}</span>
                        {row.agentHasWarning && (
                          <span
                            style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 16, height: 16, borderRadius: "50%",
                              background: "#ef4444", color: "#fff",
                              fontSize: 10, fontWeight: 700, flexShrink: 0,
                            }}
                            title="Agent warning"
                          >
                            !
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Farmer */}
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 13, color: "#374151" }}>{row.farmerName}</span>
                        {row.isRecoveryPurchase && (
                          <RecoveryIndicator
                            title="Recovery purchase"
                            body="This purchase item is from a recovery purchase activity"
                          />
                        )}
                      </div>
                    </td>

                    {/* Total quantity */}
                    <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>
                      {row.totalQuantityKg.toLocaleString()} kg
                    </td>

                    {/* Total price */}
                    <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>
                      GHS {row.totalPriceGHS.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Disbursement status */}
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 13, ...disbursementStatusStyle(row.disbursementStatus) }}>
                        {row.disbursementStatus}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: "12px 14px" }}>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fff")}
                        title="More actions"
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer — purchase list */}
          <div
            className="flex items-center justify-between"
            style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap", gap: 12 }}
          >
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Total Rows: <strong style={{ color: "#111827" }}>{q ? filtered.length : totalRowsHardcoded.toLocaleString()}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: page === 1 ? "#d1d5db" : "#374151", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <ChevronIcon dir="left" />
              </button>

              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{ width: 30, height: 30, borderRadius: 6, border: page === p ? "1.5px solid #1ab373" : "1px solid #e5e7eb", background: page === p ? "#f0fdf4" : "#fff", color: page === p ? "#15803d" : "#374151", fontSize: 13, fontWeight: page === p ? 600 : 400, cursor: "pointer" }}
                >
                  {p}
                </button>
              ))}

              <span style={{ fontSize: 13, color: "#9ca3af", padding: "0 2px" }}>…</span>

              <button
                onClick={() => setPage(totalPages)}
                style={{ width: 30, height: 30, borderRadius: 6, border: page === totalPages ? "1.5px solid #1ab373" : "1px solid #e5e7eb", background: page === totalPages ? "#f0fdf4" : "#fff", color: page === totalPages ? "#15803d" : "#374151", fontSize: 13, fontWeight: page === totalPages ? 600 : 400, cursor: "pointer" }}
              >
                {totalPages}
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: page === totalPages ? "#d1d5db" : "#374151", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
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
                      if (!isNaN(v) && v >= 1 && v <= totalPages) setPage(v);
                    }
                  }}
                  style={{ width: 48, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", padding: "0 8px", fontSize: 13, textAlign: "center", outline: "none" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
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

// ─── PREs sub-requests screen ─────────────────────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6.5 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 2h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 2.5L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PREsSubRequestsScreen({ pre, onBack }: { pre: PRERequest; onBack: () => void }) {
  const items = pre.subRequestItems ?? [];
  const totalExpense = items.length > 0
    ? items.reduce((sum, s) => sum + s.unitCost * s.numberOfBags, 0)
    : pre.totalExpense;

  const SubTH = ({
    children, right, center, sticky,
  }: { children?: React.ReactNode; right?: boolean; center?: boolean; sticky?: boolean }) => (
    <th style={{
      padding: "10px 14px",
      textAlign: center ? "center" : right ? "right" : "left",
      fontSize: 11, fontWeight: 600, color: "#6b7280",
      textTransform: "uppercase", letterSpacing: "0.05em",
      borderBottom: "1px solid #e5e7eb", background: "#f9fafb", whiteSpace: "nowrap",
      ...(sticky ? { position: "sticky", left: 0, zIndex: 3 } : {}),
    }}>
      {children}
    </th>
  );

  return (
    <div className="flex flex-col" style={{ height: "100%", overflowY: "auto" }}>

      {/* ── Page header ── */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 13, color: "#9ca3af" }}>Purchases</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 10l4-3-4-3" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <button
            onClick={onBack}
            style={{ fontSize: 13, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            PREs
          </button>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 10l4-3-4-3" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Sub requests</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "20px 28px", flex: 1 }}>

        {/* Purchase request details card */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>

          {/* Card title row */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Purchase request details</h2>
          </div>

          {/* 4-column horizontal field row */}
          <div style={{ padding: "20px 24px 0", display: "flex", gap: 0 }}>

            <div style={{ flex: "0 0 160px", paddingRight: 32 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Community</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{pre.community}</div>
            </div>

            <div style={{ flex: "0 0 160px", paddingRight: 32 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Commodity</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{pre.commodity ?? "Shea nuts"}</div>
            </div>

            <div style={{ flex: 1, paddingRight: 32 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                Discussed the details with the logistics manager?
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                {pre.discussedWithLogistics ? "Yes" : "No"}
              </div>
            </div>

            <div style={{ flex: "0 0 180px", textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Total expenses</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>GHS {fmtPrice(totalExpense)}</div>
            </div>
          </div>

          {/* Bag breakdown row */}
          {(pre.bagsRecovered !== undefined || pre.bagsPurchased !== undefined || pre.bagsMixed !== undefined) && (
            <>
              <div style={{ height: 1, background: "#f3f4f6", margin: "0 24px" }} />
              <div style={{ padding: "16px 24px 0", display: "flex", gap: 0, flexWrap: "wrap" }}>

                {pre.bagsRecovered !== undefined && (
                  <div style={{ flex: "0 0 220px", paddingRight: 32, marginBottom: 4 }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Number of bags recovered</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {pre.bagsRecovered.toLocaleString()} bags
                      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400, marginLeft: 8 }}>
                        {pre.bagsRecoveredWeight?.toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                )}

                {pre.bagsPurchased !== undefined && (
                  <div style={{ flex: "0 0 220px", paddingRight: 32, marginBottom: 4 }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Number of bags purchased</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {pre.bagsPurchased.toLocaleString()} bags
                      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400, marginLeft: 8 }}>
                        {pre.bagsPurchasedWeight?.toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                )}

                {pre.bagsMixed !== undefined && (
                  <div style={{ flex: "0 0 220px", paddingRight: 32, marginBottom: 4 }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Number of mixed bags</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {pre.bagsMixed.toLocaleString()} bags
                      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400, marginLeft: 8 }}>
                        {pre.bagsMixedWeight?.toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </>
          )}

          {/* Links row */}
          <div style={{ padding: "16px 24px 20px", display: "flex", gap: 24 }}>
            <a
              href="#"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#1ab373", textDecoration: "none" }}
            >
              <ExternalLinkIcon />
              View purchase request
            </a>
            <a
              href="#"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#1ab373", textDecoration: "none" }}
            >
              <ExternalLinkIcon />
              View purchase reconciliations
            </a>
          </div>
        </div>

        {/* Sub-requests table */}
        {items.length > 0 ? (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "clip", background: "#fff" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
                <thead>
                  <tr>
                    <SubTH sticky>Reference code</SubTH>
                    <SubTH>Sub request items</SubTH>
                    <SubTH right>Unit cost</SubTH>
                    <SubTH center>Number of bags</SubTH>
                    <SubTH right>Total amount</SubTH>
                    <SubTH>Momo name</SubTH>
                    <SubTH>Momo number</SubTH>
                    <SubTH center>1st</SubTH>
                    <SubTH center>2nd</SubTH>
                    <SubTH center>3rd</SubTH>
                    <SubTH>Disbursement status</SubTH>
                    <SubTH>Action</SubTH>
                  </tr>
                </thead>
                <tbody>
                  {items.map((sub, i) => (
                    <tr
                      key={sub.id}
                      style={{ borderBottom: i < items.length - 1 ? "1px solid #f3f4f6" : undefined, transition: "background 0.1s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f9fafb")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "")}
                    >
                      {/* Reference code — sticky */}
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap", position: "sticky", left: 0, zIndex: 1, background: "inherit" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#111827", letterSpacing: "0.03em" }}>{sub.refCode}</span>
                      </td>
                      {/* Sub request items — truncated with tooltip */}
                      <td style={{ padding: "12px 14px", maxWidth: 160 }}>
                        <span
                          title={sub.itemDescription}
                          style={{ fontSize: 13, color: "#374151", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {sub.itemDescription}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 500, color: "#111827", textAlign: "right", whiteSpace: "nowrap" }}>
                        GHS {fmtPrice(sub.unitCost)}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151", textAlign: "center" }}>{sub.numberOfBags}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#111827", textAlign: "right", whiteSpace: "nowrap" }}>
                        GHS {fmtPrice(sub.unitCost * sub.numberOfBags)}
                      </td>
                      {/* Momo name — truncated with tooltip */}
                      <td style={{ padding: "12px 14px", maxWidth: 150 }}>
                        <span
                          title={sub.momoName}
                          style={{ fontSize: 13, color: "#374151", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {sub.momoName}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{sub.momoNumber}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><CheckCircle checked={sub.disbursed1st} /></div>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><CheckCircle checked={sub.disbursed2nd} /></div>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><CheckCircle checked={sub.disbursed3rd} /></div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>{disbursementChip(sub.disbursementStatus)}</td>
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
          </div>
        ) : (
          <PlaceholderPanel title="No sub-request items found" />
        )}
      </div>
    </div>
  );
}

// ─── Main PurchasesScreen ─────────────────────────────────────────────────────

interface PurchasesScreenProps {
  activeSubScreen: AppScreen;
  onNavigate:      (screen: AppScreen) => void;
}

export default function PurchasesScreen({ activeSubScreen, onNavigate }: PurchasesScreenProps) {
  const [searchQuery,   setSearchQuery]   = useState("");
  const [selectedPREId, setSelectedPREId] = useState<string | null>(null);

  const isRequests = activeSubScreen === "purchases-requests";
  const isPres     = activeSubScreen === "purchases-pres";
  const isList     = activeSubScreen === "purchases-list";
  const label = SCREEN_LABELS[activeSubScreen] ?? "Purchases";

  // Reset sub-screen selection whenever the active module changes
  useEffect(() => {
    setSelectedPREId(null);
  }, [activeSubScreen]);

  const selectedPRE = isPres && selectedPREId
    ? MOCK_PRE_REQUESTS.find((p) => p.id === selectedPREId) ?? null
    : null;

  if (isPres && selectedPRE) {
    return <PREsSubRequestsScreen pre={selectedPRE} onBack={() => setSelectedPREId(null)} />;
  }

  if (isList) {
    return <PurchaseListScreen />;
  }

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
          <PREsTable onRowClick={setSelectedPREId} />
        ) : (
          <PlaceholderPanel title={label} />
        )}
      </div>
    </div>
  );
}
