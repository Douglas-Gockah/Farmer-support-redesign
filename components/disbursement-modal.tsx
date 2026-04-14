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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FarmerRequest } from "@/components/kanban/types";
import { initials, avatarColor } from "@/components/kanban/helpers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type ChargeType = "none" | "flat" | "percentage";
type DisburseStep = "verify" | "confirm" | "processing" | "success";

const AMOUNT_PER_FARMER = 120;
const FLAT_CHARGE = 20;
const PERCENTAGE_RATE = 0.01;
const TRANSPORT_ALLOWANCE = 50;

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateTxId() {
  return "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ---------------------------------------------------------------------------
// Left panel — disbursement context (used in Verify + Confirm steps)
// ---------------------------------------------------------------------------
function DisbursementContextPanel({ card }: { card: FarmerRequest }) {
  const agentInitials = initials(card.agent);
  const agentColor    = avatarColor(card.agent);
  const isCash = card.approvedSupportType === "Cash";
  const totalAmount = (card.approvedAmountPerFarmer ?? AMOUNT_PER_FARMER) * card.farmers;
  const submittedMomo = card.momoNumber ?? "055 000 0000";
  const submittedName = card.momoName ?? card.groupName;

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

      {/* Approved support */}
      {card.approvedSupportType && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Approved Support</p>
          <div className="rounded-xl p-3 space-y-1.5" style={{ background: "var(--green-25)", border: "1.5px solid var(--green-200)" }}>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold"
              style={isCash ? { background: "var(--green-100)", color: "var(--green-600)" } : { background: "#FFF7ED", color: "#C2410C" }}
            >
              {card.approvedSupportType}
            </span>
            <p className="text-[13px] font-bold text-gray-900">{formatGHS(totalAmount)}</p>
            <p className="text-[11px] text-gray-500">
              {formatGHS(card.approvedAmountPerFarmer ?? AMOUNT_PER_FARMER)} / farmer
            </p>
          </div>
        </div>
      )}

      {/* MoMo account */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">MoMo Account</p>
        <div className="rounded-xl border border-gray-200 p-3 space-y-2">
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">Number</p>
            <p className="text-[14px] font-bold font-mono text-gray-900">{submittedMomo}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">Name</p>
            <p className="text-[13px] font-semibold text-gray-800">{submittedName}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
          <p className="text-[10px] text-gray-400 mb-0.5">Farmers</p>
          <p className="text-[20px] font-bold text-gray-900">{card.farmers}</p>
        </div>
        {card.score !== null && (
          <div className="flex-1 rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
            <p className="text-[10px] text-gray-400 mb-0.5">Score</p>
            <p className="text-[20px] font-bold" style={{ color: "var(--green-600)" }}>{card.score}%</p>
          </div>
        )}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 1 — Account Verification (two-panel)
// ---------------------------------------------------------------------------
function VerifyStep({
  card,
  onProceed,
  onClose,
}: {
  card: FarmerRequest;
  onProceed: () => void;
  onClose: () => void;
}) {
  const submittedMomo = card.momoNumber ?? "055 000 0000";
  const submittedName = card.momoName ?? card.groupName;
  const resolvedName  = submittedName;
  const hasMismatch   = false;

  const [checking,       setChecking]      = useState(false);
  const [verified,       setVerified]      = useState(false);
  const [showMismatch,   setShowMismatch]  = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newMomo,        setNewMomo]       = useState(submittedMomo);
  const [updateReason,   setUpdateReason]  = useState("");

  function handleCheck() {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      if (hasMismatch) { setShowMismatch(true); } else { setVerified(true); }
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: "min(900px, 95vw)", maxHeight: "92vh", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">Verify Account Details</h2>
            <p className="text-[12px] font-medium text-gray-400 mt-0.5">
              Confirm the MoMo account before disbursing funds
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
            <span className="text-[12px] font-mono font-bold text-gray-700 shrink-0">{card.momoNumber ?? "—"}</span>
          </div>

          <DisbursementContextPanel card={card} />

          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Submitted MoMo */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Submitted Account</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-gray-400">MoMo Number</p>
                    <p className="text-[15px] font-bold font-mono mt-0.5">{submittedMomo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400">Submitted Name</p>
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
                  ) : verified ? "Wallet verified" : "Check wallet name"}
                </Button>
              </div>

              {/* Verified result */}
              {verified && !hasMismatch && (
                <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--green-25)", border: "1px solid var(--green-200)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-[var(--green-600)] flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p className="text-[13px] font-semibold text-[var(--green-600)]">Account verified</p>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-400">Account name</span>
                    <span className="font-bold text-gray-900">{resolvedName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-400">MoMo number</span>
                    <span className="font-semibold font-mono">{submittedMomo}</span>
                  </div>
                </div>
              )}

              {/* Mismatch warning */}
              {showMismatch && (
                <div className="rounded-xl border border-yellow-300 p-4 space-y-3" style={{ background: "var(--yellow-50)" }}>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L14.5 13H1.5L8 2Z" stroke="var(--yellow-600)" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 6v3M8 11v.5" stroke="var(--yellow-600)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <p className="text-[13px] font-semibold text-amber-700">Name mismatch detected</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white border border-yellow-200 px-3 py-2">
                      <p className="text-[10px] text-gray-400 mb-0.5">Submitted</p>
                      <p className="text-[13px] font-semibold">{submittedName}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-yellow-200 px-3 py-2">
                      <p className="text-[10px] text-gray-400 mb-0.5">Resolved</p>
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
                        <Label className="text-[11px] text-gray-400 mb-1 block">New MoMo number</Label>
                        <Input value={newMomo} onChange={(e) => setNewMomo(e.target.value)} className="h-9 text-[13px] font-mono" />
                      </div>
                      <div>
                        <Label className="text-[11px] text-gray-400 mb-1 block">Reason for update</Label>
                        <Textarea placeholder="Explain the discrepancy..." value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} className="text-[13px] min-h-[60px] resize-none" />
                      </div>
                      <Button size="sm" className="bg-[var(--yellow-600)] hover:bg-[#B45309] text-white text-[12px]"
                        disabled={!updateReason.trim()}
                        onClick={() => { setShowUpdateForm(false); setVerified(true); setShowMismatch(false); }}>
                        Save update
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
              <Button
                className="w-full bg-[var(--green-600)] hover:bg-[var(--green-700)] text-white h-10 text-[14px] font-bold"
                disabled={!verified}
                onClick={onProceed}
              >
                Proceed to disbursement
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 2 — Confirm Disbursement (two-panel)
// ---------------------------------------------------------------------------
function ConfirmStep({
  card,
  onDisburse,
  onClose,
}: {
  card: FarmerRequest;
  onDisburse: () => void;
  onClose: () => void;
}) {
  const totalAmount = (card.approvedAmountPerFarmer ?? AMOUNT_PER_FARMER) * card.farmers;
  const [chargeType,   setChargeType]   = useState<ChargeType>("none");
  const [addTransport, setAddTransport] = useState(false);

  const withdrawalCharge =
    chargeType === "flat"       ? FLAT_CHARGE
    : chargeType === "percentage" ? Math.round(totalAmount * PERCENTAGE_RATE * 100) / 100
    : 0;
  const transportCharge = addTransport ? TRANSPORT_ALLOWANCE : 0;
  const grandTotal = totalAmount + withdrawalCharge + transportCharge;

  const withdrawalOptions: { id: ChargeType; label: string; sublabel: string; value: number }[] = [
    { id: "none",       label: "No withdrawal charge", sublabel: "No additional charges applied", value: 0 },
    { id: "flat",       label: "Flat charge",          sublabel: "Fixed amount of GHS 20.00",     value: FLAT_CHARGE },
    { id: "percentage", label: "Percentage charge",    sublabel: "1% of transaction amount",      value: Math.round(totalAmount * PERCENTAGE_RATE * 100) / 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: "min(900px, 95vw)", maxHeight: "92vh", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">Confirm Disbursement</h2>
            <p className="text-[12px] font-medium text-gray-400 mt-0.5">
              Please review the payment information before proceeding
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
            <span className="text-[12px] font-mono font-bold text-gray-700 shrink-0">{card.momoNumber ?? "—"}</span>
          </div>

          <DisbursementContextPanel card={card} />

          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* MTN MoMo Balance */}
              <div className="rounded-xl border p-4" style={{ background: "var(--yellow-50)", borderColor: "var(--yellow-300)" }}>
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
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {[
                  { label: "Recipient",     value: card.groupName },
                  { label: "MoMo number",   value: card.momoNumber ?? "055 000 0000" },
                  { label: "Account name",  value: card.momoName ?? card.groupName },
                ].map((row, i, arr) => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                    <span className="text-[13px] text-gray-400">{row.label}</span>
                    <span className="text-[13px] font-semibold text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-gray-400 font-medium">Amount</span>
                <span className="text-[15px] font-bold text-gray-900">{formatGHS(totalAmount)}</span>
              </div>

              {/* Charge Selection */}
              <div className="space-y-4">
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Charge Selection</p>

                {/* Withdrawal charge — pick exactly one */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 mb-2">Withdrawal charge</p>
                  <RadioGroup value={chargeType} onValueChange={(v) => setChargeType(v as ChargeType)}>
                    <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                      {withdrawalOptions.map((c) => (
                        <label
                          key={c.id}
                          htmlFor={`charge-${c.id}`}
                          className="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors"
                          style={{ background: chargeType === c.id ? "var(--green-25)" : "transparent" }}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem
                              value={c.id}
                              id={`charge-${c.id}`}
                              className="border-[var(--green-600)] data-[state=checked]:bg-[var(--green-600)] data-[state=checked]:text-white shrink-0"
                            />
                            <div>
                              <p className="text-[13px] font-semibold text-gray-900">{c.label}</p>
                              <p className="text-[11px] font-medium" style={{ color: "var(--green-600)" }}>{c.sublabel}</p>
                            </div>
                          </div>
                          <span className="text-[13px] font-bold text-gray-900 shrink-0">
                            {c.value > 0 ? formatGHS(c.value) : "—"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Transportation allowance — independent add-on */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 mb-2">Additional charges</p>
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-colors"
                    style={{
                      borderColor: addTransport ? "var(--green-600)" : "var(--gray-200)",
                      background:  addTransport ? "var(--green-25)" : "transparent",
                    }}
                    onClick={() => setAddTransport(!addTransport)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
                        style={{
                          borderColor: addTransport ? "var(--green-600)" : "var(--gray-300)",
                          background:  addTransport ? "var(--green-600)" : "transparent",
                        }}
                      >
                        {addTransport && (
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">Transportation allowance</p>
                        <p className="text-[11px] font-medium" style={{ color: "var(--green-600)" }}>Fixed allowance of GHS 50.00 — added on top of withdrawal charge</p>
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-gray-900 shrink-0">{formatGHS(TRANSPORT_ALLOWANCE)}</span>
                  </div>
                </div>
              </div>

              {/* Fees + Tax */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[13px] text-gray-400">
                  <span>Withdrawal charge</span><span>{formatGHS(withdrawalCharge)}</span>
                </div>
                {addTransport && (
                  <div className="flex justify-between text-[13px] text-gray-400">
                    <span>Transportation allowance</span><span>{formatGHS(TRANSPORT_ALLOWANCE)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[13px] text-gray-400">
                  <span>Tax</span><span>GHS 0.00</span>
                </div>
              </div>

              {/* Total */}
              <div>
                <div className="h-[2px] bg-gray-900 rounded-full mb-3" />
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-gray-400">You will be charged</span>
                  <span className="text-[20px] font-bold text-gray-900">{formatGHS(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
              <Button onClick={onDisburse} className="w-full bg-[var(--green-600)] hover:bg-[var(--green-700)] text-white h-11 text-[14px] font-bold">
                Disburse funds
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 3 — Processing (narrow, unchanged)
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
          <div className="w-16 h-16 rounded-full border-4 border-gray-200" style={{ borderTopColor: "var(--green-600)", animation: "spin 0.9s linear infinite" }} />
          <div>
            <h2 className="text-[18px] font-bold text-gray-900">Processing disbursement</h2>
            <p className="text-[13px] text-gray-400 mt-1">Your transaction is currently being processed.</p>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-400">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span className="font-semibold text-gray-900 tabular-nums">{seconds}s</span>
          </div>
          <button onClick={onSuccess} className="text-[12px] text-gray-400 underline hover:text-gray-700 transition-colors mt-2">
            Simulate success →
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// STEP 4 — Success (narrow, unchanged)
// ---------------------------------------------------------------------------
function SuccessStep({ open, card, txId, amount, onClose }: { open: boolean; card: FarmerRequest; txId: string; amount: number; onClose: () => void }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[400px] p-0">
        <div className="flex flex-col items-center px-8 py-10 text-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[var(--green-100)] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M7 17l6 6 12-12" stroke="var(--green-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-[20px] font-bold text-[var(--green-600)]">Disbursement successful</h2>
          <div className="w-full rounded-xl p-5 space-y-3 text-left" style={{ background: "var(--green-25)" }}>
            {[
              { label: "Amount paid",  value: formatGHS(amount) },
              { label: "Recipient",    value: card.groupName },
              { label: "Date & time",  value: `${dateStr} · ${timeStr}` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-[13px] text-gray-400">{row.label}</span>
                <span className="text-[13px] font-semibold text-gray-900">{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-[13px] text-gray-400">Transaction ID</span>
              <span className="text-[13px] font-semibold text-[var(--green-600)]">{txId}</span>
            </div>
          </div>
          <Button onClick={onClose} className="w-full bg-[var(--green-600)] hover:bg-[var(--green-700)] text-white h-11 text-[14px] font-bold">
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

  if (step === "verify") {
    return <VerifyStep card={card} onProceed={() => setStep("confirm")} onClose={onClose} />;
  }
  if (step === "confirm") {
    return <ConfirmStep card={card} onDisburse={() => setStep("processing")} onClose={onClose} />;
  }
  return (
    <>
      <ProcessingStep open={step === "processing"} onSuccess={() => setStep("success")} />
      <SuccessStep    open={step === "success"}    card={card} txId={txId} amount={amount} onClose={handleDisbursed} />
    </>
  );
}
