"use client";

import { useEffect, useRef, useState } from "react";
import type { FulfillmentRequest } from "@/components/kanban/types";
import { initials, avatarColor } from "@/components/kanban/helpers";
import { ActionTimeline } from "@/components/kanban/action-timeline";

// ---------------------------------------------------------------------------
// Per-farmer refund record (after submission)
// ---------------------------------------------------------------------------
interface RefundRecord {
  fileName: string;
  actualAmount: number;
}

// ---------------------------------------------------------------------------
// Document placeholder thumbnail
// ---------------------------------------------------------------------------
function DocThumb({ fileName }: { fileName: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
      style={{ background: "var(--green-50)", border: "1px solid var(--green-200)" }}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="10" height="14" rx="1.5" stroke="var(--green-600)" strokeWidth="1.4" />
        <path d="M5 5h6M5 8h6M5 11h4" stroke="var(--green-600)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span
        className="truncate"
        style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--green-700)", maxWidth: 120 }}
        title={fileName}
      >
        {fileName}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------
export default function FulfillmentOptOutModal({
  req,
  onClose,
}: {
  req: FulfillmentRequest;
  onClose: () => void;
}) {
  const farmers         = req.optedOutFarmers ?? [];
  const refundPerFarmer = req.approvedAmountPerFarmer;

  // ── selection state ──────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── per-farmer completed records ─────────────────────────────────────────
  const [completed, setCompleted] = useState<Record<string, RefundRecord>>({});

  // ── pending action panel state ───────────────────────────────────────────
  const [pendingFile,   setPendingFile]   = useState<File | null>(null);
  const [pendingAmount, setPendingAmount] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── derived values ────────────────────────────────────────────────────────
  const completedCount = Object.keys(completed).length;
  const allComplete    = farmers.length > 0 && completedCount === farmers.length;

  // Farmers that are selected AND not yet completed
  const activeSelected = [...selectedIds].filter((id) => !completed[id]);
  const hasSelection   = activeSelected.length > 0;

  const expectedForSelection = activeSelected.length * refundPerFarmer;
  const parsedAmount         = parseFloat(pendingAmount.replace(/,/g, ""));
  const amountEntered        = pendingAmount.trim() !== "" && !isNaN(parsedAmount);
  const amountMismatch       = amountEntered && parsedAmount !== expectedForSelection;
  const canSubmit            = hasSelection && pendingFile !== null && amountEntered;

  // ── handlers ──────────────────────────────────────────────────────────────
  function toggleFarmer(id: string) {
    if (completed[id]) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const unfinished = farmers.filter((f) => !completed[f.id]);
    const allUnfinishedSelected = unfinished.every((f) => selectedIds.has(f.id));
    if (allUnfinishedSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unfinished.map((f) => f.id)));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const record: RefundRecord = {
      fileName:     pendingFile!.name,
      actualAmount: parsedAmount,
    };
    setCompleted((prev) => {
      const next = { ...prev };
      activeSelected.forEach((id) => { next[id] = record; });
      return next;
    });
    setSelectedIds(new Set());
    setPendingFile(null);
    setPendingAmount("");
  }

  // ── render ────────────────────────────────────────────────────────────────
  const unfinishedFarmers     = farmers.filter((f) => !completed[f.id]);
  const allUnfinishedSelected =
    unfinishedFarmers.length > 0 && unfinishedFarmers.every((f) => selectedIds.has(f.id));

  const agentColor    = avatarColor(req.agent);
  const agentInitials = initials(req.agent);
  const totalRefund   = farmers.length * refundPerFarmer;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.50)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ maxWidth: "min(960px, 95vw)", maxHeight: "92vh" }}
        >

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="#f59e0b" strokeWidth="1.4" />
                  <path d="M8 5v3M8 10v.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900">Cash opt-out refunds</h2>
                <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                  {farmers.length} farmer{farmers.length !== 1 ? "s" : ""} opted out of commodity · refunds to process
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="flex flex-col md:flex-row flex-1 min-h-0">

            {/* Mobile strip */}
            <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
              <div>
                <p className="text-[13px] font-bold text-gray-900">{req.groupName}</p>
                <p className="text-[11px] text-gray-500">{req.community} · {farmers.length} opt-outs</p>
              </div>
            </div>

            {/* ── Left panel — context ── */}
            <div
              className="hidden md:flex flex-col gap-5 shrink-0 overflow-y-auto min-h-0"
              style={{ width: 310, borderRight: "1px solid var(--gray-100)", padding: "22px 20px 22px 24px" }}
            >
              {/* Group */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</p>
                <p className="text-[15px] font-bold text-gray-900 leading-snug">{req.groupName}</p>
                <p className="text-[12px] text-gray-500 mt-0.5">{req.community}</p>
              </div>

              {/* Stat tiles */}
              <div className="flex flex-col gap-3">
                <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                  <p className="text-[10px] text-gray-400 mb-0.5">Opted-out farmers</p>
                  <p className="text-[20px] font-bold text-gray-900">{farmers.length}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                  <p className="text-[10px] text-gray-400 mb-0.5">Refund per farmer</p>
                  <p className="text-[20px] font-bold text-gray-900">GHS {refundPerFarmer.toLocaleString()}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "#fffbeb" }}>
                  <p className="text-[10px] text-amber-600 mb-0.5">Total refund expected</p>
                  <p className="text-[20px] font-bold text-amber-800">GHS {totalRefund.toLocaleString()}</p>
                </div>
              </div>

              {/* Disbursement info */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement</p>
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  {([
                    { label: "Transaction ID", value: req.transactionId },
                    { label: "Date disbursed",  value: req.disbursedDate },
                    { label: "Total disbursed", value: `GHS ${req.disbursedAmount.toLocaleString()}` },
                    { label: "Per farmer",      value: `GHS ${refundPerFarmer.toLocaleString()}` },
                  ] as { label: string; value: string }[]).map(({ label, value }, i, arr) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-3 py-2.5"
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--gray-100)" : "none" }}
                    >
                      <span className="text-[11px] text-gray-400">{label}</span>
                      <span className="text-[12px] font-semibold text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field agent */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Agent</p>
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                    style={{ background: agentColor }}
                  >
                    {agentInitials}
                  </span>
                  <p className="text-[13px] font-semibold text-gray-800">{req.agent}</p>
                </div>
              </div>

              {/* Action timeline */}
              {req.actionHistory && req.actionHistory.length > 0 && (
                <div>
                  <ActionTimeline records={req.actionHistory} accordion />
                </div>
              )}
            </div>

            {/* ── Right panel — refund actions ── */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">

              {/* Progress banner */}
              <div className="px-6 pt-5 pb-0 shrink-0">
                <div
                  className="rounded-xl px-4 py-3"
                  style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[11px] text-amber-600 font-semibold">Refund progress</p>
                      <p className="text-[16px] font-bold text-amber-800">
                        {completedCount} / {farmers.length} completed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-amber-600">Remaining</p>
                      <p className="text-[14px] font-bold text-amber-800">
                        GHS {((farmers.length - completedCount) * refundPerFarmer).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "#FEF3C7" }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: farmers.length > 0 ? `${(completedCount / farmers.length) * 100}%` : "0%",
                        background: allComplete ? "#16A34A" : "#F59E0B",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <p className="px-6 pt-4 pb-2 text-[12px] text-gray-500 shrink-0">
                Select one or more farmers, upload proof of refund and enter the actual amount received, then submit.
              </p>

              {/* Farmer list (scrollable) */}
              <div className="flex-1 overflow-y-auto min-h-0">

                {/* Select-all header */}
                {unfinishedFarmers.length > 0 && (
                  <div
                    className="flex items-center gap-3 px-6 py-2 shrink-0"
                    style={{ borderBottom: "1px solid var(--gray-100)" }}
                  >
                    <button
                      onClick={toggleSelectAll}
                      className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                      style={
                        allUnfinishedSelected
                          ? { background: "var(--green-600)", border: "1.5px solid var(--green-600)" }
                          : selectedIds.size > 0
                          ? { background: "var(--green-100)", border: "1.5px solid var(--green-400)" }
                          : { background: "transparent", border: "1.5px solid var(--gray-300)" }
                      }
                      aria-label="Select all"
                    >
                      {(allUnfinishedSelected || selectedIds.size > 0) && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          {allUnfinishedSelected
                            ? <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            : <path d="M2 5h6" stroke="var(--green-600)" strokeWidth="1.8" strokeLinecap="round" />
                          }
                        </svg>
                      )}
                    </button>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-600)" }}>
                      Select all pending ({unfinishedFarmers.length})
                    </span>
                    {selectedIds.size > 0 && (
                      <span
                        className="ml-auto rounded-full px-2 py-0.5"
                        style={{ fontSize: "0.6875rem", fontWeight: 700, background: "var(--green-50)", color: "var(--green-600)" }}
                      >
                        {activeSelected.length} selected
                      </span>
                    )}
                  </div>
                )}

                {/* Farmer rows */}
                <div className="divide-y divide-gray-100 px-6">
                  {farmers.map((farmer) => {
                    const record     = completed[farmer.id];
                    const isComplete = !!record;
                    const isSelected = selectedIds.has(farmer.id);
                    const color      = avatarColor(farmer.name);

                    return (
                      <div
                        key={farmer.id}
                        className="py-3"
                        style={isSelected ? { background: "var(--green-25)" } : undefined}
                      >
                        <div className="flex items-start gap-3">

                          {/* Checkbox / status */}
                          {isComplete ? (
                            <span
                              className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-1"
                              style={{ background: "var(--green-600)", border: "1.5px solid var(--green-600)" }}
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleFarmer(farmer.id)}
                              className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-1 transition-colors"
                              style={
                                isSelected
                                  ? { background: "var(--green-600)", border: "1.5px solid var(--green-600)" }
                                  : { background: "transparent", border: "1.5px solid var(--gray-300)" }
                              }
                              aria-label={`Select ${farmer.name}`}
                            >
                              {isSelected && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          )}

                          {/* Avatar */}
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ background: color }}
                          >
                            {initials(farmer.name)}
                          </span>

                          {/* Name + details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[13px] font-semibold text-gray-800 truncate">{farmer.name}</p>
                              {isComplete ? (
                                <span className="shrink-0 text-[11px] font-bold" style={{ color: "var(--green-600)" }}>
                                  GHS {record.actualAmount.toLocaleString()}
                                </span>
                              ) : (
                                <p className="shrink-0 text-[11px] text-gray-400">
                                  GHS {refundPerFarmer.toLocaleString()} expected
                                </p>
                              )}
                            </div>

                            {/* Completed: proof chip */}
                            {isComplete && (
                              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                <span
                                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                                  style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", fontSize: "0.6875rem", fontWeight: 600, color: "var(--green-700)" }}
                                >
                                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  Refund complete
                                </span>
                                <DocThumb fileName={record.fileName} />
                                {record.actualAmount !== refundPerFarmer && (
                                  <span
                                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                                    style={{ background: "#FFFBEB", border: "1px solid #FDE68A", fontSize: "0.6875rem", fontWeight: 600, color: "#92400E" }}
                                  >
                                    Partial (expected GHS {refundPerFarmer.toLocaleString()})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Selection action panel ── */}
              {hasSelection && (
                <div
                  className="shrink-0 px-6 py-4"
                  style={{ borderTop: "1px solid var(--gray-100)", background: "#F9FAFB" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-900)" }}>
                      {activeSelected.length} farmer{activeSelected.length !== 1 ? "s" : ""} selected
                    </span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-600)" }}>
                      Expected: <span style={{ color: "var(--gray-900)" }}>GHS {expectedForSelection.toLocaleString()}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* File upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    {pendingFile ? (
                      <div
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: "var(--green-50)", border: "1px solid var(--green-200)" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <rect x="2" y="1" width="10" height="14" rx="1.5" stroke="var(--green-600)" strokeWidth="1.4" />
                          <path d="M5 5h6M5 8h6M5 11h4" stroke="var(--green-600)" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <span
                          className="flex-1 truncate"
                          style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--green-800)" }}
                          title={pendingFile.name}
                        >
                          {pendingFile.name}
                        </span>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="shrink-0 text-[11px] font-bold rounded-md px-2 py-1 transition-colors"
                          style={{ color: "var(--green-700)", background: "var(--green-100)" }}
                        >
                          Change
                        </button>
                        <button
                          onClick={() => setPendingFile(null)}
                          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                          style={{ color: "var(--green-600)", background: "var(--green-100)" }}
                          aria-label="Remove file"
                        >
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full rounded-xl flex items-center justify-center gap-2 transition-colors"
                        style={{
                          height: 52,
                          border: "1.5px dashed var(--gray-300)",
                          background: "#ffffff",
                          color: "var(--gray-500)",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--green-400)";
                          e.currentTarget.style.color = "var(--green-600)";
                          e.currentTarget.style.background = "var(--green-25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--gray-300)";
                          e.currentTarget.style.color = "var(--gray-500)";
                          e.currentTarget.style.background = "#ffffff";
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 2v8M5.5 4.5L8 2l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Upload proof of refund (PDF, JPG, PNG)
                      </button>
                    )}

                    {/* Actual amount input */}
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold"
                        style={{ color: "var(--gray-500)" }}
                      >
                        GHS
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder={`${expectedForSelection} (expected)`}
                        value={pendingAmount}
                        onChange={(e) => setPendingAmount(e.target.value)}
                        className="w-full h-10 rounded-xl pl-12 pr-4"
                        style={{
                          border: amountMismatch
                            ? "1.5px solid #F59E0B"
                            : "1.5px solid var(--gray-200)",
                          background: "#ffffff",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--gray-900)",
                          outline: "none",
                        }}
                        onFocus={(e) => {
                          if (!amountMismatch) e.currentTarget.style.borderColor = "var(--green-500)";
                        }}
                        onBlur={(e) => {
                          if (!amountMismatch) e.currentTarget.style.borderColor = "var(--gray-200)";
                        }}
                      />
                    </div>

                    {/* Amount mismatch warning */}
                    {amountMismatch && (
                      <div
                        className="flex items-start gap-2 rounded-lg px-3 py-2"
                        style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                          <circle cx="8" cy="8" r="6.5" stroke="#D97706" strokeWidth="1.4" />
                          <path d="M8 5v3.5M8 10.5v.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p style={{ fontSize: "0.75rem", color: "#92400E", lineHeight: 1.4 }}>
                          Amount entered (GHS {parsedAmount.toLocaleString()}) doesn&apos;t match expected
                          (GHS {expectedForSelection.toLocaleString()}). You can still mark as complete.
                        </p>
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="w-full h-10 rounded-xl text-[13px] font-bold text-white transition-all"
                      style={
                        !canSubmit
                          ? { background: "var(--gray-200)", color: "var(--gray-400)", cursor: "not-allowed" }
                          : amountMismatch
                          ? { background: "#D97706" }
                          : { background: "var(--green-600)" }
                      }
                    >
                      {!pendingFile
                        ? "Upload proof to continue"
                        : !amountEntered
                        ? "Enter actual amount"
                        : amountMismatch
                        ? "Mark complete anyway"
                        : "Submit refund"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Footer ── */}
              <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {allComplete && (
                  <button
                    onClick={onClose}
                    className="flex-1 h-9 rounded-lg text-[13px] font-bold text-white transition-colors"
                    style={{ background: "var(--green-600)" }}
                  >
                    All complete — done
                  </button>
                )}
              </div>

            </div>{/* end right panel */}
          </div>{/* end body */}
        </div>
      </div>
    </>
  );
}
