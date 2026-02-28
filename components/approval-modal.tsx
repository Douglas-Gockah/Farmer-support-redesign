"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { FarmerRequest } from "@/components/slide-over-panel";

// ---------------------------------------------------------------------------
// Toast (inline)
// ---------------------------------------------------------------------------
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-zinc-900 text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-xl"
      style={{ animation: "fadeUp 200ms ease-out" }}
    >
      <span className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {message}
      <style>{`@keyframes fadeUp { from { opacity:0; transform: translate(-50%, 8px); } to { opacity:1; transform: translate(-50%, 0); } }`}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cash Support Modal
// ---------------------------------------------------------------------------
function CashModal({
  card,
  open,
  onClose,
  onApprove,
}: {
  card: FarmerRequest;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
}) {
  const AMOUNT_PER_FARMER = 120;
  const [amountEditing, setAmountEditing] = useState(false);
  const [amountPerFarmer, setAmountPerFarmer] = useState(AMOUNT_PER_FARMER);
  const [qtyPerFarmer, setQtyPerFarmer] = useState(50);
  const [confirmed, setConfirmed] = useState(false);

  const totalAmount = amountPerFarmer * card.farmers;
  const totalQty = qtyPerFarmer * card.farmers;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[540px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="6" r="3" stroke="#16A34A" strokeWidth="1.5"/>
                <circle cx="13" cy="6" r="3" stroke="#16A34A" strokeWidth="1.5"/>
                <path d="M1 17c0-3.5 2.5-5.5 6-5.5m6 0c3.5 0 6 2 6 5.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <DialogTitle className="text-[15px] font-bold">{card.groupName}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-muted-foreground">Cash support</span>
                <Badge variant="outline" className="text-[10px] border-0 px-2 py-0.5" style={{ background: "#FEF3C7", color: "#D97706" }}>
                  Pending
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: "Farmers",          value: String(card.farmers) },
            { label: "Amount / Farmer",  value: `GHS ${amountPerFarmer.toFixed(2)}` },
            { label: "Total Amount",     value: `GHS ${totalAmount.toFixed(2)}` },
          ].map((item) => (
            <div key={item.label} className="bg-muted/50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[18px] font-bold text-foreground">{item.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {/* MoMo row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "MoMo Number", value: "0244-XXX-XXX" },
            { label: "MoMo Name",   value: card.agent },
          ].map((item) => (
            <div key={item.label} className="bg-muted/50 rounded-xl px-3 py-2.5">
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <p className="text-[13px] font-semibold text-foreground mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        <Separator className="mb-4" />

        <p className="text-[13px] font-bold text-foreground mb-3">Approve request</p>

        {/* Details box */}
        <div className="border border-border rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground mb-1">Amount per farmer</p>
              <div className="flex items-center gap-1">
                <span className="text-[12px] text-muted-foreground font-medium">GHS</span>
                {amountEditing ? (
                  <Input
                    type="number"
                    className="w-20 h-8 text-[13px] font-bold"
                    value={amountPerFarmer}
                    onChange={(e) => setAmountPerFarmer(Number(e.target.value))}
                    autoFocus
                  />
                ) : (
                  <span className="text-[15px] font-bold text-foreground">{amountPerFarmer.toFixed(2)}</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground mb-1">Total amount</p>
              <p className="text-[15px] font-bold text-foreground">GHS {totalAmount.toFixed(2)}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-[12px] font-semibold text-[#16A34A] hover:text-[#15803D] shrink-0 px-2" onClick={() => setAmountEditing(!amountEditing)}>
              {amountEditing ? "Done" : "Edit"}
            </Button>
          </div>
        </div>

        {/* Expected quantity row */}
        <div className="flex items-end gap-4 mb-5">
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground mb-1">Expected quantity per farmer</p>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                className="w-20 h-8 text-[13px] font-bold"
                value={qtyPerFarmer}
                onChange={(e) => setQtyPerFarmer(Number(e.target.value))}
              />
              <span className="text-[12px] text-muted-foreground">KG</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground mb-1">Expected total quantity</p>
            <p className="text-[14px] font-bold text-foreground">{totalQty} KG</p>
          </div>
        </div>

        {/* Confirmation */}
        <div className="flex items-start gap-2.5 mb-5 p-3 rounded-xl bg-muted/50">
          <Checkbox
            id="confirm-cash"
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(Boolean(v))}
            className="mt-0.5 data-[state=checked]:bg-[#16A34A] data-[state=checked]:border-[#16A34A]"
          />
          <Label htmlFor="confirm-cash" className="text-[12px] text-muted-foreground leading-relaxed cursor-pointer">
            I have reviewed the details of this request and confirm my decision to proceed with approval.
          </Label>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10" onClick={onClose}>
            Reject
          </Button>
          <Button
            disabled={!confirmed}
            onClick={onApprove}
            className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white"
          >
            Approve request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Ploughing Support Modal
// ---------------------------------------------------------------------------
function PloughingModal({
  card,
  open,
  onClose,
  onApprove,
}: {
  card: FarmerRequest;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
}) {
  const [landPerFarmer, setLandPerFarmer] = useState(1.5);
  const [amountPerFarmer, setAmountPerFarmer] = useState(200);
  const [provider, setProvider] = useState("FieldTech Ghana");
  const [payment, setPayment] = useState("Full payment");
  const [confirmed, setConfirmed] = useState(false);

  const totalLand = (landPerFarmer * card.farmers).toFixed(2);
  const totalAmount = amountPerFarmer * card.farmers;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[540px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="6" r="3" stroke="#16A34A" strokeWidth="1.5"/>
                <circle cx="13" cy="6" r="3" stroke="#16A34A" strokeWidth="1.5"/>
                <path d="M1 17c0-3.5 2.5-5.5 6-5.5m6 0c3.5 0 6 2 6 5.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <DialogTitle className="text-[15px] font-bold">{card.groupName}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-muted-foreground">Ploughing support</span>
                <Badge variant="outline" className="text-[10px] border-0 px-2 py-0.5" style={{ background: "#DCFCE7", color: "#16A34A" }}>Full payment</Badge>
                <Badge variant="outline" className="text-[10px] border-0 px-2 py-0.5" style={{ background: "#FEF3C7", color: "#D97706" }}>Pending</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Farmers",     value: String(card.farmers) },
            { label: "Land / Farmer", value: `${landPerFarmer.toFixed(2)} ac` },
            { label: "Total Land",  value: `${totalLand} ac` },
          ].map((item) => (
            <div key={item.label} className="bg-muted/50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[18px] font-bold text-foreground">{item.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        <Separator className="mb-4" />
        <p className="text-[13px] font-bold text-foreground mb-3">Approve request</p>

        {/* Details box */}
        <div className="border border-border rounded-lg p-3 mb-3 space-y-3">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground mb-1">Land size per farmer</p>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  step="0.1"
                  className="w-20 h-8 text-[13px] font-bold"
                  value={landPerFarmer}
                  onChange={(e) => setLandPerFarmer(Number(e.target.value))}
                />
                <span className="text-[12px] text-muted-foreground">acres</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground mb-1">Total land size</p>
              <p className="text-[14px] font-bold text-foreground">{totalLand} acres</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground mb-1">Amount per farmer</p>
              <div className="flex items-center gap-1">
                <span className="text-[12px] text-muted-foreground font-medium">GHS</span>
                <Input
                  type="number"
                  className="w-20 h-8 text-[13px] font-bold"
                  value={amountPerFarmer}
                  onChange={(e) => setAmountPerFarmer(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground mb-1">Total amount</p>
              <p className="text-[14px] font-bold text-foreground">GHS {totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <p className="text-[11px] text-muted-foreground mb-1">Assign service provider</p>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FieldTech Ghana">FieldTech Ghana</SelectItem>
                <SelectItem value="AgriMech Ltd">AgriMech Ltd</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-1">Payment arrangement</p>
            <Select value={payment} onValueChange={setPayment}>
              <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Full payment">Full payment</SelectItem>
                <SelectItem value="50% upfront">50% upfront</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Confirmation */}
        <div className="flex items-start gap-2.5 mb-5 p-3 rounded-xl bg-muted/50">
          <Checkbox
            id="confirm-plough"
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(Boolean(v))}
            className="mt-0.5 data-[state=checked]:bg-[#16A34A] data-[state=checked]:border-[#16A34A]"
          />
          <Label htmlFor="confirm-plough" className="text-[12px] text-muted-foreground leading-relaxed cursor-pointer">
            I have reviewed the details of this request and confirm my decision to proceed with approval.
          </Label>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10" onClick={onClose}>
            Reject
          </Button>
          <Button
            disabled={!confirmed}
            onClick={onApprove}
            className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white"
          >
            Approve request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------
export default function ApprovalModal({
  card,
  onClose,
  onApprove,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onApprove: (id: string) => void;
}) {
  const [showToast, setShowToast] = useState(false);

  function handleApprove() {
    onApprove(card.id);
    setShowToast(true);
  }

  return (
    <>
      {card.supportType === "Cash" ? (
        <CashModal card={card} open onClose={onClose} onApprove={handleApprove} />
      ) : (
        <PloughingModal card={card} open onClose={onClose} onApprove={handleApprove} />
      )}
      {showToast && (
        <Toast message={`${card.groupName} approved successfully`} onDone={() => { setShowToast(false); onClose(); }} />
      )}
    </>
  );
}
