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
}

export function KanbanCard({ r, ctaLabel, onCta, onView }: KanbanCardProps) {
  const [hovered, setHovered] = useState(false);
  const agentInitials = initials(r.agent);
  const agentColor    = avatarColor(r.agent);

  const isRejected  = r.stage === "rejected";
  const isDisbursed = r.stage === "disbursed";
  const isAgentConf = r.stage === "agent_confirmation";
  const isPending   = r.stage === "pending_approval";
  const isFinance   = r.stage === "finance_disbursement";
  const isSynced    = r.stage === "synced";

  const ctaStyle: React.CSSProperties = r.onHold
    ? { background: "transparent", border: "1.5px solid #D97706", color: "#D97706" }
    : { background: "#16A34A", color: "white", border: "none" };

  const agentDateRow = (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ background: agentColor }}
        >
          {agentInitials}
        </span>
        <span className="text-[12px] font-medium text-gray-600 truncate max-w-[100px]">
          {r.agent.split(" ")[0]}
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
        <div className="mb-0.5">
          <p className="text-[15px] font-semibold text-gray-900 leading-snug">{r.groupName}</p>
        </div>

        {/* Community · farmers + optional score badge */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <p className="text-[12px] font-medium text-gray-500 truncate">
            {r.community} &middot; {r.farmers} farmers
          </p>
          {r.score !== null && (isPending || isAgentConf || isFinance || isDisbursed) && (
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
  );
}
