"use client";

import { useState, useMemo } from "react";
import SlideOverPanel from "@/components/slide-over-panel";
import type { FarmerRequest, Stage } from "@/components/slide-over-panel";
import ApprovalModal from "@/components/approval-modal";
import { HoldModal, ScoringModal } from "@/components/hold-scoring-modals";
import DisbursementModal from "@/components/disbursement-modal";
import { ToastContainer, ToastMessage } from "@/components/toast-notification";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_REQUESTS: FarmerRequest[] = [
  {
    id: "FS-2024-001",
    date: "12 Jan 2024",
    agent: "Kofi Mensah",
    community: "Tamale Metro",
    groupName: "Savannah Growers Union",
    score: null,
    stage: "pending_scoring",
    supportType: "Cash",
    farmers: 22,
    onHold: false,
  },
  {
    id: "FS-2024-002",
    date: "15 Jan 2024",
    agent: "Ama Owusu",
    community: "Sawla-Tuna-Kalba",
    groupName: "Northern Fields Cooperative",
    score: null,
    stage: "pending_scoring",
    supportType: "Ploughing",
    farmers: 18,
    onHold: true,
  },
  {
    id: "FS-2024-003",
    date: "18 Jan 2024",
    agent: "Yaw Darko",
    community: "Bole",
    groupName: "Bole Farmers Alliance",
    score: 62,
    stage: "scoring_complete",
    supportType: "Cash",
    farmers: 14,
    onHold: false,
  },
  {
    id: "FS-2024-004",
    date: "20 Jan 2024",
    agent: "Abena Asante",
    community: "Wa East",
    groupName: "Wa East Crop Circle",
    score: 78,
    stage: "scoring_complete",
    supportType: "Ploughing",
    farmers: 31,
    onHold: false,
  },
  {
    id: "FS-2024-005",
    date: "22 Jan 2024",
    agent: "Kwame Boateng",
    community: "Tamale Metro",
    groupName: "Metro Harvest Group",
    score: 55,
    stage: "pending_approval",
    supportType: "Cash",
    farmers: 9,
    onHold: false,
  },
  {
    id: "FS-2024-006",
    date: "25 Jan 2024",
    agent: "Efua Nkrumah",
    community: "Sawla-Tuna-Kalba",
    groupName: "Kalba Green Initiative",
    score: 84,
    stage: "approved",
    supportType: "Cash",
    farmers: 27,
    onHold: false,
  },
  {
    id: "FS-2024-007",
    date: "28 Jan 2024",
    agent: "Nana Adjei",
    community: "Bole",
    groupName: "Bole Plough Collective",
    score: 91,
    stage: "agent_confirmed",
    supportType: "Ploughing",
    farmers: 16,
    onHold: false,
  },
  {
    id: "FS-2024-008",
    date: "30 Jan 2024",
    agent: "Akosua Frimpong",
    community: "Tamale Metro",
    groupName: "Metro Food Security Group",
    score: 88,
    stage: "funds_disbursed",
    supportType: "Cash",
    farmers: 34,
    onHold: false,
  },
];

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
const COLUMNS: {
  id: Stage;
  label: string;
  color: string;
  actionLabel: string;
  actionActive: boolean;
}[] = [
  { id: "pending_scoring",   label: "Pending Scoring",   color: "#D97706", actionLabel: "Score",    actionActive: true  },
  { id: "scoring_complete",  label: "Scoring Complete",  color: "#2563EB", actionLabel: "Approve",  actionActive: true  },
  { id: "pending_approval",  label: "Pending Approval",  color: "#D97706", actionLabel: "Approve",  actionActive: true  },
  { id: "approved",          label: "Approved",          color: "#16A34A", actionLabel: "Disburse", actionActive: true  },
  { id: "agent_confirmed",   label: "Agent Confirmed",   color: "#16A34A", actionLabel: "Disburse", actionActive: true  },
  { id: "funds_disbursed",   label: "Funds Disbursed",   color: "#6B7280", actionLabel: "View",     actionActive: false },
];

// ---------------------------------------------------------------------------
// Score bar sub-component
// ---------------------------------------------------------------------------
function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="mt-2 mb-1">
      <div className="relative h-2 rounded-full overflow-visible" style={{ background: "linear-gradient(to right, #EF4444, #F59E0B, #16A34A)" }}>
        {/* track bg already is the gradient */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-600 shadow"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-gray-400 mt-1">
        <span>Poor</span>
        <span>Fair</span>
        <span>Good</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanban Card
// ---------------------------------------------------------------------------
function KanbanCard({
  request,
  actionLabel,
  actionActive,
  onClick,
  onApprove,
  onScore,
  onDisburse,
}: {
  request: FarmerRequest;
  actionLabel: string;
  actionActive: boolean;
  onClick: () => void;
  onApprove?: (e: React.MouseEvent) => void;
  onScore?: (e: React.MouseEvent) => void;
  onDisburse?: (e: React.MouseEvent) => void;
}) {
  const agentShort = request.agent.split(" ").slice(0, 2).join(" ");
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-xl p-[14px] mb-3 cursor-pointer"
      style={{
        boxShadow: hovered
          ? "0 4px 12px rgba(0,0,0,0.12)"
          : "0 1px 4px rgba(0,0,0,0.08)",
        border: request.onHold ? "1.5px dashed #D97706" : "1px solid #F3F4F6",
        transition: "box-shadow 150ms ease",
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">{request.groupName}</p>
          <p className="text-[12px] text-gray-400 leading-tight truncate">{request.community}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {/* Support type chip */}
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={
              request.supportType === "Cash"
                ? { background: "#EFF6FF", color: "#2563EB" }
                : { background: "#F3E8FF", color: "#7C3AED" }
            }
          >
            {request.supportType}
          </span>
          {/* On Hold chip */}
          {request.onHold && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>
              On Hold
            </span>
          )}
        </div>
      </div>

      {/* Row 2: agent + farmers */}
      <div className="flex items-center gap-3 mt-1.5">
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {agentShort}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <circle cx="5" cy="5" r="2.5" stroke="#9CA3AF" strokeWidth="1.5"/>
            <circle cx="11" cy="5" r="2.5" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M1 14c0-2.5 2-4 4-4m6 0c2 0 4 1.5 4 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {request.farmers} farmers
        </span>
      </div>

      {/* Score bar */}
      {request.score !== null && <ScoreBar score={request.score} />}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">{request.date}</span>
        <button
          className="text-[11px] font-semibold px-3 py-1 rounded-lg"
          style={
            actionActive
              ? { background: "#16A34A", color: "#fff" }
              : { background: "#F3F4F6", color: "#6B7280" }
          }
          onClick={(e) => {
            e.stopPropagation();
            if (actionLabel === "Approve" && onApprove) onApprove(e);
            if (actionLabel === "Score" && onScore) onScore(e);
            if (actionLabel === "Disburse" && onDisburse) onDisburse(e);
          }}
        >
          {actionLabel}
        </button>
      </div>

      {/* Reference */}
      <p className="text-[10px] font-mono text-gray-300 mt-1">{request.id}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column header
// ---------------------------------------------------------------------------
function ColumnHeader({ label, color, count }: { label: string; color: string; count: number }) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-[10px] mb-3"
      style={{ backgroundColor: `${color}1A` }} // ~10% opacity hex trick
    >
      <span className="text-[13px] font-bold" style={{ color }}>
        {label}
      </span>
      <span
        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: color, color: "#fff" }}
      >
        {count}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function KanbanScreen() {
  const [requests, setRequests] = useState<FarmerRequest[]>(MOCK_REQUESTS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All Types" | "Cash" | "Ploughing">("All Types");
  const [selectedCard, setSelectedCard] = useState<FarmerRequest | null>(null);
  const [approveCard, setApproveCard] = useState<FarmerRequest | null>(null);
  const [holdCard, setHoldCard] = useState<FarmerRequest | null>(null);
  const [scoreCard, setScoreCard] = useState<FarmerRequest | null>(null);
  const [disburseCard, setDisburseCard] = useState<FarmerRequest | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function showToast(message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
  }

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function handleApprove(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, stage: "approved" as Stage } : r))
    );
    setSelectedCard((prev) => (prev?.id === id ? { ...prev, stage: "approved" as Stage } : prev));
    setApproveCard(null);
    showToast("Request moved to Approved");
  }

  function handleHold(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, onHold: true } : r))
    );
    setSelectedCard((prev) => (prev?.id === id ? { ...prev, onHold: true } : prev));
    setHoldCard(null);
    showToast("Request placed on hold");
  }

  function handleScore(id: string, score: number) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, stage: "scoring_complete" as Stage, score } : r
      )
    );
    setSelectedCard((prev) =>
      prev?.id === id ? { ...prev, stage: "scoring_complete" as Stage, score } : prev
    );
    setScoreCard(null);
    showToast("Request moved to Scoring Complete");
  }

  function handleDisbursed(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, stage: "funds_disbursed" as Stage } : r))
    );
    setSelectedCard((prev) =>
      prev?.id === id ? { ...prev, stage: "funds_disbursed" as Stage } : prev
    );
    setDisburseCard(null);
    showToast("Request moved to Funds Disbursed");
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        search === "" ||
        r.groupName.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "All Types" || r.supportType === filterType;
      return matchesSearch && matchesType;
    });
  }, [search, filterType, requests]);

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Filter bar */}
      <div className="flex items-center gap-3 px-6 py-[10px] bg-white border-b border-[#E5E7EB]">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by group name or reference..."
            className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
          />
        </div>

        {/* Support type dropdown */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200 cursor-pointer"
        >
          <option>All Types</option>
          <option>Cash</option>
          <option>Ploughing</option>
        </select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden bg-white">
          <button className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold bg-[#F0FDF4] text-[#16A34A] border-r border-gray-200">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" stroke="#16A34A" strokeWidth="1.5"/>
              <rect x="10" y="1" width="5" height="5" rx="1" stroke="#16A34A" strokeWidth="1.5"/>
              <rect x="1" y="10" width="5" height="5" rx="1" stroke="#16A34A" strokeWidth="1.5"/>
              <rect x="10" y="10" width="5" height="5" rx="1" stroke="#16A34A" strokeWidth="1.5"/>
            </svg>
            Kanban
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-gray-400 cursor-not-allowed">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Table
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 px-6 py-5 h-full" style={{ minWidth: "max-content" }}>
          {COLUMNS.map((col) => {
            const cards = filtered.filter((r) => r.stage === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col"
                style={{ width: 260, minWidth: 260, flexShrink: 0 }}
              >
                {/* Sticky column header */}
                <div style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <ColumnHeader label={col.label} color={col.color} count={cards.length} />
                </div>
                <div className="flex-1 overflow-y-auto pr-0.5">
                  {cards.length === 0 ? (
                    <div className="flex items-center justify-center h-20">
                      <span className="text-[12px] text-gray-300">No requests</span>
                    </div>
                  ) : (
                    cards.map((r) => (
                      <KanbanCard
                        key={r.id}
                        request={r}
                        actionLabel={col.actionLabel}
                        actionActive={col.actionActive}
                        onClick={() => setSelectedCard(r)}
                        onApprove={(e) => { e.stopPropagation(); setApproveCard(r); }}
                        onScore={(e) => { e.stopPropagation(); setScoreCard(r); }}
                        onDisburse={(e) => { e.stopPropagation(); setDisburseCard(r); }}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over panel */}
      {selectedCard && (
        <SlideOverPanel
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onApprove={(card) => setApproveCard(card)}
          onHold={(card) => setHoldCard(card)}
          onScore={(card) => setScoreCard(card)}
          onDisburse={(card) => setDisburseCard(card)}
        />
      )}

      {/* Approval modal */}
      {approveCard && (
        <ApprovalModal
          card={approveCard}
          onClose={() => setApproveCard(null)}
          onApprove={handleApprove}
        />
      )}

      {/* Hold modal */}
      {holdCard && (
        <HoldModal
          card={holdCard}
          onClose={() => setHoldCard(null)}
          onConfirm={handleHold}
        />
      )}

      {/* Scoring modal */}
      {scoreCard && (
        <ScoringModal
          card={scoreCard}
          onClose={() => setScoreCard(null)}
          onConfirm={handleScore}
        />
      )}

      {/* Disbursement modal */}
      {disburseCard && (
        <DisbursementModal
          card={disburseCard}
          onClose={() => setDisburseCard(null)}
          onDisbursed={handleDisbursed}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
