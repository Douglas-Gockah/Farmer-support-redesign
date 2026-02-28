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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FarmerRequest } from "@/components/slide-over-panel";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type ChargeType = "none" | "flat" | "percentage";
type DisburseStep = "verify" | "confirm" | "processing" | "success";

const AMOUNT_PER_FARMER = 120;
const FLAT_CHARGE = 20;
const PERCENTAGE_RATE = 0.01;

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateTxId() {
  return "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ---------------------------------------------------------------------------
// STEP 1 — Account Verification
// ---------------------------------------------------------------------------
function VerifyStep({
  card,
  open,
  onProceed,
  onClose,
}: {
  card: FarmerRequest;
  open: boolean;
  onProceed: () => void;
  onClose: () => void;
}) {
  const submittedMomo = card.momoNumber ?? "055 000 0000";
  const submittedName = card.momoName ?? card.groupName;

  // Simulated resolved name (slightly different to show mismatch scenario)
  const resolvedName = submittedName;
  const hasMismatch = false; // set to true to demo mismatch flow

  const [checking, setChecking]       = useState(false);
  const [verified, setVerified]       = useState(false);
  const [showMismatch, setShowMismatch] = useState(false);

  // Mismatch update form
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newMomo, setNewMomo]               = useState(submittedMomo);
  const [updateReason, setUpdateReason]     = useState("");

  function handleCheck() {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      if (hasMismatch) {
        setShowMismatch(true);
      } else {
        setVerified(true);
      }
    }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[520px] p-0 flex flex-col" style={{ maxHeight: "85vh" }}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-[17px] font-bold">Verify Account Details</DialogTitle>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Confirm the MoMo account before disbursing funds to {card.groupName}.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Submitted MoMo */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Submitted Account</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">MoMo Number</p>
                <p className="text-[15px] font-bold font-mono mt-0.5">{submittedMomo}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">Submitted Name</p>
                <p className="text-[13px] font-semibold mt-0.5">{submittedName}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-9 text-[13px] font-semibold"
              disabled={checking || verified}
              onClick={handleCheck}
            >
              {checking ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Checking wallet name...
                </span>
              ) : verified ? (
                "Wallet verified"
              ) : (
                "Check wallet name"
              )}
            </Button>
          </div>

          {/* Verified result card */}
          {verified && !hasMismatch && (
            <div className="rounded-xl border border-green-200 p-4 space-y-2" style={{ background: "#F0FDF4" }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="text-[13px] font-semibold text-[#16A34A]">Account verified</p>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Account name</span>
                <span className="font-bold text-foreground">{resolvedName}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">MoMo number</span>
                <span className="font-semibold font-mono">{submittedMomo}</span>
              </div>
            </div>
          )}

          {/* Mismatch warning */}
          {showMismatch && (
            <div className="rounded-xl border border-yellow-300 p-4 space-y-3" style={{ background: "#FFFBEB" }}>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L14.5 13H1.5L8 2Z" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 6v3M8 11v.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <p className="text-[13px] font-semibold text-amber-700">Name mismatch detected</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white border border-yellow-200 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Submitted</p>
                  <p className="text-[13px] font-semibold">{submittedName}</p>
                </div>
                <div className="rounded-lg bg-white border border-yellow-200 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Resolved</p>
                  <p className="text-[13px] font-semibold">Different Name</p>
                </div>
              </div>
              {!showUpdateForm ? (
                <Button variant="outline" size="sm" className="text-[12px] border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => setShowUpdateForm(true)}>
                  Update account details
                </Button>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">New MoMo number</Label>
                    <Input value={newMomo} onChange={(e) => setNewMomo(e.target.value)} className="h-9 text-[13px] font-mono" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">Reason for update</Label>
                    <Textarea placeholder="Explain the discrepancy..." value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} className="text-[13px] min-h-[60px] resize-none" />
                  </div>
                  <Button size="sm" className="bg-[#D97706] hover:bg-[#B45309] text-white text-[12px]"
                    disabled={!updateReason.trim()}
                    onClick={() => { setShowUpdateForm(false); setVerified(true); setShowMismatch(false); }}>
                    Save update
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0">
          <Button
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white h-10 text-[14px] font-bold"
            disabled={!verified}
            onClick={onProceed}
          >
            Proceed to disbursement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// STEP 2 — Confirm Disbursement
// ---------------------------------------------------------------------------
function ConfirmStep({
  card,
  open,
  onDisburse,
  onClose,
}: {
  card: FarmerRequest;
  open: boolean;
  onDisburse: () => void;
  onClose: () => void;
}) {
  const totalAmount = (card.approvedAmountPerFarmer ?? AMOUNT_PER_FARMER) * card.farmers;
  const [chargeType, setChargeType] = useState<ChargeType>("none");

  const chargeAmount =
    chargeType === "flat"       ? FLAT_CHARGE
    : chargeType === "percentage" ? Math.round(totalAmount * PERCENTAGE_RATE * 100) / 100
    : 0;
  const grandTotal = totalAmount + chargeAmount;

  const charges: { id: ChargeType; label: string; sublabel: string; value: number }[] = [
    { id: "none",       label: "No withdrawal charge", sublabel: "No additional charges applied", value: 0 },
    { id: "flat",       label: "Flat charge",           sublabel: "Fixed amount of GHS 20.00",    value: FLAT_CHARGE },
    { id: "percentage", label: "Percentage charge",     sublabel: "1% of transaction amount",     value: Math.round(totalAmount * PERCENTAGE_RATE * 100) / 100 },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[540px] max-h-[90vh] overflow-y-auto p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-[17px] font-bold">Confirm disbursement details</DialogTitle>
          <p className="text-[13px] text-muted-foreground mt-0.5">Please review the payment information before proceeding</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* MTN MoMo Balance */}
          <div className="rounded-xl border p-4" style={{ background: "#FEFCE8", borderColor: "#FDE047" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-yellow-700 font-medium">Current balance</p>
                <p className="text-[18px] font-bold text-yellow-900">GHS 112,245,534.00</p>
                <p className="text-[11px] text-yellow-600">Last updated: 09:40:44 AM</p>
              </div>
              <button className="text-yellow-600 hover:text-yellow-800 text-[18px] mt-1">↻</button>
            </div>
          </div>

          {/* Info rows */}
          <div className="rounded-xl border border-border overflow-hidden">
            {[
              { label: "Recipient",    value: card.groupName },
              { label: "MoMo number", value: card.momoNumber ?? "055 000 0000" },
              { label: "Account name", value: card.momoName ?? card.groupName },
            ].map((row, i, arr) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span className="text-[13px] text-muted-foreground">{row.label}</span>
                <span className="text-[13px] font-semibold text-foreground">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between py-2">
            <span className="text-[13px] text-muted-foreground font-medium">Amount</span>
            <span className="text-[15px] font-bold text-foreground">{formatGHS(totalAmount)}</span>
          </div>

          {/* Charge Selection */}
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Charge Selection</p>
            <RadioGroup value={chargeType} onValueChange={(v) => setChargeType(v as ChargeType)} className="space-y-2">
              {charges.map((c) => (
                <label key={c.id} htmlFor={`charge-${c.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors"
                  style={{ borderColor: chargeType === c.id ? "#16A34A" : "var(--border)", background: chargeType === c.id ? "#F0FDF4" : "transparent" }}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={c.id} id={`charge-${c.id}`} className="border-[#16A34A] data-[state=checked]:bg-[#16A34A] data-[state=checked]:text-white" />
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{c.label}</p>
                      <p className="text-[11px] font-medium text-[#16A34A]">{c.sublabel}</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-foreground">{formatGHS(c.value)}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Fees + Tax */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>Fees</span><span>{formatGHS(chargeAmount)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>Tax</span><span>GHS 0.00</span>
            </div>
          </div>

          {/* Total */}
          <div>
            <div className="h-[2px] bg-foreground rounded-full mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">You will be charged</span>
              <span className="text-[20px] font-bold text-foreground">{formatGHS(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border">
          <Button onClick={onDisburse} className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white h-11 text-[14px] font-bold">
            Disburse funds
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// STEP 3 — Processing
// ---------------------------------------------------------------------------
function ProcessingStep({ open, onSuccess }: { open: boolean; onSuccess: () => void }) {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  useEffect(() => {
    if (seconds <= 0) onSuccess();
  }, [seconds, onSuccess]);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-[360px] p-0" showCloseButton={false}>
        <div className="flex flex-col items-center justify-center px-8 py-12 text-center gap-5">
          <div className="w-16 h-16 rounded-full border-4 border-muted" style={{ borderTopColor: "#16A34A", animation: "spin 0.9s linear infinite" }} />
          <div>
            <h2 className="text-[18px] font-bold text-foreground">Processing disbursement</h2>
            <p className="text-[13px] text-muted-foreground mt-1">Your transaction is currently being processed.</p>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span className="font-semibold text-foreground tabular-nums">{seconds}s</span>
          </div>
          <button onClick={onSuccess} className="text-[12px] text-muted-foreground underline hover:text-foreground transition-colors mt-2">
            Simulate success →
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// STEP 4 — Success
// ---------------------------------------------------------------------------
function SuccessStep({ open, card, txId, amount, onClose }: { open: boolean; card: FarmerRequest; txId: string; amount: number; onClose: () => void }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[400px] p-0">
        <div className="flex flex-col items-center px-8 py-10 text-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M7 17l6 6 12-12" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-[20px] font-bold text-[#16A34A]">Disbursement successful</h2>
          <div className="w-full rounded-xl p-5 space-y-3 text-left" style={{ background: "#F0FDF4" }}>
            {[
              { label: "Amount paid",  value: formatGHS(amount) },
              { label: "Recipient",    value: card.groupName },
              { label: "Date & time",  value: `${dateStr} · ${timeStr}` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-[13px] text-muted-foreground">{row.label}</span>
                <span className="text-[13px] font-semibold text-foreground">{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-[13px] text-muted-foreground">Transaction ID</span>
              <span className="text-[13px] font-semibold text-[#16A34A]">{txId}</span>
            </div>
          </div>
          <Button onClick={onClose} className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white h-11 text-[14px] font-bold">
            Okay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Exported: DisbursementModal
// ---------------------------------------------------------------------------
export default function DisbursementModal({
  card,
  onClose,
  onDisbursed,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onDisbursed: (id: string, txId: string, amount: number) => void;
}) {
  const [step, setStep] = useState<DisburseStep>("verify");
  const [txId]  = useState(generateTxId);
  const amount  = (card.approvedAmountPerFarmer ?? AMOUNT_PER_FARMER) * card.farmers;

  function handleDisbursed() {
    onDisbursed(card.id, txId, amount);
    onClose();
  }

  return (
    <>
      <VerifyStep  card={card} open={step === "verify"}     onProceed={() => setStep("confirm")}    onClose={onClose} />
      <ConfirmStep card={card} open={step === "confirm"}    onDisburse={() => setStep("processing")} onClose={onClose} />
      <ProcessingStep           open={step === "processing"} onSuccess={() => setStep("success")} />
      <SuccessStep card={card} open={step === "success"}    txId={txId} amount={amount} onClose={handleDisbursed} />
    </>
  );
}
