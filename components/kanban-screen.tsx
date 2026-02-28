"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import SlideOverPanel from "@/components/slide-over-panel";
import type { FarmerRequest, Stage, SupportType } from "@/components/slide-over-panel";
import ApprovalModal from "@/components/approval-modal";
import DisbursementModal from "@/components/disbursement-modal";
import { ToastContainer, ToastMessage } from "@/components/toast-notification";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_REQUESTS: FarmerRequest[] = [
  // Col 1 — Synced Requests
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
    supportInterests: [
      { rank: "Primary",   type: "Ploughing", landSizePerFarmer: 2.0 },
      { rank: "Secondary", type: "Cash",      amountPerFarmer: 100, momoNumber: "0200-123-456", momoName: "Northern Coop" },
    ],
  },

  // Col 2 — Pending Approval
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

  // Col 3 — Rejected
  {
    id: "FS-2024-005", date: "10 Jan 2024", agent: "Kwame Boateng", community: "Tamale Metro",
    groupName: "Metro Harvest Group", score: 38, stage: "rejected", farmers: 9,
    onHold: false, holdComment: "", rejectionComment: "Score too low to meet minimum eligibility threshold of 50.", approvedSupportType: null,
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 80,  momoNumber: "0200-000-001", momoName: "Metro Harvest" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 0.5 },
    ],
  },

  // Col 4 — Agent Confirmation
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

  // Col 5 — Finance Review & Disbursement
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

  // Col 6 — Disbursed
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
];

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
interface ColDef {
  id: Stage;
  label: string;
  color: string;
}

const COLUMNS: ColDef[] = [
  { id: "synced",               label: "Synced Requests",              color: "#D97706" },
  { id: "pending_approval",     label: "Pending Approval",             color: "#2563EB" },
  { id: "rejected",             label: "Rejected",                     color: "#DC2626" },
  { id: "agent_confirmation",   label: "Agent Confirmation",           color: "#16A34A" },
  { id: "finance_disbursement", label: "Finance Review & Disbursement", color: "#7C3AED" },
  { id: "disbursed",            label: "Disbursed",                    color: "#6B7280" },
];

// ---------------------------------------------------------------------------
// ScoreBar (mini, for cards)
// ---------------------------------------------------------------------------
function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="mt-2 mb-1">
      <div className="relative h-1.5 rounded-full overflow-visible" style={{ background: "linear-gradient(to right, #EF4444, #F59E0B, #16A34A)" }}>
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-zinc-500 shadow" style={{ left: `calc(${pct}% - 6px)` }} />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
        <span>Poor</span><span>Fair</span><span>Good</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column header
// ---------------------------------------------------------------------------
function ColumnHeader({ label, color, count }: { label: string; color: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-[10px] mb-3" style={{ backgroundColor: `${color}1A` }}>
      <span className="text-[12px] font-bold" style={{ color }}>{label}</span>
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: color }}>{count}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Support type badge helper
// ---------------------------------------------------------------------------
function SupportBadge({ type }: { type: SupportType }) {
  return (
    <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 rounded-full border-0"
      style={type === "Cash" ? { background: "#EFF6FF", color: "#2563EB" } : { background: "#F3E8FF", color: "#7C3AED" }}>
      {type}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Column 1 — Synced Requests card
// ---------------------------------------------------------------------------
function SyncedCard({ r, onClick, onScore }: { r: FarmerRequest; onClick: () => void; onScore: (e: React.MouseEvent) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Card className="mb-3 cursor-pointer" style={{ boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.08)", transition: "box-shadow 150ms ease" }}
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-[13px] font-bold truncate">{r.groupName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{r.community}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {r.supportInterests.map((si) => <SupportBadge key={si.rank} type={si.type} />)}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
          <span>{r.agent.split(" ").slice(0, 2).join(" ")}</span>
          <span>{r.farmers} farmers</span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground">{r.date}</span>
          <Button size="sm" className="h-6 px-3 text-[11px] font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white" onClick={onScore}>Score</Button>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">{r.id}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Column 2 — Pending Approval card
// ---------------------------------------------------------------------------
function PendingApprovalCard({ r, onClick, onReview }: { r: FarmerRequest; onClick: () => void; onReview: (e: React.MouseEvent) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Card className="mb-3 cursor-pointer" style={{ boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.08)", border: r.onHold ? "1.5px dashed #D97706" : undefined, transition: "box-shadow 150ms ease" }}
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-[13px] font-bold truncate">{r.groupName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{r.community}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {r.supportInterests.map((si) => (
              <div key={si.rank} className="flex items-center gap-1">
                <span className="text-[9px] text-muted-foreground">{si.rank}</span>
                <SupportBadge type={si.type} />
              </div>
            ))}
            {r.onHold && <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 rounded-full border-0" style={{ background: "#FEF3C7", color: "#D97706" }}>On Hold</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <span>{r.agent.split(" ").slice(0, 2).join(" ")}</span>
          <span>{r.farmers} farmers</span>
        </div>
        {r.score !== null && <ScoreBar score={r.score} />}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground">{r.date}</span>
          <Button size="sm" className="h-6 px-3 text-[11px] font-semibold"
            style={r.onHold ? { background: "transparent", border: "1px solid #D97706", color: "#D97706" } : { background: "#16A34A", color: "white" }}
            onClick={onReview}>
            Review
          </Button>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">{r.id}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Column 3 — Rejected card
// ---------------------------------------------------------------------------
function RejectedCard({ r, onClick }: { r: FarmerRequest; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Card className="mb-3 cursor-pointer" style={{ opacity: 0.8, boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.06)", transition: "box-shadow 150ms ease" }}
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-[13px] font-bold truncate">{r.groupName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{r.community}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {r.supportInterests.map((si) => <SupportBadge key={si.rank} type={si.type} />)}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <span>{r.agent.split(" ").slice(0, 2).join(" ")}</span>
        </div>
        {r.score !== null && <ScoreBar score={r.score} />}
        {r.rejectionComment && (
          <div className="mt-2 rounded-lg px-2.5 py-2" style={{ background: "#FEF2F2" }}>
            <p className="text-[11px] text-red-600 leading-relaxed">{r.rejectionComment}</p>
          </div>
        )}
        <p className="text-[10px] font-mono text-muted-foreground/40 mt-2">{r.id}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Column 4 — Agent Confirmation card
// ---------------------------------------------------------------------------
function AgentConfirmationCard({ r, onClick }: { r: FarmerRequest; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const approvedInterest = r.supportInterests.find((si) => si.type === r.approvedSupportType);
  return (
    <Card className="mb-3 cursor-pointer" style={{ boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.08)", transition: "box-shadow 150ms ease" }}
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-[13px] font-bold truncate">{r.groupName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{r.community}</p>
          </div>
          {r.approvedSupportType && <SupportBadge type={r.approvedSupportType} />}
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <span>{r.agent.split(" ").slice(0, 2).join(" ")}</span>
          <span>{r.farmers} farmers</span>
        </div>
        {r.approvedSupportType === "Cash" && r.approvedAmountPerFarmer && (
          <div className="mt-2 text-[12px] font-semibold text-foreground">
            GHS {(r.approvedAmountPerFarmer * r.farmers).toLocaleString()} total
          </div>
        )}
        {r.approvedSupportType === "Ploughing" && r.approvedLandSizePerFarmer && (
          <div className="mt-2 text-[12px] font-semibold text-foreground">
            {(r.approvedLandSizePerFarmer * r.farmers).toFixed(1)} acres total
          </div>
        )}
        <p className="mt-2 text-[11px] italic text-muted-foreground">Awaiting agent confirmation</p>
        <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">{r.id}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Column 5 — Finance Review & Disbursement card
// ---------------------------------------------------------------------------
function FinanceCard({ r, onClick, onDisburse }: { r: FarmerRequest; onClick: () => void; onDisburse: (e: React.MouseEvent) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Card className="mb-3 cursor-pointer" style={{ boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.08)", transition: "box-shadow 150ms ease" }}
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[13px] font-bold truncate">{r.groupName}</p>
          {r.approvedSupportType && <SupportBadge type={r.approvedSupportType} />}
        </div>
        <div className="space-y-1">
          {r.momoNumber && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">MoMo</span>
              <span className="font-semibold font-mono">{r.momoNumber}</span>
            </div>
          )}
          {r.momoName && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Name</span>
              <span className="font-semibold">{r.momoName}</span>
            </div>
          )}
          {r.approvedSupportType === "Cash" && r.approvedAmountPerFarmer && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-foreground">GHS {(r.approvedAmountPerFarmer * r.farmers).toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <p className="text-[10px] font-mono text-muted-foreground/40">{r.id}</p>
          <Button size="sm" className="h-6 px-3 text-[11px] font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white" onClick={onDisburse}>Disburse</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Column 6 — Disbursed card
// ---------------------------------------------------------------------------
function DisbursedCard({ r, onClick }: { r: FarmerRequest; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Card className="mb-3 cursor-pointer" style={{ opacity: 0.8, boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.06)", transition: "box-shadow 150ms ease" }}
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[13px] font-bold truncate">{r.groupName}</p>
          {r.approvedSupportType && <SupportBadge type={r.approvedSupportType} />}
        </div>
        <div className="space-y-1">
          {r.disbursedAmount && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Amount disbursed</span>
              <span className="font-bold text-[#16A34A]">GHS {r.disbursedAmount.toLocaleString()}</span>
            </div>
          )}
          {r.momoName && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Recipient</span>
              <span className="font-semibold">{r.momoName}</span>
            </div>
          )}
          {r.transactionId && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Tx ID</span>
              <span className="font-mono text-[11px] text-[#16A34A]">{r.transactionId}</span>
            </div>
          )}
          {r.disbursedDate && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Date</span>
              <span className="text-muted-foreground">{r.disbursedDate}</span>
            </div>
          )}
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/40 mt-2">{r.id}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function KanbanScreen() {
  const [requests, setRequests] = useState<FarmerRequest[]>(MOCK_REQUESTS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | SupportType>("all");
  const [selectedCard, setSelectedCard] = useState<FarmerRequest | null>(null);
  const [reviewCard, setReviewCard]     = useState<FarmerRequest | null>(null);
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
      ...r,
      stage: "agent_confirmation" as Stage,
      approvedSupportType: approvedType,
      approvedAmountPerFarmer: amountPerFarmer,
      approvedLandSizePerFarmer: landSizePerFarmer,
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

  function handleDisbursed(id: string, txId: string, amount: number) {
    setRequests((prev) => prev.map((r) => r.id !== id ? r : {
      ...r,
      stage: "disbursed" as Stage,
      transactionId: txId,
      disbursedAmount: amount,
      disbursedDate: new Date().toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" }),
    }));
    setDisburseCard(null);
    showToast("Funds disbursed successfully");
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch = search === "" ||
        r.groupName.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" ||
        r.supportInterests.some((si) => si.type === filterType);
      return matchesSearch && matchesType;
    });
  }, [search, filterType, requests]);

  function renderCard(r: FarmerRequest, col: ColDef) {
    switch (col.id) {
      case "synced":
        return <SyncedCard key={r.id} r={r} onClick={() => setSelectedCard(r)}
          onScore={(e) => { e.stopPropagation(); setSelectedCard(null); /* scoring modal placeholder */ }} />;
      case "pending_approval":
        return <PendingApprovalCard key={r.id} r={r} onClick={() => setSelectedCard(r)}
          onReview={(e) => { e.stopPropagation(); setSelectedCard(null); setReviewCard(r); }} />;
      case "rejected":
        return <RejectedCard key={r.id} r={r} onClick={() => setSelectedCard(r)} />;
      case "agent_confirmation":
        return <AgentConfirmationCard key={r.id} r={r} onClick={() => setSelectedCard(r)} />;
      case "finance_disbursement":
        return <FinanceCard key={r.id} r={r} onClick={() => setSelectedCard(r)}
          onDisburse={(e) => { e.stopPropagation(); setSelectedCard(null); setDisburseCard(r); }} />;
      case "disbursed":
        return <DisbursedCard key={r.id} r={r} onClick={() => setSelectedCard(r)} />;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Filter bar */}
      <div className="flex items-center gap-3 px-6 bg-white border-b border-border" style={{ height: 56, flexShrink: 0 }}>
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by group name or reference..." className="pl-8 text-[13px] h-9" />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
          <SelectTrigger className="w-[140px] h-9 text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Ploughing">Ploughing</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <div className="flex items-center rounded-lg border border-border overflow-hidden bg-white">
          <Button variant="ghost" size="sm" className="rounded-none h-9 px-3 text-[12px] font-semibold bg-[#F0FDF4] text-[#16A34A] border-r border-border hover:bg-[#DCFCE7]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mr-1.5">
              <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="10" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="10" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Kanban
          </Button>
          <Button variant="ghost" size="sm" className="rounded-none h-9 px-3 text-[12px] text-muted-foreground cursor-not-allowed opacity-50">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mr-1.5">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Table
          </Button>
        </div>
      </div>

      {/* Kanban board */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 12, padding: 16, height: "100%", minWidth: "max-content" }}>
          {COLUMNS.map((col) => {
            const cards = filtered.filter((r) => r.stage === col.id);
            return (
              <div key={col.id} style={{ width: 280, minWidth: 280, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                <div style={{ flexShrink: 0 }}>
                  <ColumnHeader label={col.label} color={col.color} count={cards.length} />
                </div>
                <ScrollArea className="flex-1 min-h-0">
                  <div style={{ paddingBottom: 16 }}>
                    {cards.length === 0 ? (
                      <div className="flex items-center justify-center h-20">
                        <span className="text-[12px] text-muted-foreground/50">No requests</span>
                      </div>
                    ) : (
                      cards.map((r) => renderCard(r, col))
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCard && (
        <SlideOverPanel
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onScore={(card) => { setSelectedCard(null); }}
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
