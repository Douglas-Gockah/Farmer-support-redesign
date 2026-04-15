"use client";

import { useState } from "react";
import type { FarmerRequest } from "./types";
import { SupportPill, ScoreBadge } from "./support-pill";
import { initials, avatarColor } from "./helpers";

interface KanbanCardProps {
  r: FarmerRequest;
  ctaLabel: string;
  onCta: (e: React.MouseEvent) => void;
  onView: () => void;
  onArchive?: () => void;
}

// ---------------------------------------------------------------------------
// Opt-out upload modal
// ---------------------------------------------------------------------------
function OptOutModal({ request, onClose }: { request: FarmerRequest; onClose: () => void }) {
  const [farmerFiles, setFarmerFiles] = useState<Record<string, string>>({});
  const farmers = request.optedOutFarmers ?? [];

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full flex flex-col bg-white"
          style={{
            maxWidth: 480,
            maxHeight: "calc(100vh - 64px)",
            borderRadius: "12px",
            boxShadow: "0px 20px 24px -4px rgba(16,24,40,0.18)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
            <div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--yellow-600)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                Opted Out — {farmers.length} farmer{farmers.length !== 1 ? "s" : ""}
              </p>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-900)", lineHeight: 1.3 }}>
                {request.groupName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded transition-colors shrink-0 ml-4 mt-0.5"
              style={{ color: "var(--gray-400)", background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-100)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <p className="px-6 pb-4 shrink-0" style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>
            Upload a refund document for each opted-out farmer below.
          </p>

          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            <div className="divide-y" style={{ borderColor: "var(--gray-100)" }}>
              {farmers.map((name) => {
                const uploaded = farmerFiles[name];
                const inputId = `refund-${request.id}-${name.replace(/\s+/g, "-").toLowerCase()}`;
                return (
                  <div key={name} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{ background: avatarColor(name), fontSize: "0.625rem", fontWeight: 700 }}
                      >
                        {initials(name)}
                      </span>
                      <span className="truncate" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--gray-800)" }}>{name}</span>
                    </div>
                    <input type="file" id={inputId} className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const fileName = e.target.files?.[0]?.name;
                        if (fileName) setFarmerFiles((prev) => ({ ...prev, [name]: fileName }));
                      }}
                    />
                    <label
                      htmlFor={inputId}
                      className="shrink-0 flex items-center gap-1.5 cursor-pointer transition-colors"
                      style={{
                        fontSize: "0.75rem", fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: "var(--radius)",
                        border: uploaded ? `1px solid var(--green-500)` : `1px solid var(--gray-300)`,
                        color: uploaded ? "var(--green-600)" : "var(--gray-600)",
                        background: uploaded ? "var(--green-50)" : "transparent",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {uploaded ? "✓ Done" : "Upload"}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="shrink-0 px-6 py-4 mt-2" style={{ borderTop: `1px solid var(--gray-100)` }}>
            <button
              onClick={onClose}
              className="w-full transition-colors"
              style={{
                height: 36, borderRadius: "var(--radius)",
                border: `1px solid var(--gray-200)`,
                fontSize: "0.875rem", fontWeight: 500,
                color: "var(--gray-700)", background: "#fff",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-50)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Archive confirmation dialog — matches Treesyt confirm modal pattern
// ---------------------------------------------------------------------------
function ArchiveConfirmModal({ groupName, onCancel, onConfirm }: { groupName: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full bg-white"
          style={{
            maxWidth: 400,
            padding: 28,
            borderRadius: "12px",
            boxShadow: "0px 20px 24px -4px rgba(16,24,40,0.18)",
          }}
        >
          <div className="flex items-start gap-3 mb-6">
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--error-50)" }}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1.5" width="14" height="3.5" rx="1.5" stroke="var(--error-600)" strokeWidth="1.4"/>
                <path d="M2.5 5v7.5a1 1 0 001 1h9a1 1 0 001-1V5" stroke="var(--error-600)" strokeWidth="1.4"/>
                <path d="M6 9.5l2 2 2-2M8 11.5v-4" stroke="var(--error-600)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gray-900)", margin: 0 }}>
                Archive this request?
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginTop: 6, lineHeight: 1.5 }}>
                <strong style={{ color: "var(--gray-700)", fontWeight: 600 }}>{groupName}</strong> will be hidden from the board. This cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={onCancel}
              className="flex-1 transition-colors"
              style={{
                height: 36, borderRadius: "var(--radius)",
                border: `1px solid var(--gray-200)`,
                fontSize: "0.875rem", fontWeight: 500,
                color: "var(--gray-700)", background: "#fff", cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-50)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 transition-colors"
              style={{
                height: 36, borderRadius: "var(--radius)",
                border: "none",
                fontSize: "0.875rem", fontWeight: 600,
                color: "#fff", background: "var(--error-600)", cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--error-700)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--error-600)")}
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Kanban card — Treesyt design system styling
// ---------------------------------------------------------------------------
export function KanbanCard({ r, ctaLabel, onCta, onView, onArchive }: KanbanCardProps) {
  const [hovered, setHovered]                   = useState(false);
  const [optOutOpen, setOptOutOpen]             = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  const agentInitials     = initials(r.agent);
  const agentColor        = avatarColor(r.agent);
  const agentDisplayName  = r.agent.split(" ").slice(0, 2).join(" ");

  const isRejected  = r.stage === "rejected";
  const isDisbursed = r.stage === "disbursed";
  const isAgentConf = r.stage === "agent_confirmation";
  const isPending   = r.stage === "pending_approval";
  const isFinance   = r.stage === "finance_disbursement";
  const isSynced    = r.stage === "synced";
  const isOptedOut  = r.stage === "opted_out";

  // CTA button style — primary green or on-hold amber outline
  const ctaStyle: React.CSSProperties = r.onHold
    ? { background: "transparent", border: `1.5px solid var(--yellow-600)`, color: "var(--yellow-600)" }
    : { background: "var(--green-600)", color: "#fff", border: "none" };

  // Cards in terminal states get slightly muted
  const cardOpacity = (isRejected || isDisbursed) ? 0.82 : 1;

  // Show archive for rejected, disbursed, and pending approval
  const showArchive = (isRejected || isDisbursed || isPending) && !!onArchive;

  const agentDateRow = (
    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
      <div className="flex items-center gap-2">
        <span
          className="flex items-center justify-center rounded-full text-white shrink-0"
          style={{ width: 24, height: 24, background: agentColor, fontSize: "0.625rem", fontWeight: 700 }}
        >
          {agentInitials}
        </span>
        <span className="truncate" style={{ maxWidth: 130, fontSize: "0.75rem", fontWeight: 500, color: "var(--gray-600)" }}>
          {agentDisplayName}
        </span>
      </div>
      <div className="flex items-center gap-1" style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--gray-500)" }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 1v2M9 1v2M1 6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        {r.date}
      </div>
    </div>
  );

  return (
    <>
      {optOutOpen     && <OptOutModal request={r} onClose={() => setOptOutOpen(false)} />}
      {archiveConfirmOpen && (
        <ArchiveConfirmModal
          groupName={r.groupName}
          onCancel={() => setArchiveConfirmOpen(false)}
          onConfirm={() => { setArchiveConfirmOpen(false); onArchive?.(); }}
        />
      )}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: r.onHold
            ? `1.5px dashed var(--yellow-500)`
            : `1px solid var(--gray-200)`,
          boxShadow: hovered
            ? "0px 4px 16px rgba(16,24,40,0.10)"
            : "0px 1px 3px rgba(16,24,40,0.06)",
          transform: hovered ? "translateY(-2px)" : "none",
          transition: "box-shadow 0.2s, transform 0.2s",
          opacity: cardOpacity,
          marginBottom: 10,
          cursor: "pointer",
        }}
        onClick={onView}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ padding: "16px" }}>

          {/* Group name + archive button */}
          <div className="flex items-start justify-between gap-2" style={{ marginBottom: 2 }}>
            <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--gray-900)", lineHeight: 1.3, flex: 1 }}>
              {r.groupName}
            </p>
            {showArchive && (
              <button
                className="flex items-center gap-1 shrink-0 transition-colors"
                style={{
                  height: 24, padding: "0 6px",
                  borderRadius: "6px",
                  background: "var(--gray-100)",
                  color: "var(--gray-500)",
                  border: "none", cursor: "pointer",
                  marginTop: -2, marginRight: -2,
                  fontSize: "0.625rem", fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--error-50)";
                  e.currentTarget.style.color = "var(--error-600)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--gray-100)";
                  e.currentTarget.style.color = "var(--gray-500)";
                }}
                onClick={(e) => { e.stopPropagation(); setArchiveConfirmOpen(true); }}
                title="Archive request"
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1.5" width="14" height="3.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2.5 5v7.5a1 1 0 001 1h9a1 1 0 001-1V5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 9.5l2 2 2-2M8 11.5v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Archive
              </button>
            )}
          </div>

          {/* Community · farmers count + optional score badge */}
          <div className="flex items-center flex-wrap gap-1.5" style={{ marginBottom: 12 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--gray-500)" }}>
              {r.community} &middot; {r.farmers} farmers
            </p>
            {r.score !== null && (isPending || isAgentConf || isFinance || isDisbursed || isOptedOut) && (
              <>
                <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>&middot;</span>
                <ScoreBadge score={r.score} />
              </>
            )}
          </div>

          {/* Support interest badges */}
          {(isSynced || isPending || isRejected) && (
            <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 12 }}>
              {r.supportInterests.map((si) => (
                <div key={si.rank} className="flex items-center gap-1">
                  <SupportPill type={si.type} />
                </div>
              ))}
            </div>
          )}

          {/* Agent confirmation: approved type + total value */}
          {isAgentConf && (
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              {r.approvedSupportType && <SupportPill type={r.approvedSupportType} />}
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)" }}>
                {r.approvedSupportType === "Cash"
                  ? `GHS ${((r.approvedAmountPerFarmer ?? 0) * r.farmers).toLocaleString()}`
                  : r.approvedLandSizePerFarmer
                    ? `${(r.approvedLandSizePerFarmer * r.farmers).toFixed(1)} ac`
                    : null}
              </span>
            </div>
          )}

          {/* Finance: MoMo info */}
          {isFinance && (
            <div style={{ borderRadius: "var(--radius)", padding: "8px 12px", marginBottom: 12, background: "var(--gray-100)" }}>
              <p style={{ fontSize: "0.625rem", color: "var(--gray-400)", marginBottom: 2 }}>MoMo</p>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, fontFamily: "monospace", color: "var(--gray-800)" }}>{r.momoNumber ?? "—"}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{r.momoName ?? "—"}</p>
            </div>
          )}

          {/* Opted-out summary chip */}
          {isOptedOut && r.optedOutFarmers && r.optedOutFarmers.length > 0 && (
            <button
              className="w-full flex items-center justify-between gap-2 text-left transition-colors"
              style={{
                borderRadius: "var(--radius)",
                padding: "8px 12px", marginBottom: 12,
                background: "var(--yellow-50)",
                border: `1px solid var(--yellow-200)`,
              }}
              onClick={(e) => { e.stopPropagation(); setOptOutOpen(true); }}
            >
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="var(--yellow-600)" strokeWidth="1.4"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="var(--yellow-600)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--yellow-700)" }}>
                  {r.optedOutFarmers.length} farmer{r.optedOutFarmers.length !== 1 ? "s" : ""} opted out
                </span>
              </div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--yellow-600)" }}>Manage →</span>
            </button>
          )}

          {/* Disbursed amount */}
          {isDisbursed && (
            <div style={{ marginBottom: 12 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Disbursed</span>
                <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--gray-900)" }}>
                  GHS {r.disbursedAmount?.toLocaleString() ?? "—"}
                </span>
              </div>
              <p className="truncate" style={{ fontSize: "0.6875rem", color: "var(--gray-500)" }}>{r.momoName ?? r.groupName}</p>
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: `1px solid var(--gray-100)`, marginBottom: 12 }} />

          {/* Awaiting manager confirmation note */}
          {isAgentConf && (
            <p style={{ fontSize: "0.75rem", fontStyle: "italic", color: "var(--gray-500)", marginBottom: 12 }}>
              Awaiting manager confirmation
            </p>
          )}

          {agentDateRow}

          {/* Reference code */}
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, fontFamily: "monospace", color: "var(--gray-500)", letterSpacing: "0.03em" }}>
              {r.id}
            </span>
            {isDisbursed && r.transactionId && (
              <span style={{ fontSize: "0.625rem", fontFamily: "monospace", color: "var(--green-600)" }}>{r.transactionId}</span>
            )}
            {isDisbursed && r.disbursedDate && (
              <span style={{ fontSize: "0.625rem", color: "var(--gray-400)" }}>{r.disbursedDate}</span>
            )}
          </div>

          {/* Rejection reason */}
          {isRejected && r.rejectionComment && (
            <div style={{ borderRadius: "var(--radius)", padding: "8px 12px", marginBottom: 12, background: "var(--error-50)" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--error-600)", lineHeight: 1.5 }}>{r.rejectionComment}</p>
            </div>
          )}

          {/* On-hold badge */}
          {r.onHold && (
            <div
              className="inline-flex items-center gap-1.5"
              style={{
                marginBottom: 10,
                padding: "2px 10px",
                borderRadius: "9999px",
                background: "var(--yellow-50)",
                color: "var(--yellow-700)",
                fontSize: "0.6875rem", fontWeight: 600,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 5v6M10 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              On Hold
            </div>
          )}

          {/* CTA button — Treesyt Default size: height 36px */}
          {ctaLabel && (
            <button
              className="w-full transition-colors"
              style={{
                ...ctaStyle,
                height: 36,
                borderRadius: "var(--radius)",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={(e) => { e.stopPropagation(); onCta(e); }}
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
