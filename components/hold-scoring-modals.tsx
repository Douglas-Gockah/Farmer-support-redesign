"use client";

import { useState } from "react";
import type { FarmerRequest } from "@/components/slide-over-panel";

// ---------------------------------------------------------------------------
// Shared modal wrapper
// ---------------------------------------------------------------------------
function ModalWrapper({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.40)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl w-full overflow-y-auto"
        style={{ maxWidth: 540, maxHeight: "90vh", padding: "24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors text-[18px] leading-none"
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hold Modal
// ---------------------------------------------------------------------------
export function HoldModal({
  card,
  onClose,
  onConfirm,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  const [comment, setComment] = useState("");

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="text-[17px] font-bold text-gray-900 pr-8 mb-2">
        Place support request on hold
      </h2>
      <p className="text-[13px] text-gray-500 mb-5">
        Are you sure you want to place this support request on hold?
      </p>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Type a comment for placing this request on hold. Make it short and simple."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
        style={{ height: 80 }}
      />

      <div className="flex gap-3 mt-5">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={comment.trim() === ""}
          onClick={() => onConfirm(card.id)}
          className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors"
          style={{
            background: comment.trim() ? "#16A34A" : "#D1FAE5",
            cursor: comment.trim() ? "pointer" : "not-allowed",
          }}
        >
          Place on hold
        </button>
      </div>
    </ModalWrapper>
  );
}

// ---------------------------------------------------------------------------
// Evidence section (used inside Scoring Modal)
// ---------------------------------------------------------------------------
function EvidenceSection({
  title,
  icon,
  score,
  onScoreChange,
}: {
  title: string;
  icon: string;
  score: number;
  onScoreChange: (v: number) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-4">
      {/* Section title */}
      <p className="text-[14px] font-semibold text-gray-800">
        {icon} {title}
      </p>

      {/* Evidence image placeholder */}
      <div
        className="w-full rounded-lg bg-gray-100 flex items-center justify-center gap-2"
        style={{ height: 80 }}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="4" width="16" height="12" rx="2" stroke="#9CA3AF" strokeWidth="1.5"/>
          <circle cx="7" cy="9" r="1.5" stroke="#9CA3AF" strokeWidth="1.5"/>
          <path d="M2 14l4-4 3 3 3-3 4 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[12px] text-gray-400">Evidence image placeholder</span>
      </div>

      {/* Score slider row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Score (0–10)</span>
          <span className="text-[15px] font-bold" style={{ color: "#16A34A" }}>
            {score}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={score}
          onChange={(e) => onScoreChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            accentColor: "#16A34A",
            background: `linear-gradient(to right, #16A34A ${score * 10}%, #E5E7EB ${score * 10}%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scoring Modal
// ---------------------------------------------------------------------------
export function ScoringModal({
  card,
  onClose,
  onConfirm,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onConfirm: (id: string, score: number) => void;
}) {
  const [meetingScore, setMeetingScore] = useState(5);
  const [financialScore, setFinancialScore] = useState(5);
  const [confirmed, setConfirmed] = useState(false);

  const avgScore = Math.round(((meetingScore + financialScore) / 20) * 100);

  return (
    <ModalWrapper onClose={onClose}>
      {/* Header */}
      <div className="mb-5 pr-8">
        <h2 className="text-[17px] font-bold text-gray-900">
          Score: {card.groupName}
        </h2>
        <p className="text-[13px] text-gray-400 mt-0.5">Review evidence and confirm scores</p>
      </div>

      {/* Scoring sections */}
      <div className="space-y-4 mb-5">
        <EvidenceSection
          title="Meeting Minutes Records"
          icon="📄"
          score={meetingScore}
          onScoreChange={setMeetingScore}
        />
        <EvidenceSection
          title="Financial Contribution Records"
          icon="💰"
          score={financialScore}
          onScoreChange={setFinancialScore}
        />
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-3 cursor-pointer mb-5">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-green-600 shrink-0 cursor-pointer"
        />
        <span className="text-[13px] text-gray-600 leading-relaxed">
          I have reviewed all evidence and confirm these scores are accurate.
        </span>
      </label>

      {/* CTA */}
      <button
        disabled={!confirmed}
        onClick={() => onConfirm(card.id, avgScore)}
        className="w-full py-3 rounded-xl text-[14px] font-semibold text-white transition-colors"
        style={{
          background: confirmed ? "#16A34A" : "#D1FAE5",
          cursor: confirmed ? "pointer" : "not-allowed",
        }}
      >
        Confirm scores
      </button>
    </ModalWrapper>
  );
}
