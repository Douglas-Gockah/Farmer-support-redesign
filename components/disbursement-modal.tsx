"use client";

import { useState, useEffect } from "react";
import type { FarmerRequest } from "@/components/slide-over-panel";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type ChargeType = "none" | "flat" | "percentage";
type DisburseStep = "confirm" | "processing" | "success";

const AMOUNT_PER_FARMER = 120; // GHS per farmer (mock)
const FLAT_CHARGE = 20;
const PERCENTAGE_RATE = 0.01;

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateTxId() {
  return "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ---------------------------------------------------------------------------
// Modal wrapper
// ---------------------------------------------------------------------------
function ModalWrapper({
  width,
  children,
  onClose,
}: {
  width: number;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.40)" }}
      >
        <div
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          style={{ width, maxWidth: "calc(100vw - 32px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// STATE 1 — Confirm
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
  const totalAmount = card.farmers * AMOUNT_PER_FARMER;
  const [chargeType, setChargeType] = useState<ChargeType>("none");

  const chargeAmount =
    chargeType === "flat"
      ? FLAT_CHARGE
      : chargeType === "percentage"
      ? Math.round(totalAmount * PERCENTAGE_RATE * 100) / 100
      : 0;

  const grandTotal = totalAmount + chargeAmount;

  const charges: { id: ChargeType; label: string; sublabel: string; value: () => number }[] = [
    {
      id: "none",
      label: "No withdrawal charge",
      sublabel: "No additional charges applied",
      value: () => 0,
    },
    {
      id: "flat",
      label: "Flat charge",
      sublabel: "Fixed amount of GHS 20.00",
      value: () => FLAT_CHARGE,
    },
    {
      id: "percentage",
      label: "Percentage charge",
      sublabel: "1% of transaction amount",
      value: () => Math.round(totalAmount * PERCENTAGE_RATE * 100) / 100,
    },
  ];

  return (
    <ModalWrapper width={540} onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-[17px] font-bold text-gray-900">Confirm disbursement details</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">Please review the payment information before proceeding</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 text-[18px] leading-none ml-4 shrink-0"
        >
          &times;
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* MTN MoMo Balance Card */}
        <div
          className="rounded-xl border p-4"
          style={{ background: "#FEFCE8", borderColor: "#FDE047" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-[11px] text-yellow-700 font-medium">Current balance</p>
                <p className="text-[18px] font-bold text-yellow-900">GHS 112,245,534.00</p>
                <p className="text-[11px] text-yellow-600">Last updated: 09:40:44 AM</p>
              </div>
            </div>
            <button className="text-yellow-600 hover:text-yellow-800 text-[18px] leading-none mt-1" title="Refresh">
              ↻
            </button>
          </div>
        </div>

        {/* Info rows */}
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          {[
            { label: "Recipient", value: card.groupName },
            { label: "MoMo number", value: "055 000 0000" },
            { label: "Type", value: "Farmer Support" },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid #F3F4F6" : "none" }}
            >
              <span className="text-[13px] text-gray-400">{row.label}</span>
              <span className="text-[13px] font-semibold text-gray-800">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between py-2">
          <span className="text-[13px] text-gray-500 font-medium">Amount</span>
          <span className="text-[15px] font-bold text-gray-900">{formatGHS(totalAmount)}</span>
        </div>

        {/* Charge selection */}
        <div>
          <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Charge Selection</p>
          <div className="space-y-2">
            {charges.map((c) => (
              <label
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors"
                style={{
                  borderColor: chargeType === c.id ? "#16A34A" : "#E5E7EB",
                  background: chargeType === c.id ? "#F0FDF4" : "#FAFAFA",
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="charge"
                    checked={chargeType === c.id}
                    onChange={() => setChargeType(c.id)}
                    className="accent-green-600 w-4 h-4"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">{c.label}</p>
                    <p className="text-[11px] font-medium" style={{ color: "#16A34A" }}>{c.sublabel}</p>
                  </div>
                </div>
                <span className="text-[13px] font-bold text-gray-700">{formatGHS(c.value())}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fees + Tax */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[13px] text-gray-500">
            <span>Fees</span>
            <span>{formatGHS(chargeAmount)}</span>
          </div>
          <div className="flex justify-between text-[13px] text-gray-500">
            <span>Tax</span>
            <span>GHS 0.00</span>
          </div>
        </div>

        {/* Divider + total */}
        <div>
          <div className="h-[2px] bg-gray-900 rounded-full mb-3" />
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-600">You will be charged</span>
            <span className="text-[20px] font-bold text-gray-900">{formatGHS(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-4 border-t border-gray-100">
        <button
          onClick={onDisbursе}
          className="w-full py-3 rounded-xl bg-[#16A34A] text-white text-[14px] font-bold hover:bg-[#15803D] transition-colors"
        >
          Disburse funds
        </button>
      </div>
    </ModalWrapper>
  );
}

// ---------------------------------------------------------------------------
// STATE 2 — Processing
// ---------------------------------------------------------------------------
function ProcessingStep({ onSuccess }: { onSuccess: () => void }) {
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
    <ModalWrapper width={360}>
      <div className="flex flex-col items-center justify-center px-8 py-12 text-center gap-5">
        {/* Spinner */}
        <div
          className="w-16 h-16 rounded-full border-4 border-gray-200"
          style={{
            borderTopColor: "#16A34A",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Processing disbursement</h2>
          <p className="text-[13px] text-gray-400 mt-1">Your transaction is currently being processed.</p>
        </div>
        {/* Countdown */}
        <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M8 5v3.5l2 1.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="font-semibold text-gray-700 tabular-nums">{seconds}s</span>
        </div>
        {/* Simulate success */}
        <button
          onClick={onSuccess}
          className="text-[12px] text-gray-400 underline hover:text-gray-600 transition-colors mt-2"
        >
          Simulate success →
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </ModalWrapper>
  );
}

// ---------------------------------------------------------------------------
// STATE 3 — Success
// ---------------------------------------------------------------------------
function SuccessStep({
  card,
  txId,
  onClose,
}: {
  card: FarmerRequest;
  txId: string;
  onClose: () => void;
}) {
  const totalAmount = card.farmers * AMOUNT_PER_FARMER;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });

  return (
    <ModalWrapper width={400}>
      <div className="flex flex-col items-center px-8 py-10 text-center gap-5">
        {/* Green check circle */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "#DCFCE7" }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M7 17l6 6 12-12" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="text-[20px] font-bold" style={{ color: "#16A34A" }}>
          Disbursement successful
        </h2>

        {/* Summary card */}
        <div className="w-full rounded-xl p-5 space-y-3 text-left" style={{ background: "#F0FDF4" }}>
          {[
            { label: "Amount paid", value: formatGHS(totalAmount) },
            { label: "Recipient", value: card.groupName },
            { label: "Date & time", value: `${dateStr} · ${timeStr}` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between">
              <span className="text-[13px] text-gray-500">{row.label}</span>
              <span className="text-[13px] font-semibold text-gray-800">{row.value}</span>
            </div>
          ))}
          {/* Transaction ID */}
          <div className="flex justify-between">
            <span className="text-[13px] text-gray-500">Transaction ID</span>
            <span className="text-[13px] font-semibold" style={{ color: "#16A34A" }}>{txId}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#16A34A] text-white text-[14px] font-bold hover:bg-[#15803D] transition-colors"
        >
          Okay
        </button>
      </div>
    </ModalWrapper>
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
  onDisbursed: (id: string) => void;
}) {
  const [step, setStep] = useState<DisburseStep>("confirm");
  const [txId] = useState(generateTxId);

  function handleDisbursed() {
    onDisbursed(card.id);
    onClose();
  }

  if (step === "confirm") {
    return (
      <ConfirmStep
        card={card}
        onDisburse={() => setStep("processing")}
        onClose={onClose}
      />
    );
  }

  if (step === "processing") {
    return <ProcessingStep onSuccess={() => setStep("success")} />;
  }

  return <SuccessStep card={card} txId={txId} onClose={handleDisbursed} />;
}
