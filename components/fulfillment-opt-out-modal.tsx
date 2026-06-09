"use client";

import { useEffect, useState } from "react";
import type { FulfillmentRequest, ActionRecord } from "@/components/kanban/types";
import { initials, avatarColor } from "@/components/kanban/helpers";
import { ActionTimeline } from "@/components/kanban/action-timeline";
import { ProofThumbnailStrip } from "@/components/kanban/proof-thumbnail-strip";
import type { StagedEntry } from "@/components/kanban/proof-thumbnail-strip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReconciliationRecord {
  files:    StagedEntry[];
  comment:  string;
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------
export default function FulfillmentOptOutModal({
  req,
  onClose,
  onReconcile,
}: {
  req: FulfillmentRequest;
  onClose: () => void;
  onReconcile?: () => void;
}) {
  const farmers         = req.optedOutFarmers ?? [];
  const refundPerFarmer = req.approvedAmountPerFarmer;
  const totalRefund     = farmers.length * refundPerFarmer;

  // ── state ──────────────────────────────────────────────────────────────────
  const [record,            setRecord]            = useState<ReconciliationRecord | null>(null);
  const [savedProofEntries, setSavedProofEntries] = useState<StagedEntry[]>([]);
  const [pendingComment,    setPendingComment]    = useState("");
  const [localActions,      setLocalActions]      = useState<ActionRecord[]>([]);

  const isReconciled = record !== null;

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── derived values ────────────────────────────────────────────────────────
  const hasFiles   = savedProofEntries.length > 0;
  const hasComment = pendingComment.trim().length > 0;
  const canSubmit  = hasFiles && hasComment;

  // ── handlers ──────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (!canSubmit) return;
    setRecord({ files: savedProofEntries, comment: pendingComment.trim() });
    setLocalActions([{
      id:        "reconcile-" + Date.now(),
      stage:     "opted_out",
      actor:     "Douglas Gockah",
      action:    "Refunds reconciled",
      summary:   `${farmers.length} farmer${farmers.length !== 1 ? "s" : ""} covered · GHS ${totalRefund.toLocaleString()} total`,
      timestamp: new Date().toISOString(),
      type:      "default",
    }]);
    onReconcile?.();
  }

  // ── left-panel meta ───────────────────────────────────────────────────────
  const agentColor    = avatarColor(req.agent);
  const agentInitials = initials(req.agent);
  const allActions    = [...localActions, ...(req.actionHistory ?? [])];

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
              <div style={{ width: 36, height: 36, borderRadius: 10, background: isReconciled ? "#f0fdf4" : "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isReconciled ? (
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.5" stroke="#16a34a" strokeWidth="1.4" />
                    <path d="M5 8l2.5 2.5 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.5" stroke="#f59e0b" strokeWidth="1.4" />
                    <path d="M8 5v3M8 10v.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900">Cash opt-out refunds</h2>
                <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                  {farmers.length} farmer{farmers.length !== 1 ? "s" : ""} opted out of commodity ·{" "}
                  {isReconciled ? "refunds reconciled" : "refunds to reconcile"}
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

            {/* ── Left panel — read-only context ── */}
            <div
              className="hidden md:flex flex-col gap-5 shrink-0 overflow-y-auto min-h-0"
              style={{ width: 310, borderRight: "1px solid var(--gray-100)", padding: "22px 20px 22px 24px" }}
            >
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</p>
                <p className="text-[15px] font-bold text-gray-900 leading-snug">{req.groupName}</p>
                <p className="text-[12px] text-gray-500 mt-0.5">{req.community}</p>
              </div>

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

              {/* Action timeline — includes local reconciliation entry once submitted */}
              {allActions.length > 0 && (
                <div>
                  <ActionTimeline records={allActions} accordion />
                </div>
              )}
            </div>

            {/* ── Right panel ── */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-5">

                {/* ── Status / completion banner ── */}
                {isReconciled ? (
                  /* Green completion banner */
                  <div style={{ borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px 16px" }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l3.5 3.5 6.5-7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#14532d", margin: 0 }}>Refunds reconciled</p>
                        <p style={{ fontSize: "0.75rem", color: "#16a34a", margin: "2px 0 0" }}>
                          All {farmers.length} farmer{farmers.length !== 1 ? "s" : ""} covered · GHS {totalRefund.toLocaleString()} total
                        </p>
                      </div>
                    </div>
                    {/* Proof files — ProofThumbnailStrip in read-only mode */}
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                        Proof documents
                      </p>
                      <ProofThumbnailStrip entries={record!.files} />
                    </div>
                    {/* Reconciliation note */}
                    <div style={{ borderRadius: 8, background: "#fff", border: "1px solid #bbf7d0", padding: "10px 12px" }}>
                      <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Reconciliation note</p>
                      <p style={{ fontSize: "0.8125rem", color: "#374151", lineHeight: 1.5, margin: 0 }}>{record!.comment}</p>
                    </div>
                  </div>
                ) : (
                  /* Amber pending banner */
                  <div style={{ borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", padding: "14px 16px" }}>
                    <div className="flex items-center gap-3">
                      <span className="relative flex shrink-0" style={{ width: 10, height: 10 }}>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: "#f59e0b", opacity: 0.5 }} />
                        <span className="relative inline-flex rounded-full" style={{ width: 10, height: 10, background: "#f59e0b" }} />
                      </span>
                      <div>
                        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#92400e", margin: 0 }}>Refunds pending reconciliation</p>
                        <p style={{ fontSize: "0.75rem", color: "#b45309", margin: "2px 0 0" }}>
                          Upload and save proof documents, then leave a reconciliation note to complete
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Upload + comment form (only when not yet reconciled) ── */}
                {!isReconciled && (
                  <div className="space-y-4">

                    {/* Step 1 — Staged proof upload */}
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-700)", marginBottom: 6 }}>
                        Step 1 — Upload proof documents
                      </p>
                      <ProofThumbnailStrip
                        entries={savedProofEntries}
                        onSave={(staged) => setSavedProofEntries(prev => [...prev, ...staged])}
                        onRemove={(_, idx) => setSavedProofEntries(prev => prev.filter((__, i) => i !== idx))}
                        onRemoveAll={() => setSavedProofEntries([])}
                      />
                      {hasFiles && (
                        <p style={{ fontSize: "0.6875rem", color: "#16a34a", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6.5" stroke="#16a34a" strokeWidth="1.4"/>
                            <path d="M5 8l2.5 2.5 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {savedProofEntries.length} file{savedProofEntries.length !== 1 ? "s" : ""} saved — proceed to add a reconciliation note
                        </p>
                      )}
                    </div>

                    {/* Step 2 — Reconciliation note */}
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-700)", marginBottom: 2 }}>
                        Step 2 — Reconciliation note
                        <span style={{ fontWeight: 500, color: "var(--gray-400)", marginLeft: 4 }}>(required)</span>
                      </p>
                      <p style={{ fontSize: "0.6875rem", color: "var(--gray-400)", marginBottom: 8 }}>
                        Describe the total amount received and the reasons behind it
                      </p>
                      <textarea
                        rows={4}
                        placeholder="e.g. 'All 5 farmers returned GHS 400 each in full. Cash collected at the 14 Jan 2026 community meeting and cross-checked against the disbursement list.'"
                        value={pendingComment}
                        onChange={(e) => setPendingComment(e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 resize-none"
                        style={{ border: "1.5px solid var(--gray-200)", background: "#fff", fontSize: "0.8125rem", color: "var(--gray-800)", lineHeight: 1.55, outline: "none" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--green-500)")}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--gray-200)")}
                      />
                      {hasComment && (
                        <p style={{ fontSize: "0.6875rem", color: "var(--gray-400)", marginTop: 3, textAlign: "right" }}>
                          {pendingComment.trim().length} characters
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="w-full h-11 rounded-xl text-[13px] font-bold text-white transition-all"
                      style={
                        !canSubmit
                          ? { background: "var(--gray-200)", color: "var(--gray-400)", cursor: "not-allowed" }
                          : { background: "var(--green-600)" }
                      }
                      onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.background = "var(--green-700, #15803d)"; }}
                      onMouseLeave={(e) => { if (canSubmit) e.currentTarget.style.background = "var(--green-600)"; }}
                    >
                      {!hasFiles
                        ? "Upload and save proof documents to continue"
                        : !hasComment
                        ? "Add a reconciliation note to continue"
                        : `Mark all ${farmers.length} farmer${farmers.length !== 1 ? "s" : ""} as reconciled`}
                    </button>
                  </div>
                )}

                {/* ── Farmers covered list (read-only) ── */}
                <div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Farmers covered
                  </p>
                  <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    {farmers.map((farmer, idx) => {
                      const color  = avatarColor(farmer.name);
                      const ini    = initials(farmer.name);
                      const isLast = idx === farmers.length - 1;
                      return (
                        <div
                          key={farmer.id}
                          className="flex items-center gap-3 px-4 py-3"
                          style={{
                            borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                            background: isReconciled ? "#f0fdf4" : "#fff",
                          }}
                        >
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ background: color }}
                          >
                            {ini}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-gray-800 truncate">{farmer.name}</p>
                            <p className="text-[11px] text-gray-400">{farmer.id}</p>
                          </div>
                          {isReconciled ? (
                            <span
                              className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                              style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", fontSize: "0.6875rem", fontWeight: 600, color: "var(--green-700)" }}
                            >
                              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Reconciled
                            </span>
                          ) : (
                            <span style={{ fontSize: "0.6875rem", color: "#9ca3af", fontWeight: 500 }}>
                              GHS {refundPerFarmer.toLocaleString()} expected
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>{/* end scrollable */}

              {/* ── Footer ── */}
              <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {isReconciled && (
                  <button
                    onClick={onClose}
                    className="flex-1 h-9 rounded-lg text-[13px] font-bold text-white transition-colors"
                    style={{ background: "var(--green-600)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--green-700, #15803d)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--green-600)")}
                  >
                    Done
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
