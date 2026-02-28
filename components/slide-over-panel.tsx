"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Types (duplicated here to keep component self-contained)
// ---------------------------------------------------------------------------
export type SupportType = "Cash" | "Ploughing";
export type Stage =
  | "pending_scoring"
  | "scoring_complete"
  | "pending_approval"
  | "approved"
  | "agent_confirmed"
  | "funds_disbursed";

export interface FarmerRequest {
  id: string;
  date: string;
  agent: string;
  community: string;
  groupName: string;
  score: number | null;
  stage: Stage;
  supportType: SupportType;
  farmers: number;
  onHold: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STAGE_LABELS: Record<Stage, string> = {
  pending_scoring:  "Pending Scoring",
  scoring_complete: "Scoring Complete",
  pending_approval: "Pending Approval",
  approved:         "Approved",
  agent_confirmed:  "Agent Confirmed",
  funds_disbursed:  "Funds Disbursed",
};

const STAGE_COLORS: Record<Stage, { bg: string; text: string }> = {
  pending_scoring:  { bg: "#FEF3C7", text: "#D97706" },
  scoring_complete: { bg: "#DBEAFE", text: "#2563EB" },
  pending_approval: { bg: "#FEF3C7", text: "#D97706" },
  approved:         { bg: "#DCFCE7", text: "#16A34A" },
  agent_confirmed:  { bg: "#DCFCE7", text: "#16A34A" },
  funds_disbursed:  { bg: "#F3F4F6", text: "#6B7280" },
};

// ---------------------------------------------------------------------------
// ScoreBar
// ---------------------------------------------------------------------------
function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="w-full">
      <div className="relative h-2.5 rounded-full" style={{ background: "linear-gradient(to right, #EF4444, #F59E0B, #16A34A)" }}>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-500 shadow"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>Poor</span>
        <span>Fair</span>
        <span>Good</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CriterionRow (Score Details tab)
// ---------------------------------------------------------------------------
function CriterionRow({
  label,
  type,
  score,
  max = 10,
}: {
  label: string;
  type: "Auto-scored" | "Manual";
  score: number;
  max?: number;
}) {
  const pct = (score / max) * 100;
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <p className="text-[13px] font-medium text-gray-800">{label}</p>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={
              type === "Auto-scored"
                ? { background: "#DBEAFE", color: "#2563EB" }
                : { background: "#FEF3C7", color: "#D97706" }
            }
          >
            {type}
          </span>
        </div>
        <span className="text-[13px] font-bold text-gray-700">
          {score}/{max}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#16A34A]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function SlideOverPanel({
  card,
  onClose,
  onApprove,
  onHold,
  onScore,
  onDisburse,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onApprove?: (card: FarmerRequest) => void;
  onHold?: (card: FarmerRequest) => void;
  onScore?: (card: FarmerRequest) => void;
  onDisburse?: (card: FarmerRequest) => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "score_details">("overview");
  const [isPlaying, setIsPlaying] = useState(false);

  const stageStyle = STAGE_COLORS[card.stage];
  const supportChipStyle =
    card.supportType === "Cash"
      ? { bg: "#EFF6FF", text: "#2563EB" }
      : { bg: "#F3E8FF", text: "#7C3AED" };

  // Derive score display
  const scoreDisplay = card.score !== null ? `${card.score}%` : "Not yet scored";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.15)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-50 flex flex-col bg-white"
        style={{
          width: 420,
          height: "100vh",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.10)",
          animation: "slideIn 200ms ease-out forwards",
        }}
      >
        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="border-b border-gray-100" style={{ padding: "20px 24px 0" }}>
          {/* Close button */}
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 pr-8">
              <h2 className="text-[16px] font-bold text-gray-900 leading-snug">{card.groupName}</h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {card.community} &middot; {card.farmers} farmers
              </p>
              <p className="text-[10px] font-mono text-gray-300 mt-0.5">{card.id}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors text-[16px] leading-none"
              aria-label="Close panel"
            >
              &times;
            </button>
          </div>

          {/* Stage + support chips */}
          <div className="flex items-center gap-2 mt-2 mb-3">
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: stageStyle.bg, color: stageStyle.text }}
            >
              {STAGE_LABELS[card.stage]}
            </span>
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: supportChipStyle.bg, color: supportChipStyle.text }}
            >
              {card.supportType}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-0">
            {(["overview", "score_details"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2.5 text-[13px] font-semibold relative"
                style={{
                  color: activeTab === tab ? "#16A34A" : "#6B7280",
                  transition: "color 200ms ease",
                }}
              >
                {tab === "overview" ? "Overview" : "Score Details"}
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "#16A34A",
                    borderRadius: "2px 2px 0 0",
                    transform: activeTab === tab ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 200ms ease",
                    transformOrigin: "left center",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* BODY (scrollable)                                                */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {activeTab === "overview" && (
            <>
              {/* Group Score */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Group Score</p>
                  <span className="text-[20px] font-bold text-gray-800">
                    {scoreDisplay}
                  </span>
                </div>
                {card.score !== null ? (
                  <ScoreBar score={card.score} />
                ) : (
                  <div className="h-2.5 rounded-full bg-gray-100" />
                )}
              </section>

              {/* Support Interests */}
              <section>
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Support Interests</p>
                <div className="space-y-2">
                  {[
                    { label: "Primary", value: card.supportType },
                    { label: "Secondary", value: card.supportType === "Cash" ? "Ploughing" : "Cash" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                      <span className="text-[12px] text-gray-400">{row.label}</span>
                      <span className="text-[12px] font-semibold text-gray-700">{row.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Agent */}
              <section>
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Agent</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#F0FDF4] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5" r="3" stroke="#16A34A" strokeWidth="1.5"/>
                      <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">{card.agent}</p>
                    <p className="text-[11px] text-gray-400">Requested: {card.date}</p>
                  </div>
                </div>
              </section>

              {/* Voice Note Evidence */}
              <section>
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Voice Note Evidence</p>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  {/* Play button */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#16A34A" }}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                        <rect x="2" y="1" width="3" height="10" rx="1"/>
                        <rect x="7" y="1" width="3" height="10" rx="1"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                        <path d="M3 2l7 4-7 4V2z"/>
                      </svg>
                    )}
                  </button>
                  {/* Progress track */}
                  <div className="flex-1">
                    <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full rounded-full bg-[#16A34A]" style={{ width: "35%" }} />
                    </div>
                  </div>
                  {/* Duration */}
                  <span className="text-[11px] text-gray-400 shrink-0">0:23</span>
                </div>
              </section>
            </>
          )}

          {activeTab === "score_details" && (
            <section>
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Scoring Criteria</p>
              <div className="bg-white rounded-xl border border-gray-100 px-4">
                <CriterionRow label="Meeting Attendance"         type="Auto-scored" score={8} />
                <CriterionRow label="Group Savings"             type="Auto-scored" score={7} />
                <CriterionRow label="Meeting Minutes Records"   type="Manual"      score={6} />
                <CriterionRow label="Financial Contribution Records" type="Manual" score={9} />
              </div>
            </section>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* FOOTER ACTIONS                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="border-t border-gray-100 px-6 py-4">
          {card.stage === "pending_scoring" && (
            <button
              className="w-full py-2.5 rounded-lg bg-[#16A34A] text-white text-[13px] font-semibold hover:bg-[#15803D] transition-colors"
              onClick={() => onScore && onScore(card)}
            >
              Update Scores
            </button>
          )}
          {card.stage === "pending_approval" && (
            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 rounded-lg bg-[#16A34A] text-white text-[13px] font-semibold hover:bg-[#15803D] transition-colors"
                onClick={() => onApprove && onApprove(card)}
              >
                Approve Request
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-[13px] font-semibold hover:bg-gray-50 transition-colors"
                onClick={() => onHold && onHold(card)}
              >
                Place on Hold
              </button>
            </div>
          )}
          {card.stage === "agent_confirmed" && (
            <button
              className="w-full py-2.5 rounded-lg bg-[#16A34A] text-white text-[13px] font-semibold hover:bg-[#15803D] transition-colors"
              onClick={() => onDisburse && onDisburse(card)}
            >
              Disburse Funds
            </button>
          )}
          {(card.stage === "scoring_complete" ||
            card.stage === "approved" ||
            card.stage === "funds_disbursed") && (
            <p className="text-[12px] text-center text-gray-400">
              {card.stage === "scoring_complete" && "Scoring complete — awaiting approval review."}
              {card.stage === "approved" && "This request has been approved."}
              {card.stage === "funds_disbursed" && "Funds have been successfully disbursed."}
            </p>
          )}
        </div>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
