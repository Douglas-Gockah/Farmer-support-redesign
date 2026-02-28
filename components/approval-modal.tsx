"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { FarmerRequest, SupportInterest, SupportType } from "@/components/slide-over-panel";

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
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Poor</span><span>Fair</span><span>Good</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SupportOptionCard — selectable card for each support interest
// ---------------------------------------------------------------------------
function SupportOptionCard({
  interest,
  farmers,
  selected,
  onSelect,
}: {
  interest: SupportInterest;
  farmers: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const isCash = interest.type === "Cash";

  return (
    <div
      className="relative rounded-xl border-2 p-4 cursor-pointer transition-all"
      style={{
        borderColor: selected ? "#16A34A" : "var(--border)",
        background: selected ? "#F0FDF4" : "var(--muted)/0.2",
        opacity: selected ? 1 : 0.6,
      }}
      onClick={onSelect}
    >
      {/* Rank pill + checkmark */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {interest.rank}
        </span>
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          style={{ borderColor: selected ? "#16A34A" : "var(--border)", background: selected ? "#16A34A" : "transparent" }}
        >
          {selected && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>

      {/* Type label */}
      <p className="text-[14px] font-bold text-foreground mb-3">
        {isCash ? "Cash Support" : "Ploughing Support"}
      </p>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div>
          <p className="text-[10px] text-muted-foreground">Farmers</p>
          <p className="text-[13px] font-semibold">{farmers}</p>
        </div>
        {isCash ? (
          <>
            <div>
              <p className="text-[10px] text-muted-foreground">Amount / farmer</p>
              <p className="text-[13px] font-semibold">GHS {interest.amountPerFarmer?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total amount</p>
              <p className="text-[13px] font-semibold">GHS {((interest.amountPerFarmer ?? 0) * farmers).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">MoMo number</p>
              <p className="text-[13px] font-semibold font-mono">{interest.momoNumber}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-muted-foreground">MoMo name</p>
              <p className="text-[13px] font-semibold">{interest.momoName}</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-[10px] text-muted-foreground">Land / farmer</p>
              <p className="text-[13px] font-semibold">{interest.landSizePerFarmer} ac</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total land</p>
              <p className="text-[13px] font-semibold">{((interest.landSizePerFarmer ?? 0) * farmers).toFixed(1)} ac</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cash approval detail fields
// ---------------------------------------------------------------------------
function CashApprovalFields({
  interest,
  farmers,
  amountPerFarmer,
  setAmountPerFarmer,
  qtyPerFarmer,
  setQtyPerFarmer,
}: {
  interest: SupportInterest;
  farmers: number;
  amountPerFarmer: number;
  setAmountPerFarmer: (v: number) => void;
  qtyPerFarmer: number;
  setQtyPerFarmer: (v: number) => void;
}) {
  const totalAmount = amountPerFarmer * farmers;
  const totalQty = qtyPerFarmer * farmers;
  return (
    <div className="rounded-xl border border-border p-4 space-y-4">
      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Approval Details — Cash</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Amount per farmer (GHS)</Label>
          <Input type="number" value={amountPerFarmer} onChange={(e) => setAmountPerFarmer(Number(e.target.value))} className="h-9 text-[13px] font-bold" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Total amount</Label>
          <div className="h-9 flex items-center px-3 rounded-md bg-muted text-[13px] font-bold">GHS {totalAmount.toFixed(2)}</div>
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Expected qty per farmer (KG)</Label>
          <Input type="number" value={qtyPerFarmer} onChange={(e) => setQtyPerFarmer(Number(e.target.value))} className="h-9 text-[13px] font-bold" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Expected total qty</Label>
          <div className="h-9 flex items-center px-3 rounded-md bg-muted text-[13px] font-bold">{totalQty} KG</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ploughing approval detail fields
// ---------------------------------------------------------------------------
function PloughingApprovalFields({
  farmers,
  landPerFarmer,
  setLandPerFarmer,
  amountPerFarmer,
  setAmountPerFarmer,
  provider,
  setProvider,
  payment,
  setPayment,
}: {
  farmers: number;
  landPerFarmer: number;
  setLandPerFarmer: (v: number) => void;
  amountPerFarmer: number;
  setAmountPerFarmer: (v: number) => void;
  provider: string;
  setProvider: (v: string) => void;
  payment: string;
  setPayment: (v: string) => void;
}) {
  const totalLand = (landPerFarmer * farmers).toFixed(2);
  const totalAmount = amountPerFarmer * farmers;
  return (
    <div className="rounded-xl border border-border p-4 space-y-4">
      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Approval Details — Ploughing</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Land per farmer (acres)</Label>
          <Input type="number" step="0.1" value={landPerFarmer} onChange={(e) => setLandPerFarmer(Number(e.target.value))} className="h-9 text-[13px] font-bold" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Total land size</Label>
          <div className="h-9 flex items-center px-3 rounded-md bg-muted text-[13px] font-bold">{totalLand} ac</div>
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Amount per farmer (GHS)</Label>
          <Input type="number" value={amountPerFarmer} onChange={(e) => setAmountPerFarmer(Number(e.target.value))} className="h-9 text-[13px] font-bold" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Total amount</Label>
          <div className="h-9 flex items-center px-3 rounded-md bg-muted text-[13px] font-bold">GHS {totalAmount.toFixed(2)}</div>
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Service provider</Label>
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
          <Label className="text-[11px] text-muted-foreground mb-1 block">Payment arrangement</Label>
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
  // Which support interest card is selected
  const primaryInterest   = card.supportInterests.find((si) => si.rank === "Primary")!;
  const secondaryInterest = card.supportInterests.find((si) => si.rank === "Secondary")!;
  const [selectedType, setSelectedType] = useState<SupportType>(primaryInterest.type);

  // Cash approval fields
  const selectedCashInterest = card.supportInterests.find((si) => si.type === "Cash");
  const [cashAmount,    setCashAmount]    = useState(selectedCashInterest?.amountPerFarmer ?? 100);
  const [cashQty,       setCashQty]       = useState(50);

  // Ploughing approval fields
  const selectedPloughInterest = card.supportInterests.find((si) => si.type === "Ploughing");
  const [ploughLand,    setPloughLand]    = useState(selectedPloughInterest?.landSizePerFarmer ?? 1.5);
  const [ploughAmount,  setPloughAmount]  = useState(200);
  const [provider,      setProvider]      = useState("FieldTech Ghana");
  const [payment,       setPayment]       = useState("Full payment");

  // Decision
  type Decision = "approve" | "hold" | "reject";
  const [decision, setDecision]           = useState<Decision>("approve");
  const [approveConfirmed, setApproveConfirmed] = useState(false);
  const [holdComment,  setHoldComment]    = useState(card.holdComment || "");
  const [rejectComment, setRejectComment] = useState("");

  const selectedInterest = card.supportInterests.find((si) => si.type === selectedType)!;

  function handleConfirm() {
    if (decision === "approve") {
      if (selectedType === "Cash") {
        onApproved(card.id, "Cash", cashAmount, undefined);
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
    decision === "approve" ? { background: "#16A34A", color: "white" } :
    decision === "hold"    ? { background: "transparent", border: "1.5px solid #D97706", color: "#D97706" } :
    { background: "transparent", border: "1.5px solid #DC2626", color: "#DC2626" };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="p-0 gap-0 flex flex-col" style={{ maxWidth: 600, maxHeight: "85vh", overflow: "hidden" }}>
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-[16px] font-bold leading-snug">{card.groupName}</DialogTitle>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {card.community}
                <span className="font-mono text-[10px] text-muted-foreground/50 ml-2">{card.id}</span>
              </p>
            </div>
            {card.score !== null && (
              <Badge variant="outline" className="text-[13px] font-bold px-3 py-1 rounded-full border-0 shrink-0"
                style={{ background: "#DCFCE7", color: "#16A34A" }}>
                {card.score}%
              </Badge>
            )}
          </div>
          {card.score !== null && (
            <div className="mt-3">
              <ScoreBar score={card.score} />
            </div>
          )}
          {card.onHold && card.holdComment && (
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
              <p className="text-[11px] font-semibold text-amber-700 mb-0.5">On hold — previous comment</p>
              <p className="text-[12px] text-amber-600">{card.holdComment}</p>
            </div>
          )}
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Support Request option cards */}
          <section>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Support Requests</p>
            <div className="space-y-3">
              {card.supportInterests.map((si) => (
                <SupportOptionCard
                  key={si.rank}
                  interest={si}
                  farmers={card.farmers}
                  selected={selectedType === si.type}
                  onSelect={() => setSelectedType(si.type)}
                />
              ))}
            </div>
          </section>

          {/* Approval detail fields for the selected type */}
          {selectedType === "Cash" && selectedCashInterest && (
            <CashApprovalFields
              interest={selectedCashInterest}
              farmers={card.farmers}
              amountPerFarmer={cashAmount}
              setAmountPerFarmer={setCashAmount}
              qtyPerFarmer={cashQty}
              setQtyPerFarmer={setCashQty}
            />
          )}
          {selectedType === "Ploughing" && selectedPloughInterest && (
            <PloughingApprovalFields
              farmers={card.farmers}
              landPerFarmer={ploughLand}
              setLandPerFarmer={setPloughLand}
              amountPerFarmer={ploughAmount}
              setAmountPerFarmer={setPloughAmount}
              provider={provider}
              setProvider={setProvider}
              payment={payment}
              setPayment={setPayment}
            />
          )}

          <Separator />

          {/* Decision section */}
          <section>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Decision</p>

            {/* Segmented control */}
            <div className="flex rounded-xl border border-border overflow-hidden mb-4">
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
                    className="flex-1 py-2.5 text-[13px] font-semibold transition-colors border-r last:border-r-0 border-border"
                    style={isActive ? activeStyle : { background: "transparent", color: "var(--muted-foreground)" }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Decision-specific inputs */}
            {decision === "approve" && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/50">
                <Checkbox
                  id="confirm-approve"
                  checked={approveConfirmed}
                  onCheckedChange={(v) => setApproveConfirmed(Boolean(v))}
                  className="mt-0.5 data-[state=checked]:bg-[#16A34A] data-[state=checked]:border-[#16A34A]"
                />
                <Label htmlFor="confirm-approve" className="text-[12px] text-muted-foreground leading-relaxed cursor-pointer">
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
        <div className="px-6 py-4 border-t border-border shrink-0">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button
              className="flex-1 font-semibold"
              disabled={!canConfirm}
              onClick={handleConfirm}
              style={canConfirm ? confirmStyle : {}}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
