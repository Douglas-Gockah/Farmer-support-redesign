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
function OptOutModal({
  request,
  onClose,
}: {
  request: FarmerRequest;
  onClose: () => void;
}) {
  const [farmerFiles, setFarmerFiles] = useState<Record<string, string>>({});
  const farmers = request.optedOutFarmers ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full flex flex-col bg-white rounded-2xl shadow-2xl"
          style={{ maxWidth: 480, maxHeight: "calc(100vh - 64px)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
            <div>
              <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">
                Opted Out — {farmers.length} farmer{farmers.length !== 1 ? "s" : ""}
              </p>
              <h2 className="text-[16px] font-bold text-gray-900 leading-snug">
                {request.groupName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0 ml-4 mt-0.5"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="px-6 pb-4 text-[12px] text-gray-500 shrink-0">
            Upload a refund document for each opted-out farmer below.
          </p>

          {/* Farmer rows — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            <div className="divide-y divide-gray-100">
              {farmers.map((name) => {
                const uploaded = farmerFiles[name];
                const inputId = `refund-${request.id}-${name
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`;
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ background: avatarColor(name) }}
                      >
                        {initials(name)}
                      </span>
                      <span className="text-[13px] font-medium text-gray-800 truncate">
                        {name}
                      </span>
                    </div>
                    <input
                      type="file"
                      id={inputId}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const fileName = e.target.files?.[0]?.name;
                        if (fileName)
                          setFarmerFiles((prev) => ({
                            ...prev,
                            [name]: fileName,
                          }));
                      }}
                    />
                    <label
                      htmlFor={inputId}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold cursor-pointer transition-colors whitespace-nowrap"
                      style={
                        uploaded
                          ? {
                              borderColor: "#16A34A",
                              color: "#16A34A",
                              background: "#F0FDF4",
                            }
                          : {
                              borderColor: "#D1D5DB",
                              color: "#6B7280",
                              background: "transparent",
                            }
                      }
                    >
                      {uploaded ? (
                        <>
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Done
                        </>
                      ) : (
                        <>
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M6 1v6M4 4.5l2-2 2 2M2 10h8"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Upload
                        </>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-100 mt-2">
            <button
              onClick={onClose}
              className="w-full h-9 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
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
// Kanban card
// ---------------------------------------------------------------------------
export function KanbanCard({ r, ctaLabel, onCta, onView, onArchive }: KanbanCardProps) {
  const [hovered, setHovered] = useState(false);
  const [optOutOpen, setOptOutOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  const agentInitials = initials(r.agent);
  const agentColor = avatarColor(r.agent);

  const isRejected  = r.stage === "rejected";
  const isDisbursed = r.stage === "disbursed";
  const isAgentConf = r.stage === "agent_confirmation";
  const isPending   = r.stage === "pending_approval";
  const isFinance   = r.stage === "finance_disbursement";
  const isSynced    = r.stage === "synced";
  const isOptedOut  = r.stage === "opted_out";

  const ctaStyle: React.CSSProperties = r.onHold
    ? { background: "transparent", border: "1.5px solid #D97706", color: "#D97706" }
    : { background: "#16A34A", color: "white", border: "none" };

  // Show first two name tokens (first + last name)
  const agentDisplayName = r.agent.split(" ").slice(0, 2).join(" ");

  const agentDateRow = (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ background: agentColor }}
        >
          {agentInitials}
        </span>
        <span className="text-[12px] font-medium text-gray-600 truncate max-w-[140px]">
          {agentDisplayName}
        </span>
      </div>
      <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 1v2M9 1v2M1 6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span>{r.date}</span>
      </div>
    </div>
  );

  return (
    <>
      {optOutOpen && (
        <OptOutModal request={r} onClose={() => setOptOutOpen(false)} />
      )}

      {archiveConfirmOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setArchiveConfirmOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4" style={{ maxWidth: 400 }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FEF2F2" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1.5" width="14" height="3.5" rx="1.5" stroke="#DC2626" strokeWidth="1.4"/>
                    <path d="M2.5 5v7.5a1 1 0 001 1h9a1 1 0 001-1V5" stroke="#DC2626" strokeWidth="1.4"/>
                    <path d="M6 9.5l2 2 2-2M8 11.5v-4" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900 leading-snug">Archive this request?</p>
                  <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                    <span className="font-semibold text-gray-700">{r.groupName}</span> will be hidden from the board. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setArchiveConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 h-9 rounded-lg text-[13px] font-bold text-white transition-colors"
                  style={{ background: "#DC2626" }}
                  onClick={() => { setArchiveConfirmOpen(false); onArchive?.(); }}
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div
        className="bg-white rounded-xl border mb-3 cursor-pointer"
        style={{
          boxShadow:   hovered ? "0 4px 16px rgba(0,0,0,0.13)" : "0 1px 4px rgba(0,0,0,0.09)",
          transition:  "box-shadow 150ms ease",
          borderStyle: r.onHold ? "dashed" : "solid",
          borderColor: r.onHold ? "#F59E0B" : "#D1D5DB",
          opacity:     (isRejected || isDisbursed) ? 0.8 : 1,
        }}
        onClick={onView}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="p-4">
          {/* Group name */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <p className="text-[15px] font-semibold text-gray-900 leading-snug flex-1">{r.groupName}</p>
            {(isRejected || isDisbursed) && onArchive && (
              <button
                className="w-6 h-6 rounded-md flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 -mt-0.5 -mr-1"
                onClick={(e) => { e.stopPropagation(); setArchiveConfirmOpen(true); }}
                title="Archive request"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1.5" width="14" height="3.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M2.5 5v7.5a1 1 0 001 1h9a1 1 0 001-1V5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M6 9.5l2 2 2-2M8 11.5v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Community · farmers + optional score badge */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <p className="text-[12px] font-medium text-gray-500 truncate">
              {r.community} &middot; {r.farmers} farmers
            </p>
            {r.score !== null && (isPending || isAgentConf || isFinance || isDisbursed || isOptedOut) && (
              <>
                <span className="text-[12px] text-gray-400">&middot;</span>
                <ScoreBadge score={r.score} />
              </>
            )}
          </div>

          {/* Support type badges — synced / pending / rejected */}
          {(isSynced || isPending || isRejected) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {r.supportInterests.map((si) => (
                <div key={si.rank} className="flex items-center gap-1">
                  {isPending && (
                    <span className="text-[10px] font-semibold text-gray-400">
                      {si.rank === "Primary" ? "1°" : "2°"}
                    </span>
                  )}
                  <SupportPill type={si.type} />
                </div>
              ))}
            </div>
          )}

          {/* Agent confirmation: approved type + total value */}
          {isAgentConf && (
            <div className="flex items-center justify-between mb-3">
              {r.approvedSupportType && <SupportPill type={r.approvedSupportType} />}
              <span className="text-[13px] font-semibold text-gray-700">
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
            <div className="rounded-lg px-3 py-2 mb-3" style={{ background: "#F3F4F6" }}>
              <p className="text-[10px] text-gray-400 mb-0.5">MoMo</p>
              <p className="text-[13px] font-semibold font-mono text-gray-800">{r.momoNumber ?? "—"}</p>
              <p className="text-[11px] text-gray-500">{r.momoName ?? "—"}</p>
            </div>
          )}

          {/* Opted-out: compact summary chip — click opens modal */}
          {isOptedOut && r.optedOutFarmers && r.optedOutFarmers.length > 0 && (
            <button
              className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 mb-3 text-left transition-colors hover:opacity-80"
              style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
              onClick={(e) => {
                e.stopPropagation();
                setOptOutOpen(true);
              }}
            >
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="#D97706" strokeWidth="1.4" />
                  <path d="M8 5v3.5M8 10.5v.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[12px] font-semibold text-amber-700">
                  {r.optedOutFarmers.length} farmer{r.optedOutFarmers.length !== 1 ? "s" : ""} opted out
                </span>
              </div>
              <span className="text-[11px] font-medium text-amber-600 shrink-0">Manage →</span>
            </button>
          )}

          {/* Disbursed: amount + recipient */}
          {isDisbursed && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-gray-400">Disbursed</span>
                <span className="text-[14px] font-bold text-gray-900">
                  GHS {r.disbursedAmount?.toLocaleString() ?? "—"}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate">{r.momoName ?? r.groupName}</p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 mb-3" />

          {/* Awaiting confirmation text */}
          {isAgentConf && (
            <p className="text-[11px] font-medium italic text-gray-500 mb-3">Awaiting manager confirmation</p>
          )}

          {/* Agent + date row */}
          {agentDateRow}

          {/* Reference code */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold font-mono text-gray-500 tracking-wide">{r.id}</span>
            {isDisbursed && r.transactionId && (
              <span className="text-[10px] font-mono" style={{ color: "#16A34A" }}>{r.transactionId}</span>
            )}
            {isDisbursed && r.disbursedDate && (
              <span className="text-[10px] text-gray-400">{r.disbursedDate}</span>
            )}
          </div>

          {/* Rejection reason */}
          {isRejected && r.rejectionComment && (
            <div className="rounded-lg px-3 py-2 mb-3" style={{ background: "#FEF2F2" }}>
              <p className="text-[11px] text-red-600 leading-relaxed">{r.rejectionComment}</p>
            </div>
          )}

          {/* On-hold badge */}
          {r.onHold && (
            <div
              className="mb-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: "#FFFBEB", color: "#D97706" }}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 5v6M10 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              On Hold
            </div>
          )}

          {/* CTA button */}
          {ctaLabel && (
            <button
              className="w-full h-9 rounded-lg text-[13px] font-bold transition-colors"
              style={ctaStyle}
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
