"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { FarmerRequest } from "@/components/kanban/types";
import { initials, avatarColor } from "@/components/kanban/helpers";

// ---------------------------------------------------------------------------
// Mock farmer list
// ---------------------------------------------------------------------------
const MOCK_FARMER_NAMES = [
  "Rabi Alhassan", "Sana Korawuni", "Azuma Atta", "Doapok Tidow",
  "Kusohuba Duku", "Mercy Bakanyin", "Shetu Affuro", "Yetama Akuta",
  "Musobil Gotteng", "Afia Sandow", "Kuyawli Kolbila", "Sugri Yidana",
  "Asibi Sandow", "Asibi Yalpak", "Awabla Bugri", "Duni Tichanni",
];

const AVATAR_BG = ["#94A3B8", "#F43F5E", "#F59E0B", "#14B8A6", "#6366F1", "#84CC16", "#EC4899", "#0EA5E9"];

function farmerInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function farmerId(index: number) {
  return `04-03-122-${String(index + 1).padStart(2, "0")}-000`;
}

interface FarmerRow {
  name: string;
  id: string;
  avatarBg: string;
  selected: boolean;
}

// ---------------------------------------------------------------------------
// Left panel — approved support context
// ---------------------------------------------------------------------------
function ApprovedContextPanel({ card }: { card: FarmerRequest }) {
  const agentInitials = initials(card.agent);
  const agentColor    = avatarColor(card.agent);
  const isCash = card.approvedSupportType === "Cash";

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

      {/* Approved support type */}
      {card.approvedSupportType && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Approved Support</p>
          <div className="rounded-xl p-3 space-y-2" style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold"
              style={isCash ? { background: "#DCFCE7", color: "#16A34A" } : { background: "#FFF7ED", color: "#C2410C" }}
            >
              {isCash ? (
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              ) : (
                <svg width="12" height="11" viewBox="0 0 16 14" fill="none">
                  <rect x="1" y="7" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3 7V5a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              )}
              {card.approvedSupportType}
            </span>
            {isCash && card.approvedAmountPerFarmer != null && (
              <>
                <p className="text-[12px] text-gray-600">
                  GHS {card.approvedAmountPerFarmer.toFixed(2)}<span className="text-gray-400"> / farmer</span>
                </p>
                <p className="text-[13px] font-bold text-gray-900">
                  GHS {(card.approvedAmountPerFarmer * card.farmers).toLocaleString()} total
                </p>
              </>
            )}
            {!isCash && card.approvedLandSizePerFarmer != null && (
              <>
                <p className="text-[12px] text-gray-600">
                  {card.approvedLandSizePerFarmer} ac<span className="text-gray-400"> / farmer</span>
                </p>
                <p className="text-[13px] font-bold text-gray-900">
                  {(card.approvedLandSizePerFarmer * card.farmers).toFixed(1)} ac total
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3" style={{ background: "#F9FAFB" }}>
          <p className="text-[10px] text-gray-400 mb-0.5">Interested farmers</p>
          <p className="text-[20px] font-bold text-gray-900">{card.farmers}</p>
        </div>
        {card.score !== null && (
          <div className="flex-1 rounded-xl p-3" style={{ background: "#F9FAFB" }}>
            <p className="text-[10px] text-gray-400 mb-0.5">Score</p>
            <p className="text-[20px] font-bold" style={{ color: "#16A34A" }}>{card.score}%</p>
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
// ManagerConfirmationModal
// ---------------------------------------------------------------------------
export default function ManagerConfirmationModal({
  card,
  onClose,
  onConfirmed,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onConfirmed: (id: string, momoNumber: string, momoName: string) => void;
}) {
  const totalFarmers = card.farmers;
  const farmerList: FarmerRow[] = MOCK_FARMER_NAMES.slice(0, totalFarmers).map((name, i) => ({
    name,
    id: farmerId(i),
    avatarBg: AVATAR_BG[i % AVATAR_BG.length],
    selected: true,
  }));

  const [step, setStep]             = useState<1 | 2>(1);
  const [farmers, setFarmers]       = useState<FarmerRow[]>(farmerList);
  const [momoNumber, setMomoNumber] = useState("");
  const [momoName,   setMomoName]   = useState("");

  const selectedCount = farmers.filter((f) => f.selected).length;

  function toggleFarmer(idx: number) {
    setFarmers((prev) => prev.map((f, i) => i === idx ? { ...f, selected: !f.selected } : f));
  }

  function handleConfirm() {
    onConfirmed(card.id, momoNumber.trim(), momoName.trim());
  }

  const canAdvance = selectedCount > 0;
  const canConfirm = momoNumber.trim().length > 0 && momoName.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: "min(900px, 95vw)", maxHeight: "92vh", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">
              {step === 1 ? "Confirm Interested Farmers" : "Payment Details"}
            </h2>
            <p className="text-[12px] font-medium text-gray-400 mt-0.5">
              {step === 1
                ? "Select the farmers who will receive support for this group"
                : "Enter the MoMo account details for this group's disbursement"}
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
            {card.approvedSupportType && (
              <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full shrink-0" style={{ background: "#DCFCE7", color: "#16A34A" }}>
                {card.approvedSupportType}
              </span>
            )}
          </div>

          {/* Left panel (hidden on mobile) */}
          <ApprovedContextPanel card={card} />

          {/* Right panel */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">

            {/* ── STEP 1: Farmer Selection ── */}
            {step === 1 && (
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-2 divide-y divide-gray-100">
                    {farmers.map((farmer, idx) => (
                      <div
                        key={farmer.id}
                        className="flex items-center gap-3 py-3 cursor-pointer"
                        style={{ opacity: farmer.selected ? 1 : 0.6 }}
                        onClick={() => toggleFarmer(idx)}
                      >
                        <Checkbox
                          checked={farmer.selected}
                          onCheckedChange={() => toggleFarmer(idx)}
                          className="shrink-0 data-[state=checked]:bg-[#16A34A] data-[state=checked]:border-[#16A34A]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                          style={{ background: farmer.avatarBg }}
                        >
                          {farmerInitials(farmer.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-gray-900 leading-snug">{farmer.name}</p>
                          <p className="text-[12px] text-gray-400 font-mono">{farmer.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Selection summary */}
                  <div className="sticky bottom-0 px-6 py-2 bg-white border-t border-gray-100">
                    <p className="text-[12px] text-gray-400">
                      <span className="font-semibold text-gray-600">{selectedCount}</span> of {totalFarmers} interested farmers selected
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-gray-600">{selectedCount} interested farmers selected</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="h-9 px-4 rounded-lg border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!canAdvance}
                      onClick={() => setStep(2)}
                      className="h-9 px-5 rounded-lg text-[13px] font-bold text-white transition-colors"
                      style={{ background: canAdvance ? "#16A34A" : "#D1D5DB", cursor: canAdvance ? "pointer" : "not-allowed" }}
                    >
                      Confirm selection
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: Payment Details ── */}
            {step === 2 && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {/* Confirmation summary */}
                  <div
                    className="rounded-lg p-3 flex items-center gap-2"
                    style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" stroke="#16A34A" strokeWidth="1.5"/>
                      <path d="M5 8l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <p className="text-[13px] font-bold text-green-700">{selectedCount} farmers confirmed</p>
                      <p className="text-[12px] text-gray-500">{card.groupName}</p>
                    </div>
                  </div>

                  {/* MoMo fields */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">MoMo number</Label>
                      <Input
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        placeholder="e.g. 0551 234 567"
                        className="h-10 text-[13px]"
                      />
                    </div>
                    <div>
                      <Label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">MoMo name</Label>
                      <Input
                        value={momoName}
                        onChange={(e) => setMomoName(e.target.value)}
                        placeholder="Account name as registered"
                        className="h-10 text-[13px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="h-9 px-4 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                    className="h-9 px-6 rounded-lg text-[13px] font-bold text-white transition-colors"
                    style={{ background: canConfirm ? "#16A34A" : "#D1D5DB", cursor: canConfirm ? "pointer" : "not-allowed" }}
                  >
                    Confirm &amp; submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
