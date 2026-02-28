"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Types (exported for use in kanban-screen)
// ---------------------------------------------------------------------------
export type SupportType = "Cash" | "Ploughing";

export type Stage =
  | "synced"
  | "pending_approval"
  | "rejected"
  | "agent_confirmation"
  | "finance_disbursement"
  | "disbursed";

export interface SupportInterest {
  rank: "Primary" | "Secondary";
  type: SupportType;
  amountPerFarmer?: number;
  momoNumber?: string;
  momoName?: string;
  landSizePerFarmer?: number;
}

export interface FarmerRequest {
  id: string;
  date: string;
  agent: string;
  community: string;
  groupName: string;
  score: number | null;
  stage: Stage;
  farmers: number;
  onHold: boolean;
  holdComment: string;
  rejectionComment: string;
  supportInterests: SupportInterest[];
  approvedSupportType: SupportType | null;
  approvedAmountPerFarmer?: number;
  approvedLandSizePerFarmer?: number;
  momoNumber?: string;
  momoName?: string;
  transactionId?: string;
  disbursedAmount?: number;
  disbursedDate?: string;
  hasFinancialRecords?: boolean;
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------
function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Info row for cost breakdown
// ---------------------------------------------------------------------------
function InfoRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-[12px] text-gray-400">{label}</span>
      <span className={`text-[13px] ${bold ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function SlideOverPanel({
  card,
  onClose,
  onScore,
  onReview,
  onDisburse,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onScore?: (card: FarmerRequest) => void;
  onReview?: (card: FarmerRequest) => void;
  onDisburse?: (card: FarmerRequest) => void;
}) {
  // Close on Escape key
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const primaryInterest = card.supportInterests.find((si) => si.rank === "Primary");
  const isCash = card.approvedSupportType === "Cash" || primaryInterest?.type === "Cash";

  const totalAmount = isCash
    ? (card.approvedAmountPerFarmer ?? primaryInterest?.amountPerFarmer ?? 0) * card.farmers
    : null;

  const momoNumber = card.momoNumber ?? primaryInterest?.momoNumber ?? "—";
  const momoName   = card.momoName   ?? primaryInterest?.momoName   ?? "—";

  const isFinance = card.stage === "finance_disbursement";
  const disbursed = card.stage === "disbursed";

  // CTA wiring
  function handleCta() {
    if (card.stage === "synced")               { onClose(); onScore?.(card); }
    if (card.stage === "pending_approval")     { onClose(); onReview?.(card); }
    if (card.stage === "finance_disbursement") { onClose(); onDisburse?.(card); }
  }

  const ctaLabel =
    card.stage === "synced"               ? "Begin Review" :
    card.stage === "pending_approval"     ? "Approve Application" :
    card.stage === "finance_disbursement" ? "Verify MoMo & Disburse" :
    null;

  const ctaLocked = card.stage === "agent_confirmation" || disbursed;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-50 flex flex-col bg-white"
        style={{
          width: "min(480px, 45vw)",
          minWidth: 360,
          height: "100vh",
          boxShadow: "-6px 0 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-[17px] font-bold text-gray-900 leading-snug">{card.groupName}</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{card.community}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

          {/* 1. Summary card */}
          <SectionCard>
            <p className="text-[12px] font-bold text-gray-900 mb-3">{card.groupName}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="6" cy="5" r="2.5" stroke="#6B7280" strokeWidth="1.3"/>
                    <circle cx="11" cy="5" r="2.5" stroke="#6B7280" strokeWidth="1.3"/>
                    <path d="M1 14c0-2.761 2.015-4 5-4" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M15 14c0-2.761-2.015-4-5-4" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Farmers</p>
                  <p className="text-[15px] font-bold text-gray-900">{card.farmers}</p>
                </div>
              </div>
              {totalAmount !== null && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="4" width="14" height="9" rx="2" stroke="#6B7280" strokeWidth="1.3"/>
                      <path d="M1 7h14" stroke="#6B7280" strokeWidth="1.3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Total amount</p>
                    <p className="text-[15px] font-bold text-gray-900">GHS {totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* 2. Wallet Verification card (for finance / disbursement stages) */}
          {(isFinance || disbursed) && (
            <SectionCard>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-bold text-gray-900">Wallet Verification</p>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: "#FEF3C7", color: "#D97706" }}>
                  MTN | MoMo
                </span>
              </div>
              {/* Phone number display */}
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 mb-3" style={{ background: "#F3F4F6" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="4" y="1" width="8" height="14" rx="2" stroke="#6B7280" strokeWidth="1.3"/>
                  <circle cx="8" cy="12" r="0.8" fill="#6B7280"/>
                </svg>
                <span className="text-[14px] font-semibold font-mono text-gray-800">{momoNumber}</span>
              </div>
              {!disbursed && (
                <button
                  className="w-full h-9 rounded-lg border-2 text-[13px] font-semibold transition-colors hover:bg-green-50"
                  style={{ borderColor: "#16A34A", color: "#16A34A", background: "transparent" }}
                >
                  Check Wallet Name against Database →
                </button>
              )}
            </SectionCard>
          )}

          {/* 3. Cost Breakdown card */}
          <SectionCard>
            <p className="text-[13px] font-bold text-gray-900 mb-1">Cost Breakdown</p>
            <div>
              <InfoRow label="Community"   value={card.community} />
              <InfoRow label="Farmers"     value={`${card.farmers} members`} />
              {isCash && (
                <>
                  <InfoRow label="Amount per farmer" value={`GHS ${(card.approvedAmountPerFarmer ?? primaryInterest?.amountPerFarmer ?? 0).toFixed(2)}`} />
                  <InfoRow label="Total disbursement" value={`GHS ${(totalAmount ?? 0).toLocaleString()}`} bold />
                </>
              )}
              {!isCash && primaryInterest?.landSizePerFarmer && (
                <>
                  <InfoRow label="Land per farmer" value={`${primaryInterest.landSizePerFarmer} ac`} />
                  <InfoRow label="Total land" value={`${(primaryInterest.landSizePerFarmer * card.farmers).toFixed(1)} ac`} bold />
                </>
              )}
              {momoName !== "—" && <InfoRow label="MoMo name" value={momoName} />}
              {card.score !== null && <InfoRow label="Score" value={`${card.score}%`} />}
              {card.transactionId && <InfoRow label="Transaction ID" value={card.transactionId} bold />}
              {card.disbursedDate && <InfoRow label="Disbursed on" value={card.disbursedDate} />}
            </div>
          </SectionCard>

          {/* Hold warning */}
          {card.onHold && card.holdComment && (
            <div className="rounded-xl border border-amber-200 px-4 py-3" style={{ background: "#FFFBEB" }}>
              <p className="text-[11px] font-bold text-amber-700 mb-0.5">On hold</p>
              <p className="text-[12px] text-amber-600">{card.holdComment}</p>
            </div>
          )}

          {/* Rejection reason */}
          {card.stage === "rejected" && card.rejectionComment && (
            <div className="rounded-xl border border-red-200 px-4 py-3" style={{ background: "#FEF2F2" }}>
              <p className="text-[11px] font-bold text-red-700 mb-0.5">Rejected</p>
              <p className="text-[12px] text-red-600">{card.rejectionComment}</p>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          {ctaLabel && !ctaLocked ? (
            <button
              onClick={handleCta}
              className="w-full h-11 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-colors"
              style={{ background: "#16A34A" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#15803D")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#16A34A")}
            >
              {isFinance && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.41 1.41M11.36 11.36l1.42 1.42M11.36 4.64l1.42-1.42M3.22 12.78l1.41-1.41" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.4"/>
                </svg>
              )}
              {card.stage === "finance_disbursement" ? "Disburse Funds (verify first)" : ctaLabel}
            </button>
          ) : ctaLocked ? (
            <button
              disabled
              className="w-full h-11 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 cursor-not-allowed"
              style={{ background: "#E5E7EB", color: "#9CA3AF" }}
            >
              {disbursed ? "Funds disbursed" : "Awaiting confirmation"}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </>
  );
}
