"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { FarmerRequest, SupportInterest, SupportType } from "@/components/kanban/types";
import { initials, avatarColor } from "@/components/kanban/helpers";

// ---------------------------------------------------------------------------
// ScoreBar
// ---------------------------------------------------------------------------
function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="w-full">
      <div className="relative h-2 rounded-full" style={{ background: "linear-gradient(to right, #EF4444, #F59E0B, #16A34A)" }}>
        <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-zinc-500 shadow" style={{ left: `calc(${pct}% - 7px)` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>Poor</span><span>Fair</span><span>Good</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InterestRow — vertical layout so amounts are never clipped
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
          style={isCash ? { background: "#ECFDF5", color: "#16A34A" } : { background: "#FFF7ED", color: "#C2410C" }}
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
      {/* Amounts */}
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
// Left panel — group context
// ---------------------------------------------------------------------------
function GroupContextPanel({ card }: { card: FarmerRequest }) {
  const agentInitials = initials(card.agent);
  const agentColor    = avatarColor(card.agent);

  return (
    <div
      className="hidden md:flex flex-col gap-5 shrink-0 overflow-y-auto"
      style={{ width: 310, borderRight: "1px solid #F3F4F6", padding: "22px 20px 22px 24px" }}
    >
      {/* Group identity */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</p>
        <p className="text-[15px] font-bold text-gray-900 leading-snug">{card.groupName}</p>
        <p className="text-[12px] text-gray-500 mt-0.5">{card.community}</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3" style={{ background: "#F9FAFB" }}>
          <p className="text-[10px] text-gray-400 mb-0.5">Farmers</p>
          <p className="text-[20px] font-bold text-gray-900">{card.farmers}</p>
        </div>
        {card.score !== null && (
          <div className="flex-1 rounded-xl p-3" style={{ background: "#F9FAFB" }}>
            <p className="text-[10px] text-gray-400 mb-0.5">Score</p>
            <p className="text-[20px] font-bold" style={{ color: "#16A34A" }}>{card.score}%</p>
          </div>
        )}
      </div>

      {/* Score bar */}
      {card.score !== null && <ScoreBar score={card.score} />}

      {/* Support interests */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Support Requested</p>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {card.supportInterests.map((si) => (
            <InterestRow key={si.rank} si={si} farmers={card.farmers} />
          ))}
        </div>
      </div>

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

      {/* On-hold notice */}
      {card.onHold && card.holdComment && (
        <div className="rounded-xl border border-amber-200 px-3 py-2.5" style={{ background: "#FFFBEB" }}>
          <p className="text-[11px] font-bold text-amber-700 mb-0.5">On Hold</p>
          <p className="text-[11px] text-amber-600 leading-relaxed">{card.holdComment}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SupportOptionCard — selectable, with inline editable amount + double toggle
// ---------------------------------------------------------------------------
function SupportOptionCard({
  interest,
  farmers,
  selected,
  onSelect,
  editableAmount,
  onAmountSave,
  isDouble,
  onToggleDouble,
}: {
  interest: SupportInterest;
  farmers: number;
  selected: boolean;
  onSelect: () => void;
  editableAmount: number;
  onAmountSave: (amount: number, comment: string) => void;
  isDouble?: boolean;
  onToggleDouble?: () => void;
}) {
  const isCash = interest.type === "Cash";
  const [editing,     setEditing]     = useState(false);
  const [editValue,   setEditValue]   = useState(String(editableAmount));
  const [editComment, setEditComment] = useState("");

  // The effective displayed amount — doubled when opted
  const effectiveAmount = isCash && isDouble ? editableAmount * 2 : editableAmount;

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    const num = parseFloat(editValue);
    if (!isNaN(num) && num > 0) onAmountSave(num, editComment);
    setEditing(false);
    setEditComment("");
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    setEditValue(String(editableAmount));
    setEditing(false);
    setEditComment("");
  }

  return (
    <div
      className="relative rounded-xl border-2 p-4 transition-all"
      style={{
        borderColor: selected ? "#16A34A" : "#E5E7EB",
        background:  selected ? "#F0FDF4" : "#FAFAFA",
        opacity:     selected ? 1 : 0.65,
        cursor:      editing  ? "default" : "pointer",
      }}
      onClick={() => { if (!editing) onSelect(); }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {interest.rank}
        </span>
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
          style={{ borderColor: selected ? "#16A34A" : "#D1D5DB", background: selected ? "#16A34A" : "transparent" }}
        >
          {selected && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      {/* Type label */}
      <p className="text-[14px] font-bold text-gray-900 mb-3">
        {isCash ? "Cash Support" : "Ploughing Support"}
      </p>

      {/* Stats — flex-wrap so they all sit in one row when space permits */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 items-start">

        {/* Farmers */}
        <div className="min-w-[56px]">
          <p className="text-[10px] text-gray-400 mb-0.5">Farmers</p>
          <p className="text-[13px] font-semibold text-gray-900">{farmers}</p>
        </div>

        {/* Amount / farmer — editable for cash */}
        {isCash ? (
          <div className="min-w-[110px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-[10px] text-gray-400">Amount / farmer</p>
              {!editing && selected && (
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(true); setEditValue(String(editableAmount)); }}
                  className="flex items-center gap-1 h-5 px-2 rounded-full text-[10px] font-bold transition-colors hover:brightness-95"
                  style={{ background: "#DCFCE7", color: "#16A34A" }}
                >
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M7.5 1L9 2.5 3.5 8H2V6.5L7.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
            {editing ? (
              <div className="space-y-2 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-gray-500 shrink-0">GHS</span>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    className="w-20 h-7 rounded-md text-[13px] font-semibold px-2 outline-none"
                    style={{ border: "1.5px solid #16A34A", background: "white" }}
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Reason for change (optional)..."
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full text-[11px] border border-gray-200 rounded-md px-2 py-1.5 resize-none outline-none bg-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="text-[11px] font-bold text-white rounded-md px-2.5 py-1 transition-colors"
                    style={{ background: "#16A34A" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-[11px] font-semibold text-gray-500 hover:bg-gray-100 rounded-md px-2.5 py-1 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <p className="text-[13px] font-semibold text-gray-900">GHS {effectiveAmount.toFixed(2)}</p>
                {isDouble && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>×2</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="min-w-[90px]">
            <p className="text-[10px] text-gray-400 mb-0.5">Land / farmer</p>
            <p className="text-[13px] font-semibold text-gray-900">{interest.landSizePerFarmer} ac</p>
          </div>
        )}

        {/* Total */}
        {!editing && (
          <div className="min-w-[90px]">
            <p className="text-[10px] text-gray-400 mb-0.5">{isCash ? "Total amount" : "Total land"}</p>
            <p className="text-[13px] font-semibold text-gray-900">
              {isCash
                ? `GHS ${(effectiveAmount * farmers).toFixed(2)}`
                : `${((interest.landSizePerFarmer ?? 0) * farmers).toFixed(1)} ac`}
            </p>
          </div>
        )}
      </div>

      {/* Double amount toggle — Cash only, selected, not editing */}
      {isCash && selected && !editing && (
        <div
          className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2.5 cursor-pointer rounded-lg"
          onClick={(e) => { e.stopPropagation(); onToggleDouble?.(); }}
        >
          <div
            className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
            style={{
              borderColor: isDouble ? "#16A34A" : "#D1D5DB",
              background:  isDouble ? "#16A34A" : "transparent",
            }}
          >
            {isDouble && (
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-gray-900">Double amount opted</p>
            <p className="text-[11px] text-gray-400">Farmer receives ×2 and commits to 2 bags at recovery</p>
          </div>
          {isDouble && (
            <span
              className="text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-full"
              style={{ background: "#DCFCE7", color: "#16A34A" }}
            >
              Active
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cash additional fields — qty reflects double opt when active
// ---------------------------------------------------------------------------
function CashQtyFields({
  farmers,
  qtyPerFarmer,
  setQtyPerFarmer,
  isDouble = false,
}: {
  farmers: number;
  qtyPerFarmer: number;
  setQtyPerFarmer: (v: number) => void;
  isDouble?: boolean;
}) {
  const effectiveQtyPerFarmer = isDouble ? qtyPerFarmer * 2 : qtyPerFarmer;
  const totalQty              = effectiveQtyPerFarmer * farmers;

  return (
    <div className="rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Additional Details — Cash</p>
        {isDouble && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#DCFCE7", color: "#16A34A" }}
          >
            ×2 — double bags at recovery
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[11px] text-gray-400 mb-1 block">Expected qty per farmer (KG)</Label>
          <Input
            type="number"
            value={qtyPerFarmer}
            onChange={(e) => setQtyPerFarmer(Number(e.target.value))}
            className="h-9 text-[13px] font-bold"
          />
          {isDouble && (
            <p className="text-[10px] text-gray-400 mt-1">
              Effective: <span className="font-bold text-gray-700">{effectiveQtyPerFarmer} KG/farmer</span>
            </p>
          )}
        </div>
        <div>
          <Label className="text-[11px] text-gray-400 mb-1 block">Expected total qty</Label>
          <div className="h-9 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200 text-[13px] font-bold">
            {totalQty} KG
          </div>
          {isDouble && (
            <p className="text-[10px] text-gray-400 mt-1">
              <span className="text-gray-500">{qtyPerFarmer * farmers} KG</span> × 2 doubled
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ploughing additional fields — land size + service + payment
// ---------------------------------------------------------------------------
function PloughingApprovalFields({
  farmers,
  landPerFarmer,
  setLandPerFarmer,
  provider,
  setProvider,
  payment,
  setPayment,
}: {
  farmers: number;
  landPerFarmer: number;
  setLandPerFarmer: (v: number) => void;
  provider: string;
  setProvider: (v: string) => void;
  payment: string;
  setPayment: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 space-y-4">
      <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Additional Details — Ploughing</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[11px] text-gray-400 mb-1 block">Land per farmer (acres)</Label>
          <Input type="number" step="0.1" value={landPerFarmer} onChange={(e) => setLandPerFarmer(Number(e.target.value))} className="h-9 text-[13px] font-bold" />
        </div>
        <div>
          <Label className="text-[11px] text-gray-400 mb-1 block">Total land size</Label>
          <div className="h-9 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200 text-[13px] font-bold">{(landPerFarmer * farmers).toFixed(2)} ac</div>
        </div>
        <div>
          <Label className="text-[11px] text-gray-400 mb-1 block">Service provider</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FieldTech Ghana">FieldTech Ghana</SelectItem>
              <SelectItem value="AgriMech Ltd">AgriMech Ltd</SelectItem>
              <SelectItem value="GreenField Services">GreenField Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-gray-400 mb-1 block">Payment arrangement</Label>
          <Select value={payment} onValueChange={setPayment}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Full payment">Full payment</SelectItem>
              <SelectItem value="50% upfront">50% upfront</SelectItem>
              <SelectItem value="30% upfront">30% upfront</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ApprovalModal
// ---------------------------------------------------------------------------
export default function ApprovalModal({
  card,
  onClose,
  onApproved,
  onHeld,
  onRejected,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onApproved: (id: string, type: SupportType, amountPerFarmer?: number, landSizePerFarmer?: number) => void;
  onHeld: (id: string, comment: string) => void;
  onRejected: (id: string, comment: string) => void;
}) {
  const primaryInterest    = card.supportInterests.find((si) => si.rank === "Primary")!;
  const [selectedType, setSelectedType] = useState<SupportType>(primaryInterest.type);

  const selectedCashInterest   = card.supportInterests.find((si) => si.type === "Cash");
  const selectedPloughInterest = card.supportInterests.find((si) => si.type === "Ploughing");
  const [cashAmount,   setCashAmount]   = useState(selectedCashInterest?.amountPerFarmer ?? 100);
  const [cashDouble,   setCashDouble]   = useState(card.wantsDouble ?? false);
  const [cashQty,      setCashQty]      = useState(50);
  const [ploughLand,   setPloughLand]   = useState(selectedPloughInterest?.landSizePerFarmer ?? 1.5);
  const [provider,     setProvider]     = useState("FieldTech Ghana");
  const [payment,      setPayment]      = useState("Full payment");

  type Decision = "approve" | "hold" | "reject";
  const [decision,         setDecision]         = useState<Decision>("approve");
  const [approveConfirmed, setApproveConfirmed] = useState(false);
  const [holdComment,      setHoldComment]      = useState(card.holdComment || "");
  const [rejectComment,    setRejectComment]    = useState("");

  const effectiveCashAmount = cashDouble ? cashAmount * 2 : cashAmount;

  function handleConfirm() {
    if (decision === "approve") {
      if (selectedType === "Cash") {
        onApproved(card.id, "Cash", effectiveCashAmount, undefined);
      } else {
        onApproved(card.id, "Ploughing", undefined, ploughLand);
      }
    } else if (decision === "hold") {
      onHeld(card.id, holdComment);
    } else {
      onRejected(card.id, rejectComment);
    }
  }

  const canConfirm =
    decision === "approve" ? approveConfirmed :
    decision === "hold"    ? holdComment.trim().length > 0 :
    rejectComment.trim().length > 0;

  const confirmLabel =
    decision === "approve" ? "Approve Request" :
    decision === "hold"    ? "Confirm Hold"    :
    "Confirm Rejection";

  const confirmStyle: React.CSSProperties =
    decision === "approve" ? { background: canConfirm ? "#16A34A" : "#D1D5DB", color: "white" } :
    decision === "hold"    ? { background: canConfirm ? "#D97706" : "#D1D5DB", color: "white" } :
    { background: canConfirm ? "#DC2626" : "#D1D5DB", color: "white" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: "min(960px, 95vw)", maxHeight: "92vh", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">Review Application</h2>
            <p className="text-[12px] font-medium text-gray-400 mt-0.5">
              Review the group details and select an approval decision
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

        {/* Body: two columns */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">

          {/* Mobile context strip */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div>
              <p className="text-[13px] font-bold text-gray-900">{card.groupName}</p>
              <p className="text-[11px] text-gray-500">{card.community} · {card.farmers} farmers</p>
            </div>
            {card.score !== null && (
              <span className="text-[13px] font-bold px-2.5 py-0.5 rounded-full shrink-0" style={{ background: "#DCFCE7", color: "#16A34A" }}>
                {card.score}%
              </span>
            )}
          </div>

          {/* Left: group context (hidden on mobile) */}
          <GroupContextPanel card={card} />

          {/* Right: action area (scrollable) */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Support option cards */}
              <section>
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Support Requests</p>
                <div className="space-y-3">
                  {card.supportInterests.map((si) => (
                    <SupportOptionCard
                      key={si.rank}
                      interest={si}
                      farmers={card.farmers}
                      selected={selectedType === si.type}
                      onSelect={() => setSelectedType(si.type)}
                      editableAmount={si.type === "Cash" ? cashAmount : (si.landSizePerFarmer ?? 0)}
                      onAmountSave={(amount) => {
                        if (si.type === "Cash") setCashAmount(amount);
                        else setPloughLand(amount);
                      }}
                      isDouble={si.type === "Cash" ? cashDouble : false}
                      onToggleDouble={si.type === "Cash" ? () => setCashDouble(!cashDouble) : undefined}
                    />
                  ))}
                </div>
              </section>

              {/* Additional detail fields for the selected type */}
              {selectedType === "Cash" && selectedCashInterest && (
                <CashQtyFields
                  farmers={card.farmers}
                  qtyPerFarmer={cashQty}
                  setQtyPerFarmer={setCashQty}
                  isDouble={cashDouble}
                />
              )}
              {selectedType === "Ploughing" && selectedPloughInterest && (
                <PloughingApprovalFields
                  farmers={card.farmers}
                  landPerFarmer={ploughLand}
                  setLandPerFarmer={setPloughLand}
                  provider={provider}
                  setProvider={setProvider}
                  payment={payment}
                  setPayment={setPayment}
                />
              )}

              <div className="h-px bg-gray-100" />

              {/* Decision section */}
              <section>
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Decision</p>

                {/* Segmented control */}
                <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4">
                  {(["approve", "hold", "reject"] as Decision[]).map((d) => {
                    const isActive = decision === d;
                    const label = d === "approve" ? "Approve" : d === "hold" ? "Put on Hold" : "Reject";
                    const activeStyle: React.CSSProperties =
                      d === "approve" ? { background: "#F0FDF4", color: "#16A34A" } :
                      d === "hold"    ? { background: "#FFFBEB", color: "#D97706" } :
                      { background: "#FEF2F2", color: "#DC2626" };
                    return (
                      <button
                        key={d}
                        onClick={() => setDecision(d)}
                        className="flex-1 py-2.5 text-[13px] font-semibold transition-colors border-r last:border-r-0 border-gray-200"
                        style={isActive ? activeStyle : { background: "transparent", color: "#9CA3AF" }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {decision === "approve" && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50">
                    <Checkbox
                      id="confirm-approve"
                      checked={approveConfirmed}
                      onCheckedChange={(v) => setApproveConfirmed(Boolean(v))}
                      className="mt-0.5 data-[state=checked]:bg-[#16A34A] data-[state=checked]:border-[#16A34A]"
                    />
                    <Label htmlFor="confirm-approve" className="text-[12px] text-gray-500 leading-relaxed cursor-pointer">
                      I have reviewed and confirm this approval.
                    </Label>
                  </div>
                )}
                {decision === "hold" && (
                  <Textarea
                    placeholder="Add a reason for placing this on hold..."
                    value={holdComment}
                    onChange={(e) => setHoldComment(e.target.value)}
                    className="text-[13px] min-h-[80px] resize-none"
                  />
                )}
                {decision === "reject" && (
                  <Textarea
                    placeholder="You must provide a reason for rejection..."
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    className="text-[13px] min-h-[80px] resize-none"
                  />
                )}
              </section>
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
                style={{ ...confirmStyle, cursor: canConfirm ? "pointer" : "not-allowed" }}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
