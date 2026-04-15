"use client";

import { useState, useEffect } from "react";
import type { FarmerRequest } from "@/components/kanban/types";
import { initials, avatarColor, makeRefCode } from "@/components/kanban/helpers";
import { ActionTimeline } from "@/components/kanban/action-timeline";

function formatGHS(n: number) {
  return `GHS ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function SupportBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-gray-300 text-[12px]">—</span>;
  const isCash = type === "Cash";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={isCash
        ? { background: "#ECFDF5", color: "#16A34A" }
        : { background: "#FFF7ED", color: "#C2410C" }}
    >
      {isCash ? (
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ) : (
        <svg width="11" height="10" viewBox="0 0 16 14" fill="none">
          <rect x="1" y="7" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 7V5a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      )}
      {type}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Th / Td helpers — with optional sticky-left support
// ---------------------------------------------------------------------------
const STICKY_STYLE = {
  position: "sticky" as const,
  left: 0,
  zIndex: 1,
  boxShadow: "2px 0 6px rgba(0,0,0,0.06)",
};

function Th({
  children, className = "", sticky = false, style = {},
}: {
  children: React.ReactNode; className?: string; sticky?: boolean; style?: React.CSSProperties;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap ${className}`}
      style={sticky ? { ...STICKY_STYLE, zIndex: 3, background: "#F9FAFB", ...style } : style}
    >
      {children}
    </th>
  );
}

function Td({
  children, className = "", sticky = false, bg = "#FFFFFF", style = {},
}: {
  children: React.ReactNode; className?: string; sticky?: boolean; bg?: string; style?: React.CSSProperties;
}) {
  return (
    <td
      className={`px-4 py-3.5 text-[13px] text-gray-700 ${className}`}
      style={sticky ? { ...STICKY_STYLE, background: bg, ...style } : style}
    >
      {children}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Detail modal — centred dialog for a single record
// ---------------------------------------------------------------------------
function RecordDetailModal({ record, onClose }: { record: FarmerRequest; onClose: () => void }) {
  const agentColor    = avatarColor(record.agent);
  const agentInitials = initials(record.agent);
  const bd            = record.disbursementBreakdown;
  const refCode       = makeRefCode(record.date, record.id, record.agent);

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Reference",       value: <span className="font-mono text-[13px] text-green-700">{refCode}</span> },
    { label: "Group Name",      value: record.groupName },
    { label: "Community",       value: record.community },
    { label: "No. of Farmers",  value: record.farmers },
    { label: "Support Type",    value: <SupportBadge type={record.approvedSupportType} /> },
    { label: "Amount / Farmer", value: record.approvedAmountPerFarmer ? `GHS ${record.approvedAmountPerFarmer.toLocaleString()}` : "—" },
    { label: "MoMo Name",       value: record.momoName ?? "—" },
    { label: "MoMo Number",     value: <span className="font-mono">{record.momoNumber ?? "—"}</span> },
    { label: "Transaction ID",  value: <span className="font-mono text-[12px] text-gray-500">{record.transactionId ?? "—"}</span> },
    { label: "Disbursed On",    value: record.disbursedDate ?? "—" },
    { label: "Submitted",       value: record.date },
    { label: "Field Agent",     value: (
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: agentColor }}>
            {agentInitials}
          </span>
          <span>{record.agent}</span>
        </div>
      )
    },
    { label: "Score", value: record.score != null ? `${record.score} / 100` : "—" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />

      {/* Modal — centred, max-height with scroll */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full flex flex-col bg-white rounded-2xl shadow-2xl"
          style={{ maxWidth: 600, maxHeight: "calc(100vh - 64px)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Disbursement Record</p>
              <h2 className="text-[17px] font-bold text-gray-900 leading-snug">{record.groupName}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0 ml-4 mt-0.5"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 min-h-0 space-y-5 pb-2">

            {/* Disbursed amount hero */}
            <div className="rounded-xl px-5 py-4" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
              <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider mb-1">Total Amount Disbursed</p>
              <p className="text-[30px] font-bold text-green-800 leading-none">
                {record.disbursedAmount != null ? formatGHS(record.disbursedAmount) : "—"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[12px] text-green-700">{record.disbursedDate}</span>
                {record.transactionId && (
                  <>
                    <span className="text-green-300">·</span>
                    <span className="font-mono text-[11px] text-green-600">{record.transactionId}</span>
                  </>
                )}
              </div>
            </div>

            {/* Disbursement breakdown */}
            <div>
              <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Disbursement Breakdown</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {[
                  { label: "Base amount",             value: bd?.baseAmount ?? record.disbursedAmount ?? 0 },
                  { label: "Withdrawal charge",        value: bd?.withdrawalCharge ?? 0 },
                  { label: "Transportation allowance", value: bd?.transportAllowance ?? 0 },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--gray-100)" : "none" }}
                  >
                    <span className="text-[12px] text-gray-500">{row.label}</span>
                    <span className="text-[12px] font-medium text-gray-700">
                      {row.value > 0 ? formatGHS(row.value) : <span className="text-gray-300">GHS 0.00</span>}
                    </span>
                  </div>
                ))}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: "var(--green-25)", borderTop: "2px solid var(--green-200)" }}
                >
                  <span className="text-[13px] font-bold text-gray-900">Total disbursed</span>
                  <span className="text-[14px] font-bold" style={{ color: "var(--green-600)" }}>
                    {record.disbursedAmount != null ? formatGHS(record.disbursedAmount) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Detail rows */}
            <div>
              <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Request Details</p>
              <div className="divide-y divide-gray-100">
                {rows.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-6 py-3">
                    <span className="text-[12px] text-gray-400 shrink-0 w-32">{label}</span>
                    <span className="text-[13px] text-gray-800 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full action timeline */}
            <ActionTimeline
              records={record.actionHistory ?? []}
              title="Full Action History"
            />

          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full h-9 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Pagination bar
// ---------------------------------------------------------------------------
const PER_PAGE = 8;

function PaginationBar({
  page, totalPages, totalItems, perPage,
  onPrev, onNext, onPage,
}: {
  page: number; totalPages: number; totalItems: number; perPage: number;
  onPrev: () => void; onNext: () => void; onPage: (p: number) => void;
}) {
  const from = totalItems === 0 ? 0 : page * perPage + 1;
  const to   = Math.min((page + 1) * perPage, totalItems);

  // Build page number list — show up to 5 buttons with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 5) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else if (page < 3) {
    pages.push(0, 1, 2, 3, "…", totalPages - 1);
  } else if (page >= totalPages - 3) {
    pages.push(0, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
  } else {
    pages.push(0, "…", page - 1, page, page + 1, "…", totalPages - 1);
  }

  const btnBase = "h-8 min-w-[32px] px-2 rounded-lg text-[12px] font-semibold transition-colors";

  return (
    <div
      className="shrink-0 flex items-center justify-between gap-4 px-5 py-3 border-t border-gray-200 bg-white"
    >
      {/* Left: count label */}
      <span className="text-[12px] text-gray-400 whitespace-nowrap">
        Showing <span className="font-semibold text-gray-700">{from}–{to}</span> of{" "}
        <span className="font-semibold text-gray-700">{totalItems}</span> records
      </span>

      {/* Right: page controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={onPrev}
          disabled={page === 0}
          className={`${btnBase} flex items-center gap-1 px-3`}
          style={page === 0
            ? { color: "#D1D5DB", cursor: "default" }
            : { color: "#374151", background: "#F9FAFB", border: "1px solid #E5E7EB" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="w-8 text-center text-[12px] text-gray-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                className={btnBase}
                style={p === page
                  ? { background: "#16A34A", color: "#FFFFFF" }
                  : { background: "#F9FAFB", color: "#374151", border: "1px solid #E5E7EB" }}
              >
                {(p as number) + 1}
              </button>
            )
          )}
        </div>

        {/* Mobile: just "Page X of Y" */}
        <span className="sm:hidden text-[12px] text-gray-500 px-2">
          {page + 1} / {totalPages}
        </span>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={page >= totalPages - 1}
          className={`${btnBase} flex items-center gap-1 px-3`}
          style={page >= totalPages - 1
            ? { color: "#D1D5DB", cursor: "default" }
            : { color: "#374151", background: "#F9FAFB", border: "1px solid #E5E7EB" }}
        >
          <span className="hidden sm:inline">Next</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2L8.5 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main table component
// ---------------------------------------------------------------------------
interface Props {
  records: FarmerRequest[];
}

export default function DisbursementRecordsTable({ records }: Props) {
  const [detailRecord, setDetailRecord] = useState<FarmerRequest | null>(null);
  const [page,         setPage]         = useState(0);

  // Reset to page 0 whenever the records list changes (e.g. filter applied)
  useEffect(() => { setPage(0); }, [records]);

  const totalPages  = Math.max(1, Math.ceil(records.length / PER_PAGE));
  const pageRecords = records.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "#F0FDF4" }}
        >
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="6" width="24" height="16" rx="3" stroke="#16A34A" strokeWidth="1.6" />
            <path d="M2 11h24" stroke="#16A34A" strokeWidth="1.6" />
            <path d="M7 17h4M15 17h6" stroke="#16A34A" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-[14px] font-semibold text-gray-700 mb-1">No disbursement records yet</p>
        <p className="text-[13px] text-gray-400 max-w-[260px]">
          Records will appear here once funds have been disbursed to a group.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Outer padding + background */}
      <div className="flex-1 flex flex-col min-h-0 p-4" style={{ background: "#FAFAFA" }}>
        {/*
          Border card. overflow:clip clips to rounded corners without creating
          a scroll container — so position:sticky on the first column still works.
          (Unlike overflow:hidden which would break sticky.)
        */}
        <div
          className="flex-1 flex flex-col min-h-0 rounded-xl border border-gray-200 bg-white"
          style={{ overflow: "clip" }}
        >
          {/* Scrollable table area — this is the actual scroll container for sticky */}
          <div className="flex-1 overflow-auto min-h-0">
            <table className="border-collapse" style={{ minWidth: 980, width: "100%" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 2 }}>
                  <Th sticky style={{ background: "#F9FAFB" }}>Reference</Th>
                  <Th>Group Name</Th>
                  <Th>Community</Th>
                  <Th className="text-right">Farmers</Th>
                  <Th>Support</Th>
                  <Th className="text-right">Amt / Farmer</Th>
                  <Th className="text-right">Total Disbursed</Th>
                  <Th>Transaction ID</Th>
                  <Th>Disbursed On</Th>
                  <Th>Field Agent</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((r, idx) => {
                  const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA";
                  const refCode = makeRefCode(r.date, r.id, r.agent);

                  return (
                    <tr
                      key={r.id}
                      className="transition-colors hover:bg-green-50 group"
                      style={{ background: rowBg, borderBottom: "1px solid #E5E7EB" }}
                    >
                      {/* Reference — sticky left */}
                      <Td sticky bg={rowBg}>
                        <span className="font-mono text-[12px] font-semibold whitespace-nowrap" style={{ color: "#16A34A" }}>
                          {refCode}
                        </span>
                      </Td>

                      {/* Group Name */}
                      <Td>
                        <span className="font-semibold text-gray-900 whitespace-nowrap">{r.groupName}</span>
                      </Td>

                      {/* Community */}
                      <Td>
                        <span className="text-gray-600 whitespace-nowrap">{r.community}</span>
                      </Td>

                      {/* Farmers */}
                      <Td className="text-right">
                        <span className="font-semibold text-gray-900">{r.farmers}</span>
                      </Td>

                      {/* Support type */}
                      <Td>
                        <SupportBadge type={r.approvedSupportType} />
                      </Td>

                      {/* Amount per farmer */}
                      <Td className="text-right">
                        <span className="text-gray-700 whitespace-nowrap">
                          {r.approvedAmountPerFarmer != null ? `GHS ${r.approvedAmountPerFarmer.toLocaleString()}` : "—"}
                        </span>
                      </Td>

                      {/* Total disbursed */}
                      <Td className="text-right">
                        <span className="text-[13px] font-bold text-gray-900 whitespace-nowrap">
                          GHS {r.disbursedAmount?.toLocaleString() ?? "—"}
                        </span>
                      </Td>

                      {/* Transaction ID */}
                      <Td>
                        <span className="font-mono text-[12px] text-gray-500 whitespace-nowrap">{r.transactionId ?? "—"}</span>
                      </Td>

                      {/* Date disbursed */}
                      <Td>
                        <span className="text-gray-600 whitespace-nowrap">{r.disbursedDate ?? "—"}</span>
                      </Td>

                      {/* Agent */}
                      <Td>
                        <span className="text-gray-700 whitespace-nowrap">{r.agent}</span>
                      </Td>

                      {/* Action */}
                      <Td className="pr-5">
                        <button
                          onClick={() => setDetailRecord(r)}
                          className="h-7 px-3 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap"
                          style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}
                        >
                          View
                        </button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination — inside the card border */}
          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalItems={records.length}
            perPage={PER_PAGE}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            onPage={setPage}
          />
        </div>
      </div>

      {/* Detail drawer */}
      {detailRecord && (
        <RecordDetailModal
          record={detailRecord}
          onClose={() => setDetailRecord(null)}
        />
      )}
    </>
  );
}
