"use client";

import { useState } from "react";
import type { FarmerRequest } from "@/components/kanban/types";
import { initials, avatarColor } from "@/components/kanban/helpers";

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
// Summary stats bar
// ---------------------------------------------------------------------------
function SummaryBar({ records }: { records: FarmerRequest[] }) {
  const totalFarmers  = records.reduce((s, r) => s + r.farmers, 0);
  const totalDisbursed = records.reduce((s, r) => s + (r.disbursedAmount ?? 0), 0);

  const stats = [
    { label: "Groups disbursed", value: records.length.toString() },
    { label: "Farmers supported", value: totalFarmers.toLocaleString() },
    { label: "Total disbursed",   value: `GHS ${totalDisbursed.toLocaleString()}` },
  ];

  return (
    <div className="flex flex-wrap gap-3 px-5 py-3 border-b border-gray-100 shrink-0" style={{ background: "#F9FAFB" }}>
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-gray-900">{s.value}</span>
          <span className="text-[12px] text-gray-400">{s.label}</span>
          <span className="text-gray-200 select-none last:hidden">·</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Th / Td helpers for consistent cell styling
// ---------------------------------------------------------------------------
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3.5 text-[13px] text-gray-700 ${className}`}>
      {children}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Detail drawer — lightweight slide-in panel for a single record
// ---------------------------------------------------------------------------
function RecordDetailDrawer({ record, onClose }: { record: FarmerRequest; onClose: () => void }) {
  const agentColor    = avatarColor(record.agent);
  const agentInitials = initials(record.agent);

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Request ID",       value: <span className="font-mono text-[13px] text-green-700">{record.id}</span> },
    { label: "Group Name",       value: record.groupName },
    { label: "Community",        value: record.community },
    { label: "No. of Farmers",   value: record.farmers },
    { label: "Support Type",     value: <SupportBadge type={record.approvedSupportType} /> },
    { label: "Amount / Farmer",  value: record.approvedAmountPerFarmer ? `GHS ${record.approvedAmountPerFarmer.toLocaleString()}` : "—" },
    { label: "Total Disbursed",  value: record.disbursedAmount ? <span className="font-bold text-gray-900">GHS {record.disbursedAmount.toLocaleString()}</span> : "—" },
    { label: "MoMo Name",        value: record.momoName ?? "—" },
    { label: "MoMo Number",      value: <span className="font-mono">{record.momoNumber ?? "—"}</span> },
    { label: "Transaction ID",   value: <span className="font-mono text-[12px] text-gray-500">{record.transactionId ?? "—"}</span> },
    { label: "Disbursed On",     value: record.disbursedDate ?? "—" },
    { label: "Submitted",        value: record.date },
    { label: "Field Agent",      value: (
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: agentColor }}>
            {agentInitials}
          </span>
          <span>{record.agent}</span>
        </div>
      )
    },
    { label: "Score",            value: record.score != null ? `${record.score} / 100` : "—" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.35)" }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl"
        style={{ width: "min(440px, 100vw)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Disbursement Record</p>
            <h2 className="text-[16px] font-bold text-gray-900">{record.groupName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Disbursed amount hero */}
        <div className="px-6 py-5 shrink-0" style={{ background: "#F0FDF4", borderBottom: "1px solid #BBF7D0" }}>
          <p className="text-[12px] font-semibold text-green-600 mb-1">Total Amount Disbursed</p>
          <p className="text-[32px] font-bold text-green-800 leading-none">
            GHS {record.disbursedAmount?.toLocaleString() ?? "—"}
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

        {/* Detail rows */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="divide-y divide-gray-100">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 py-3">
                <span className="text-[12px] text-gray-400 shrink-0 w-36">{label}</span>
                <span className="text-[13px] text-gray-800 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full h-9 rounded-lg border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
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
      {/* Summary stats */}
      <SummaryBar records={records} />

      {/* Table wrapper — horizontally scrollable on small screens */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ minWidth: 860 }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
              <Th>Request</Th>
              <Th>Community</Th>
              <Th className="text-center">Farmers</Th>
              <Th>Support</Th>
              <Th>Total Disbursed</Th>
              <Th>Transaction ID</Th>
              <Th>Disbursed On</Th>
              <Th>Field Agent</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => {
              const agentColor    = avatarColor(r.agent);
              const agentInitials = initials(r.agent);
              const isEven        = idx % 2 === 0;

              return (
                <tr
                  key={r.id}
                  className="transition-colors hover:bg-green-50 group"
                  style={{ background: isEven ? "#FFFFFF" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}
                >
                  {/* Request ID + Group Name */}
                  <Td>
                    <div>
                      <span className="font-mono text-[12px] font-semibold" style={{ color: "#16A34A" }}>{r.id}</span>
                      <p className="text-[13px] font-semibold text-gray-900 mt-0.5 leading-tight">{r.groupName}</p>
                    </div>
                  </Td>

                  {/* Community */}
                  <Td>
                    <span className="text-gray-600">{r.community}</span>
                  </Td>

                  {/* Farmers */}
                  <Td className="text-center">
                    <span className="font-semibold text-gray-900">{r.farmers}</span>
                  </Td>

                  {/* Support type + amount */}
                  <Td>
                    <div className="space-y-1">
                      <SupportBadge type={r.approvedSupportType} />
                      {r.approvedAmountPerFarmer != null && (
                        <p className="text-[11px] text-gray-400">GHS {r.approvedAmountPerFarmer} / farmer</p>
                      )}
                    </div>
                  </Td>

                  {/* Total disbursed */}
                  <Td>
                    <span className="text-[14px] font-bold text-gray-900">
                      GHS {r.disbursedAmount?.toLocaleString() ?? "—"}
                    </span>
                  </Td>

                  {/* Transaction ID */}
                  <Td>
                    <span className="font-mono text-[12px] text-gray-500">{r.transactionId ?? "—"}</span>
                  </Td>

                  {/* Date disbursed */}
                  <Td>
                    <span className="text-gray-600 whitespace-nowrap">{r.disbursedDate ?? "—"}</span>
                  </Td>

                  {/* Agent */}
                  <Td>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ background: agentColor }}
                      >
                        {agentInitials}
                      </span>
                      <span className="text-[13px] text-gray-700">{r.agent}</span>
                    </div>
                  </Td>

                  {/* Action */}
                  <Td className="text-right pr-5">
                    <button
                      onClick={() => setDetailRecord(r)}
                      className="h-7 px-3 rounded-lg text-[12px] font-semibold transition-colors"
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

      {/* Detail drawer */}
      {detailRecord && (
        <RecordDetailDrawer
          record={detailRecord}
          onClose={() => setDetailRecord(null)}
        />
      )}
    </>
  );
}
