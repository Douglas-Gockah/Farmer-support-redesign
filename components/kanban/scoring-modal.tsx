"use client";

import { useState } from "react";
import type { FarmerRequest, SupportInterest } from "./types";
import { initials, avatarColor } from "./helpers";

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------
function scoreLabel(s: number) {
  if (s < 40) return "Poor";
  if (s < 60) return "Fair";
  if (s < 80) return "Good";
  return "Excellent";
}
function scoreColor(s: number) {
  if (s < 40) return "#DC2626";
  if (s < 60) return "var(--yellow-600)";
  if (s < 80) return "var(--green-600)";
  return "#059669";
}

// ---------------------------------------------------------------------------
// Image carousel — document viewer placeholder
// ---------------------------------------------------------------------------
function ImageCarousel({ index, setIndex, total = 2 }: {
  index: number;
  setIndex: (i: number) => void;
  total?: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3 w-full">
        <button
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 shrink-0 disabled:opacity-30 transition-colors"
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          className="flex-1 rounded-xl flex flex-col items-center justify-center"
          style={{ height: 200, background: "var(--gray-50)", border: "1.5px solid var(--gray-200)" }}
        >
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none" className="mb-2">
            <rect x="3" y="7" width="34" height="26" rx="4" stroke="var(--gray-300)" strokeWidth="1.8" />
            <circle cx="13" cy="17" r="3.5" stroke="var(--gray-300)" strokeWidth="1.5" />
            <path d="M3 27l9-7 7 6 6-5 12 9" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[12px] font-medium text-gray-400">Document {index + 1} of {total}</p>
        </div>
        <button
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 shrink-0 disabled:opacity-30 transition-colors"
          onClick={() => setIndex(Math.min(total - 1, index + 1))}
          disabled={index === total - 1}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="flex gap-1.5 mt-3">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            className="w-2 h-2 rounded-full transition-colors"
            style={{ background: i === index ? "var(--green-600)" : "var(--gray-300)" }}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score slider — range 1–4 with synced number input
// ---------------------------------------------------------------------------
function ScoreSlider({ label, value, onChange }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const initialized = value >= 1 && value <= 4;
  function clamp(n: number) { return Math.min(4, Math.max(1, n)); }
  function handleInput(raw: string) {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(clamp(n));
  }
  const trackFill = initialized ? ((value - 1) / 3) * 100 : 0;

  return (
    <div className="mt-5 pt-4 border-t border-gray-100">
      <p className="text-[13px] font-semibold text-gray-700 mb-4">{label}</p>
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <div className="flex justify-between text-[11px] font-medium text-gray-400 mb-2">
            {[1, 2, 3, 4].map((n) => <span key={n} className="w-6 text-center">{n}</span>)}
          </div>
          <div className="relative h-2 rounded-full bg-gray-200">
            <div className="absolute left-0 top-0 h-2 rounded-full transition-all" style={{ width: `${trackFill}%`, background: "var(--green-600)" }} />
            <input
              type="range" min={1} max={4} step={1}
              value={initialized ? value : 1}
              onChange={(e) => onChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ margin: 0 }}
            />
            {initialized && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-[2.5px] shadow-sm pointer-events-none"
                style={{ borderColor: "var(--green-600)", left: `calc(${trackFill}% - 10px)`, transition: "left 80ms ease" }}
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 px-0.5">
            <span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <input
            type="number" min={1} max={4}
            value={initialized ? value : ""}
            placeholder="–"
            onChange={(e) => handleInput(e.target.value)}
            className="w-14 h-14 rounded-xl text-center text-[22px] font-bold outline-none transition-colors"
            style={{
              border: `2px solid ${initialized ? "var(--green-600)" : "var(--gray-200)"}`,
              color: initialized ? "var(--green-600)" : "#9CA3AF",
              background: initialized ? "var(--green-25)" : "var(--gray-50)",
              MozAppearance: "textfield",
            }}
          />
          <span className="text-[10px] text-gray-400 font-medium">Score</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Support interest row — vertical layout so amounts are never clipped
// ---------------------------------------------------------------------------
function InterestRow({ si, farmers }: { si: SupportInterest; farmers: number }) {
  const isCash = si.type === "Cash";
  const rankLabel = si.rank === "Primary" ? "1°" : "2°";

  return (
    <div className="py-2.5 px-3 border-b border-gray-100 last:border-0">
      {/* Badge row */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[11px] font-bold text-gray-400 shrink-0">{rankLabel}</span>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
          style={isCash ? { background: "var(--green-50)", color: "var(--green-600)" } : { background: "#FFF7ED", color: "#C2410C" }}
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
          {si.type}
        </span>
      </div>
      {/* Amounts — stacked vertically */}
      {isCash && si.amountPerFarmer != null && (
        <div className="pl-5 space-y-0.5">
          <p className="text-[12px] text-gray-500">GHS {si.amountPerFarmer.toFixed(2)} / farmer</p>
          <p className="text-[12px] font-bold text-gray-900">GHS {(si.amountPerFarmer * farmers).toLocaleString()} total</p>
        </div>
      )}
      {!isCash && si.landSizePerFarmer != null && (
        <div className="pl-5 space-y-0.5">
          <p className="text-[12px] text-gray-500">{si.landSizePerFarmer} ac / farmer</p>
          <p className="text-[12px] font-bold text-gray-900">{(si.landSizePerFarmer * farmers).toFixed(1)} ac total</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Voice note player — mock audio player with waveform visualization
// ---------------------------------------------------------------------------
const WAVEFORM_BARS = [3, 5, 9, 14, 8, 16, 20, 12, 6, 18, 11, 7, 15, 20, 10, 5, 13, 17, 9, 6, 12, 10, 16, 8, 5, 11, 14, 9, 4, 8, 6, 3];
const BAR_MAX = 20;

function VoiceNotePlayer({ title, duration }: { title: string; duration: string }) {
  const [playing, setPlaying] = useState(false);
  // Mock: show first 40% of bars as "played" when active
  const playedCount = playing ? Math.floor(WAVEFORM_BARS.length * 0.4) : 0;

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3.5"
      style={{ background: "var(--gray-50)", border: "1.5px solid var(--gray-200)" }}
    >
      {/* Play / Pause button */}
      <button
        onClick={() => setPlaying((p) => !p)}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
        style={{
          background: playing ? "var(--green-600)" : "var(--green-25)",
          border: `2px solid ${playing ? "var(--green-600)" : "var(--green-200)"}`,
        }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
            <rect x="0.5" y="0.5" width="3" height="12" rx="1" fill="white" />
            <rect x="7.5" y="0.5" width="3" height="12" rx="1" fill="white" />
          </svg>
        ) : (
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
            <path d="M1 1.5l9 5-9 5V1.5z" fill="var(--green-600)" />
          </svg>
        )}
      </button>

      {/* Label + waveform */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-800 mb-2 truncate">{title}</p>
        <div className="flex items-end gap-[2px]" style={{ height: 28 }}>
          {WAVEFORM_BARS.map((h, i) => (
            <div
              key={i}
              className="rounded-full flex-shrink-0 transition-colors"
              style={{
                width: 3,
                height: Math.max(3, Math.round((h / BAR_MAX) * 28)),
                background: i < playedCount ? "var(--green-600)" : "var(--gray-300)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Duration */}
      <span className="text-[11px] font-medium text-gray-400 shrink-0 tabular-nums">{duration}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Group score widget
// ---------------------------------------------------------------------------
function GroupScoreWidget({ score }: { score: number }) {
  const label = scoreLabel(score);
  const color = scoreColor(score);
  // Unfilled overlay: starts from the score% position to the right
  const unfilledWidth = `${100 - score}%`;

  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Group Score</p>
      <div className="rounded-xl border border-gray-200 px-4 py-3.5" style={{ background: "#FAFAFA" }}>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-[30px] font-bold leading-none" style={{ color }}>{score}%</span>
          <span className="text-[12px] font-semibold mb-0.5" style={{ color }}>{label}</span>
        </div>
        {/* Gradient track */}
        <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #EF4444 0%, #F59E0B 45%, var(--green-600) 100%)" }}>
          <div
            className="absolute top-0 right-0 h-full"
            style={{ width: unfilledWidth, background: "var(--gray-200)", opacity: 0.88 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
          <span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left panel — group summary
// ---------------------------------------------------------------------------
function GroupSummaryPanel({ card }: { card: FarmerRequest }) {
  const agentInitials = initials(card.agent);
  const agentColor    = avatarColor(card.agent);

  return (
    <div
      className="hidden md:flex flex-col gap-5 shrink-0 overflow-y-auto"
      style={{ width: 310, borderRight: "1px solid var(--gray-100)", padding: "22px 20px 22px 24px" }}
    >
      {/* Group identity */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</p>
        <p className="text-[15px] font-bold text-gray-900 leading-snug">{card.groupName}</p>
        <p className="text-[12px] text-gray-500 mt-0.5">{card.community}</p>
      </div>

      {/* Key stats — horizontal row */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
          <p className="text-[10px] text-gray-400 mb-0.5">Farmers</p>
          <p className="text-[20px] font-bold text-gray-900">{card.farmers}</p>
        </div>
        <div className="flex-1 rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
          <p className="text-[10px] text-gray-400 mb-0.5">Submitted</p>
          <p className="text-[12px] font-bold text-gray-900 leading-tight mt-1">{card.date}</p>
        </div>
      </div>

      {/* Support interests */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Support Requested</p>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {card.supportInterests.map((si) => (
            <InterestRow key={si.rank} si={si} farmers={card.farmers} />
          ))}
        </div>
      </div>

      {/* Group score */}
      {card.groupScore != null && <GroupScoreWidget score={card.groupScore} />}

      {/* Agent */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Agent</p>
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ background: agentColor }}
          >
            {agentInitials}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-gray-800">{card.agent}</p>
            <p className="text-[11px] text-gray-400">{card.id}</p>
          </div>
        </div>
      </div>

      {/* Interested farmers list */}
      {card.farmersList && card.farmersList.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Interested Farmers ({card.farmersList.length} of {card.farmers})
          </p>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 200 }}>
            {card.farmersList.map((farmer) => {
              const farmerInitials = initials(farmer.name);
              const farmerColor    = avatarColor(farmer.name);
              return (
                <div key={farmer.id} className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ background: farmerColor }}
                  >
                    {farmerInitials}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 leading-tight truncate">{farmer.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{farmer.id}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* On-hold notice */}
      {card.onHold && card.holdComment && (
        <div className="rounded-xl border border-amber-200 px-3 py-2.5" style={{ background: "var(--yellow-50)" }}>
          <p className="text-[11px] font-bold text-amber-700 mb-0.5">On Hold</p>
          <p className="text-[11px] text-amber-600 leading-relaxed">{card.holdComment}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scoring Modal
// ---------------------------------------------------------------------------
interface ScoringModalProps {
  card: FarmerRequest;
  onClose: () => void;
  onScored: (id: string, score: number) => void;
}

export function ScoringModal({ card, onClose, onScored }: ScoringModalProps) {
  const [meetingScore, setMeetingScore] = useState(0);
  const [financeScore, setFinanceScore] = useState(0);
  const [meetingImg,   setMeetingImg]   = useState(0);
  const [financeImg,   setFinanceImg]   = useState(0);
  const [confirmed,    setConfirmed]    = useState(false);

  const meetingValid = meetingScore >= 1 && meetingScore <= 4;
  const canConfirm   = confirmed && meetingValid;

  function handleConfirm() {
    if (!canConfirm) return;
    onScored(card.id, meetingScore * 25); // Map 1→25, 2→50, 3→75, 4→100
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: "min(960px, 95vw)", maxHeight: "92vh", overflow: "hidden" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">Score Application</h2>
            <p className="text-[12px] font-medium text-gray-400 mt-0.5">
              Review the group's records and assign scores to move to Pending Approval
            </p>
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

        {/* ── Body: two columns ── */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">

          {/* Mobile context strip */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div>
              <p className="text-[13px] font-bold text-gray-900">{card.groupName}</p>
              <p className="text-[11px] text-gray-500">{card.community} · {card.farmers} farmers</p>
            </div>
            {card.groupScore != null && (
              <span
                className="text-[13px] font-bold px-2.5 py-1 rounded-lg"
                style={{ background: "var(--green-25)", color: scoreColor(card.groupScore) }}
              >
                {card.groupScore}%
              </span>
            )}
          </div>

          {/* Left: group summary (hidden on mobile) */}
          <GroupSummaryPanel card={card} />

          {/* Right: scoring sections (scrollable) */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">

            {/* Warning banner */}
            <div
              className="flex items-start gap-3 px-6 py-3 shrink-0"
              style={{ background: "var(--yellow-50)", borderBottom: "1px solid var(--yellow-200)" }}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
                <path d="M10 3L18 17H2L10 3Z" stroke="var(--yellow-600)" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M10 8v4M10 13.5v.5" stroke="var(--yellow-600)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <p className="text-[12px] font-medium" style={{ color: "var(--yellow-800)" }}>
                Scores cannot be changed after confirmation. Review all records carefully before assigning.
              </p>
            </div>

            {/* Scrollable scoring body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Section 0 — Evidence of Support Requests (voice notes) */}
              <div className="rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-0.5">
                  {/* Mic icon */}
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0 text-gray-500">
                    <rect x="7" y="1" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 10a6 6 0 0012 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="7" y1="19" x2="13" y2="19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <p className="text-[14px] font-bold text-gray-900">Evidence of Support Requests</p>
                </div>
                <p className="text-[12px] font-medium text-gray-500 mb-4">
                  Voice notes captured during the field visit confirming the group's request for support.
                </p>
                <div className="space-y-3">
                  <VoiceNotePlayer title="Group leader's voice note" duration="0:42" />
                  <VoiceNotePlayer title="Witness's voice note" duration="0:31" />
                </div>
              </div>

              {/* Section 1 — Meeting Minutes */}
              <div className="rounded-xl border border-gray-200 p-5">
                <p className="text-[14px] font-bold text-gray-900 mb-0.5">Meeting Minutes Records</p>
                <p className="text-[12px] font-medium text-gray-500 mb-4">
                  Review the uploaded documents and assign a score between 1 and 4.
                </p>
                <ImageCarousel index={meetingImg} setIndex={setMeetingImg} total={2} />
                <ScoreSlider
                  label="Score for Meeting Minutes (1 = Poor, 4 = Excellent)"
                  value={meetingScore}
                  onChange={setMeetingScore}
                />
              </div>

              {/* Section 2 — Financial Contribution */}
              <div className="rounded-xl border border-gray-200 p-5">
                <p className="text-[14px] font-bold text-gray-900 mb-0.5">Financial Contribution Records</p>
                <p className="text-[12px] font-medium text-gray-500 mb-4">
                  Review the uploaded documents and assign a score between 1 and 4.
                </p>
                {card.hasFinancialRecords ? (
                  <>
                    <ImageCarousel index={financeImg} setIndex={setFinanceImg} total={2} />
                    <ScoreSlider
                      label="Score for Financial Contribution (1 = Poor, 4 = Excellent)"
                      value={financeScore}
                      onChange={setFinanceScore}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "var(--green-25)" }}>
                      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                        <rect x="4" y="2" width="20" height="24" rx="3" stroke="var(--green-600)" strokeWidth="1.6" />
                        <path d="M9 9h10M9 13h10M9 17h6" stroke="var(--green-600)" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-700 max-w-[280px] mb-1.5">
                      No financial contribution records available
                    </p>
                    <p className="text-[12px] text-gray-400 max-w-[260px]">
                      When records are available for this group they will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmation checkbox */}
              <div
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: "var(--green-25)", border: "1.5px solid var(--green-200)" }}
              >
                <input
                  id="score-confirm"
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0"
                  style={{ accentColor: "var(--green-600)" }}
                />
                <label htmlFor="score-confirm" className="text-[13px] font-medium text-gray-700 leading-relaxed cursor-pointer">
                  I have carefully reviewed the evidence records and confirm the scores are accurate.
                  I understand that scores <strong>cannot be changed</strong> once confirmed.
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="h-9 px-5 rounded-lg border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!canConfirm}
                onClick={handleConfirm}
                className="h-9 px-6 rounded-lg text-[13px] font-bold text-white transition-colors"
                style={{
                  background: canConfirm ? "var(--green-600)" : "var(--gray-300)",
                  cursor: canConfirm ? "pointer" : "not-allowed",
                }}
              >
                Confirm Scores
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
