"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/header";
import SlideOverPanel from "@/components/slide-over-panel";
import type { FarmerRequest, Stage, SupportType } from "@/components/slide-over-panel";
import ApprovalModal from "@/components/approval-modal";
import DisbursementModal from "@/components/disbursement-modal";
import { ToastContainer, ToastMessage } from "@/components/toast-notification";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_REQUESTS: FarmerRequest[] = [
  {
    id: "FS-2024-001", date: "12 Jan 2024", agent: "Kofi Mensah", community: "Tamale Metro",
    groupName: "Savannah Growers Union", score: null, stage: "synced", farmers: 22,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: null,
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 120, momoNumber: "0244-567-890", momoName: "Savannah Union GH" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.5 },
    ],
  },
  {
    id: "FS-2024-002", date: "15 Jan 2024", agent: "Ama Owusu", community: "Sawla-Tuna-Kalba",
    groupName: "Northern Fields Cooperative", score: null, stage: "synced", farmers: 18,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: null,
    hasFinancialRecords: true,
    supportInterests: [
      { rank: "Primary",   type: "Ploughing", landSizePerFarmer: 2.0 },
      { rank: "Secondary", type: "Cash",      amountPerFarmer: 100, momoNumber: "0200-123-456", momoName: "Northern Coop" },
    ],
  },
  {
    id: "FS-2024-003", date: "18 Jan 2024", agent: "Yaw Darko", community: "Bole",
    groupName: "Bole Farmers Alliance", score: 62, stage: "pending_approval", farmers: 14,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: null,
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 150, momoNumber: "0551-234-567", momoName: "Bole Alliance" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.0 },
    ],
  },
  {
    id: "FS-2024-004", date: "20 Jan 2024", agent: "Abena Asante", community: "Wa East",
    groupName: "Wa East Crop Circle", score: 78, stage: "pending_approval", farmers: 31,
    onHold: true, holdComment: "MoMo account details need verification from field.", rejectionComment: "", approvedSupportType: null,
    supportInterests: [
      { rank: "Primary",   type: "Ploughing", landSizePerFarmer: 3.0 },
      { rank: "Secondary", type: "Cash",      amountPerFarmer: 200, momoNumber: "0244-987-654", momoName: "WE Crop Circle" },
    ],
  },
  {
    id: "FS-2024-005", date: "10 Jan 2024", agent: "Kwame Boateng", community: "Tamale Metro",
    groupName: "Metro Harvest Group", score: 38, stage: "rejected", farmers: 9,
    onHold: false, holdComment: "", rejectionComment: "Score too low to meet minimum eligibility threshold of 50.", approvedSupportType: null,
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 80,  momoNumber: "0200-000-001", momoName: "Metro Harvest" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 0.5 },
    ],
  },
  {
    id: "FS-2024-006", date: "22 Jan 2024", agent: "Efua Nkrumah", community: "Sawla-Tuna-Kalba",
    groupName: "Kalba Green Initiative", score: 84, stage: "agent_confirmation", farmers: 27,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Cash",
    approvedAmountPerFarmer: 120,
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 120, momoNumber: "0244-111-222", momoName: "Kalba Green" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.5 },
    ],
  },
  {
    id: "FS-2024-007", date: "25 Jan 2024", agent: "Nana Adjei", community: "Bole",
    groupName: "Bole Plough Collective", score: 91, stage: "finance_disbursement", farmers: 16,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Ploughing",
    approvedLandSizePerFarmer: 2.0,
    momoNumber: "0551-777-888", momoName: "Bole Collective",
    supportInterests: [
      { rank: "Primary",   type: "Ploughing", landSizePerFarmer: 2.0 },
      { rank: "Secondary", type: "Cash",      amountPerFarmer: 180, momoNumber: "0551-777-888", momoName: "Bole Collective" },
    ],
  },
  {
    id: "FS-2024-009", date: "26 Jan 2024", agent: "Kofi Mensah", community: "Tamale Metro",
    groupName: "Tamale Pioneer Farmers", score: 75, stage: "finance_disbursement", farmers: 20,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Cash",
    approvedAmountPerFarmer: 150,
    momoNumber: "0244-333-444", momoName: "Tamale Pioneer",
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 150, momoNumber: "0244-333-444", momoName: "Tamale Pioneer" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.2 },
    ],
  },
  {
    id: "FS-2024-008", date: "30 Jan 2024", agent: "Akosua Frimpong", community: "Tamale Metro",
    groupName: "Metro Food Security Group", score: 88, stage: "disbursed", farmers: 34,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Cash",
    approvedAmountPerFarmer: 120,
    momoNumber: "0244-555-666", momoName: "Metro Food Security",
    transactionId: "TXN-4F8A2B1C", disbursedAmount: 4080, disbursedDate: "30 Jan 2024",
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 120, momoNumber: "0244-555-666", momoName: "Metro Food Security" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.0 },
    ],
  },
  {
    id: "FS-2024-010", date: "28 Jan 2024", agent: "Ama Owusu", community: "Wa East",
    groupName: "Wa East Food Coalition", score: 95, stage: "disbursed", farmers: 40,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Cash",
    approvedAmountPerFarmer: 180,
    momoNumber: "0244-999-000", momoName: "WE Food Coalition",
    transactionId: "TXN-7C3D9E2A", disbursedAmount: 7200, disbursedDate: "28 Jan 2024",
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 180, momoNumber: "0244-999-000", momoName: "WE Food Coalition" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
interface ColDef {
  id: Stage;
  label: string;
  dotColor: string;
  ctaLabel: string;
  ctaStages: Stage[];
}

const COLUMNS: ColDef[] = [
  { id: "synced",               label: "Synced Requests",        dotColor: "#D97706", ctaLabel: "Score",    ctaStages: ["synced"] },
  { id: "pending_approval",     label: "Pending Approval",       dotColor: "#2563EB", ctaLabel: "Review",   ctaStages: ["pending_approval"] },
  { id: "rejected",             label: "Rejected",               dotColor: "#DC2626", ctaLabel: "",         ctaStages: [] },
  { id: "agent_confirmation",   label: "Agent Confirmation",     dotColor: "#16A34A", ctaLabel: "",         ctaStages: [] },
  { id: "finance_disbursement", label: "Finance & Disbursement", dotColor: "#7C3AED", ctaLabel: "Disburse", ctaStages: ["finance_disbursement"] },
  { id: "disbursed",            label: "Disbursed",              dotColor: "#6B7280", ctaLabel: "",         ctaStages: [] },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#4F46E5", "#0891B2", "#D97706", "#16A34A", "#DC2626", "#7C3AED", "#0D9488"];
function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ---------------------------------------------------------------------------
// Column header
// ---------------------------------------------------------------------------
function ColumnHeader({ label, dotColor, count }: { label: string; dotColor: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-2" style={{ background: "#F3F4F6" }}>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dotColor }} />
        <span className="text-[13px] font-bold text-gray-800">{label}</span>
      </div>
      <span className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-white shrink-0" style={{ background: dotColor }}>
        {count}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Support type pill with icon
// ---------------------------------------------------------------------------
function SupportPill({ type }: { type: SupportType }) {
  const isCash = type === "Cash";
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={isCash
        ? { background: "#ECFDF5", color: "#16A34A" }
        : { background: "#FFF7ED", color: "#C2410C" }}>
      {isCash ? (
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 8h2M9 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ) : (
        <svg width="12" height="11" viewBox="0 0 16 14" fill="none">
          <rect x="1" y="7" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M3 7V5a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.4"/>
          <circle cx="4.5" cy="10" r="1" fill="currentColor"/>
          <circle cx="11.5" cy="10" r="1" fill="currentColor"/>
        </svg>
      )}
      {type}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Three-dot context menu
// ---------------------------------------------------------------------------
function CardMenu({
  onView,
  onEdit,
  onReject,
}: {
  onView: () => void;
  onEdit: () => void;
  onReject: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-label="Card options"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
          <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
          <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 rounded-lg bg-white shadow-lg border border-gray-100 py-1 overflow-hidden">
          {[
            { label: "View Details", onClick: () => { setOpen(false); onView(); }, red: false },
            { label: "Edit Application", onClick: () => { setOpen(false); onEdit(); }, red: false },
            { label: "Reject Application", onClick: () => { setOpen(false); onReject(); }, red: true },
          ].map((item) => (
            <button key={item.label} onClick={item.onClick}
              className="w-full text-left px-4 py-2 text-[13px] font-medium transition-colors hover:bg-gray-50"
              style={{ color: item.red ? "#DC2626" : "#374151" }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ImageCarousel — module-level to avoid remount on parent re-render
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
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div
          className="flex-1 rounded-xl flex flex-col items-center justify-center"
          style={{ height: 220, background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-2">
            <rect x="3" y="7" width="34" height="26" rx="4" stroke="#CBD5E1" strokeWidth="1.8"/>
            <circle cx="13" cy="17" r="3.5" stroke="#CBD5E1" strokeWidth="1.5"/>
            <path d="M3 27l9-7 7 6 6-5 12 9" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-[12px] font-medium text-gray-400">Document {index + 1} of {total}</p>
        </div>
        <button
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 shrink-0 disabled:opacity-30 transition-colors"
          onClick={() => setIndex(Math.min(total - 1, index + 1))}
          disabled={index === total - 1}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="flex gap-1.5 mt-3">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            className="w-2 h-2 rounded-full transition-colors"
            style={{ background: i === index ? "#16A34A" : "#CBD5E1" }}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScoreSlider — slider + synced number input, range 1–4
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
        {/* Slider */}
        <div className="flex-1 relative">
          {/* Tick labels */}
          <div className="flex justify-between text-[11px] font-medium text-gray-400 mb-2">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className="w-6 text-center">{n}</span>
            ))}
          </div>
          {/* Track + thumb */}
          <div className="relative h-2 rounded-full bg-gray-200">
            <div
              className="absolute left-0 top-0 h-2 rounded-full transition-all"
              style={{ width: `${trackFill}%`, background: "#16A34A" }}
            />
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={initialized ? value : 1}
              onChange={(e) => onChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ margin: 0 }}
            />
            {/* Custom thumb */}
            {initialized && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-[2.5px] shadow-sm pointer-events-none"
                style={{
                  borderColor: "#16A34A",
                  left: `calc(${trackFill}% - 10px)`,
                  transition: "left 80ms ease",
                }}
              />
            )}
          </div>
          {/* Labels below */}
          <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 px-0.5">
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Number input */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <input
            type="number"
            min={1}
            max={4}
            value={initialized ? value : ""}
            placeholder="–"
            onChange={(e) => handleInput(e.target.value)}
            className="w-14 h-14 rounded-xl text-center text-[22px] font-bold outline-none transition-colors"
            style={{
              border: `2px solid ${initialized ? "#16A34A" : "#E2E8F0"}`,
              color: initialized ? "#16A34A" : "#9CA3AF",
              background: initialized ? "#F0FDF4" : "#F8FAFC",
              MozAppearance: "textfield",
            }}
          />
          <span className="text-[10px] text-gray-400 font-medium">Score</span>
        </div>
      </div>
    </div>
  );
}


function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="w-full mb-3">
      <div className="relative h-1.5 rounded-full" style={{ background: "linear-gradient(to right, #EF4444, #F59E0B, #16A34A)" }}>
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-500 shadow-sm"
          style={{ left: `calc(${pct}% - 6px)` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>Poor</span><span>Fair</span><span>Good</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Universal Kanban card
// ---------------------------------------------------------------------------
function KanbanCard({
  r,
  ctaLabel,
  onCta,
  onView,
}: {
  r: FarmerRequest;
  ctaLabel: string;
  onCta: (e: React.MouseEvent) => void;
  onView: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const agentInitials = initials(r.agent);
  const agentColor = avatarColor(r.agent);

  const isRejected = r.stage === "rejected";
  const isDisbursed = r.stage === "disbursed";
  const isAgentConf = r.stage === "agent_confirmation";
  const isPending = r.stage === "pending_approval";
  const isFinance = r.stage === "finance_disbursement";
  const isSynced = r.stage === "synced";

  // CTA button style — amber outlined for on-hold, green otherwise
  const ctaStyle: React.CSSProperties = r.onHold
    ? { background: "transparent", border: "1.5px solid #D97706", color: "#D97706" }
    : { background: "#16A34A", color: "white", border: "none" };

  return (
    <div
      className="bg-white rounded-xl border mb-3 cursor-pointer"
      style={{
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.13)" : "0 1px 4px rgba(0,0,0,0.09)",
        transition: "box-shadow 150ms ease",
        borderStyle: r.onHold ? "dashed" : "solid",
        borderColor: r.onHold ? "#F59E0B" : "#D1D5DB",
        opacity: (isRejected || isDisbursed) ? 0.8 : 1,
      }}
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-4">
        {/* Row 1: name only */}
        <div className="mb-0.5">
          <p className="text-[15px] font-semibold text-gray-900 leading-snug">{r.groupName}</p>
        </div>

        {/* Row 2: subtitle */}
        <p className="text-[12px] font-medium text-gray-500 mb-3 truncate">{r.community} &middot; {r.farmers} farmers</p>

        {/* Score bar — only on pending_approval */}
        {isPending && r.score !== null && <ScoreBar score={r.score} />}

        {/* Support type badges */}
        {(isSynced || isPending || isRejected) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {r.supportInterests.map((si) => (
              <div key={si.rank} className="flex items-center gap-1">
                {isPending && (
                  <span className="text-[10px] font-semibold text-gray-400">{si.rank === "Primary" ? "1°" : "2°"}</span>
                )}
                <SupportPill type={si.type} />
              </div>
            ))}
          </div>
        )}

        {/* Agent confirmation: approved type only + amount/land */}
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

        {/* Agent confirmation waiting text */}
        {isAgentConf && (
          <p className="text-[11px] font-medium italic text-gray-500 mb-3">Awaiting agent confirmation</p>
        )}

        {/* Row: assignee + date (all stages except agent_conf and disbursed which use their own layout) */}
        {!isAgentConf && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ background: agentColor }}>{agentInitials}</span>
              <span className="text-[12px] font-medium text-gray-600 truncate max-w-[100px]">{r.agent.split(" ")[0]}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 1v2M9 1v2M1 6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>{r.date}</span>
            </div>
          </div>
        )}

        {/* Agent conf: agent + date in same row */}
        {isAgentConf && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ background: agentColor }}>{agentInitials}</span>
              <span className="text-[12px] font-medium text-gray-600 truncate max-w-[100px]">{r.agent.split(" ")[0]}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 1v2M9 1v2M1 6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>{r.date}</span>
            </div>
          </div>
        )}

        {/* Reference code — all stages */}
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
          <div className="mb-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: "#FFFBEB", color: "#D97706" }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 5v6M10 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

// ---------------------------------------------------------------------------
// Scoring Modal (centered dialog)
// ---------------------------------------------------------------------------
type ScoreLabel = "Poor" | "Fair" | "Good" | "Excellent";
const SCORE_TILES: { label: ScoreLabel; score: number; desc: string; border: string; bg: string; text: string }[] = [
  { label: "Poor",      score: 25, desc: "Significant gaps in criteria",  border: "#FCA5A5", bg: "#FEF2F2", text: "#DC2626" },
  { label: "Fair",      score: 50, desc: "Meets some requirements",       border: "#FCD34D", bg: "#FFFBEB", text: "#D97706" },
  { label: "Good",      score: 75, desc: "Meets most criteria well",      border: "#93C5FD", bg: "#EFF6FF", text: "#2563EB" },
  { label: "Excellent", score: 95, desc: "Exceeds all scoring criteria",  border: "#86EFAC", bg: "#F0FDF4", text: "#16A34A" },
];

const DOCS = [
  "Meeting Minutes",
  "Financial Records",
  "Group Constitution",
  "Savings Statement",
];

function ScoringModal({ card, onClose, onScored }: {
  card: FarmerRequest;
  onClose: () => void;
  onScored: (id: string, score: number) => void;
}) {
  const [meetingScore, setMeetingScore] = useState(0);
  const [financeScore, setFinanceScore] = useState(0);
  const [meetingImg,   setMeetingImg]   = useState(0);
  const [financeImg,   setFinanceImg]   = useState(0);
  const [confirmed,    setConfirmed]    = useState(false);

  const meetingValid = meetingScore >= 1 && meetingScore <= 4;
  const canConfirm   = confirmed && meetingValid;

  function handleConfirm() {
    if (!canConfirm) return;
    // Map 1→25, 2→50, 3→75, 4→100
    onScored(card.id, meetingScore * 25);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: 680, maxHeight: "92vh", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[18px] font-bold text-gray-900">Update Scores</h2>
            <p className="text-[13px] font-medium text-gray-500 mt-0.5">{card.groupName} &middot; {card.community}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors mt-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Warning banner */}
        <div
          className="flex items-start gap-3 px-6 py-3 shrink-0"
          style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A" }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
            <path d="M10 3L18 17H2L10 3Z" stroke="#D97706" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M10 8v4M10 13.5v.5" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <p className="text-[12px] font-medium" style={{ color: "#92400E" }}>
            Scores cannot be changed after confirmation. Review all records carefully before assigning scores.
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Section 1 — Meeting Minutes */}
          <div className="rounded-xl border border-gray-200 p-5">
            <p className="text-[15px] font-bold text-gray-900 mb-0.5">Meeting Minutes Records</p>
            <p className="text-[12px] font-medium text-gray-500 mb-4">
              Review the uploaded documents and assign a score between 1 and 4.
            </p>
            <ImageCarousel index={meetingImg} setIndex={setMeetingImg} total={2} />
            <ScoreSlider label="Score for Meeting Minutes (1 = Poor, 4 = Excellent)" value={meetingScore} onChange={setMeetingScore} />
          </div>

          {/* Section 2 — Financial Contribution */}
          <div className="rounded-xl border border-gray-200 p-5">
            <p className="text-[15px] font-bold text-gray-900 mb-0.5">Financial Contribution Records</p>
            <p className="text-[12px] font-medium text-gray-500 mb-4">
              Review the uploaded documents and assign a score between 1 and 4.
            </p>

            {card.hasFinancialRecords ? (
              <>
                <ImageCarousel index={financeImg} setIndex={setFinanceImg} total={2} />
                <ScoreSlider label="Score for Financial Contribution (1 = Poor, 4 = Excellent)" value={financeScore} onChange={setFinanceScore} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#F0FDF4" }}>
                  <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                    <rect x="4" y="2" width="20" height="24" rx="3" stroke="#16A34A" strokeWidth="1.6"/>
                    <path d="M9 9h10M9 13h10M9 17h6" stroke="#16A34A" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-gray-700 max-w-[320px] mb-1.5">
                  No financial contribution records available
                </p>
                <p className="text-[12px] text-gray-400 max-w-[300px]">
                  When records are available for this group they will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Confirmation checkbox — inside scroll area */}
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}
          >
            <input
              id="score-confirm"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0"
              style={{ accentColor: "#16A34A" }}
            />
            <label htmlFor="score-confirm" className="text-[13px] font-medium text-gray-700 leading-relaxed cursor-pointer">
              I have carefully reviewed the evidence records and confirm that the scores assigned are accurate.
              I understand that scores <strong>cannot be changed</strong> once confirmed.
            </label>
          </div>

        </div>

        {/* Footer — buttons only */}
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
              background: canConfirm ? "#16A34A" : "#D1D5DB",
              cursor: canConfirm ? "pointer" : "not-allowed",
            }}
          >
            Confirm Scores
          </button>
        </div>
      </div>
    </div>
  );
}
// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function KanbanScreen() {
  const [requests, setRequests] = useState<FarmerRequest[]>(MOCK_REQUESTS);
  const [search, setSearch]     = useState("");
  const [selectedCard, setSelectedCard] = useState<FarmerRequest | null>(null);
  const [reviewCard,   setReviewCard]   = useState<FarmerRequest | null>(null);
  const [scoreCard,    setScoreCard]    = useState<FarmerRequest | null>(null);
  const [disburseCard, setDisburseCard] = useState<FarmerRequest | null>(null);
  const [toasts, setToasts]             = useState<ToastMessage[]>([]);

  function showToast(message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
  }
  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function handleApproved(id: string, approvedType: SupportType, amountPerFarmer?: number, landSizePerFarmer?: number) {
    setRequests((prev) => prev.map((r) => r.id !== id ? r : {
      ...r, stage: "agent_confirmation" as Stage, approvedSupportType: approvedType,
      approvedAmountPerFarmer: amountPerFarmer, approvedLandSizePerFarmer: landSizePerFarmer,
    }));
    setReviewCard(null);
    showToast("Request moved to Agent Confirmation");
  }

  function handleHeld(id: string, comment: string) {
    setRequests((prev) => prev.map((r) => r.id !== id ? r : { ...r, onHold: true, holdComment: comment }));
    setReviewCard(null);
    showToast("Request placed on hold");
  }

  function handleRejected(id: string, comment: string) {
    setRequests((prev) => prev.map((r) => r.id !== id ? r : { ...r, stage: "rejected" as Stage, rejectionComment: comment }));
    setReviewCard(null);
    showToast("Request moved to Rejected");
  }

  function handleScored(id: string, score: number) {
    setRequests((prev) => prev.map((r) => r.id !== id ? r : { ...r, score, stage: "pending_approval" as Stage }));
    setScoreCard(null);
    showToast("Score submitted — moved to Pending Approval");
  }

  function handleDisbursed(id: string, txId: string, amount: number) {
    setRequests((prev) => prev.map((r) => r.id !== id ? r : {
      ...r, stage: "disbursed" as Stage, transactionId: txId, disbursedAmount: amount,
      disbursedDate: new Date().toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" }),
    }));
    setDisburseCard(null);
    showToast("Funds disbursed successfully");
  }

  const filtered = useMemo(() => {
    if (!search) return requests;
    const q = search.toLowerCase();
    return requests.filter((r) =>
      r.groupName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    );
  }, [search, requests]);

  function ctaAction(r: FarmerRequest, stage: Stage) {
    if (stage === "synced")               { setScoreCard(r); }
    if (stage === "pending_approval")     { setReviewCard(r); }
    if (stage === "finance_disbursement") { setDisburseCard(r); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Header totalCount={requests.length} search={search} onSearch={setSearch} />

      {/* Kanban board */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden", background: "#F9FAFB" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 12, padding: "16px 20px", height: "100%", minWidth: "max-content" }}>
          {COLUMNS.map((col) => {
            const cards = filtered.filter((r) => r.stage === col.id);
            return (
              <div key={col.id} style={{ width: 288, minWidth: 288, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                <div style={{ flexShrink: 0 }}>
                  <ColumnHeader label={col.label} dotColor={col.dotColor} count={cards.length} />
                </div>
                <ScrollArea className="flex-1 min-h-0">
                  <div style={{ paddingBottom: 16 }}>
                    {cards.length === 0 ? (
                      <div className="flex items-center justify-center h-20">
                        <span className="text-[12px] text-gray-300">No requests</span>
                      </div>
                    ) : (
                      cards.map((r) => (
                        <KanbanCard
                          key={r.id}
                          r={r}
                          ctaLabel={col.ctaLabel}
                          onCta={() => ctaAction(r, col.id)}
                          onView={() => setSelectedCard(r)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals + panels */}
      {selectedCard && (
        <SlideOverPanel
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onScore={(card) => { setSelectedCard(null); setScoreCard(card); }}
          onReview={(card) => { setSelectedCard(null); setReviewCard(card); }}
          onDisburse={(card) => { setSelectedCard(null); setDisburseCard(card); }}
        />
      )}
      {reviewCard && (
        <ApprovalModal
          card={reviewCard}
          onClose={() => setReviewCard(null)}
          onApproved={handleApproved}
          onHeld={handleHeld}
          onRejected={handleRejected}
        />
      )}
      {scoreCard && (
        <ScoringModal
          card={scoreCard}
          onClose={() => setScoreCard(null)}
          onScored={handleScored}
        />
      )}
      {disburseCard && (
        <DisbursementModal
          card={disburseCard}
          onClose={() => setDisburseCard(null)}
          onDisbursed={handleDisbursed}
        />
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
