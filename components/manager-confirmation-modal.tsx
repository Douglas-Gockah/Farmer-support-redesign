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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { FarmerRequest } from "@/components/slide-over-panel";

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

  const [step, setStep]         = useState<1 | 2>(1);
  const [farmers, setFarmers]   = useState<FarmerRow[]>(farmerList);
  const [momoNumber, setMomoNumber] = useState("");
  const [momoName,   setMomoName]   = useState("");

  const selectedCount = farmers.filter((f) => f.selected).length;

  function toggleFarmer(idx: number) {
    setFarmers((prev) => prev.map((f, i) => i === idx ? { ...f, selected: !f.selected } : f));
  }

  function handleConfirm() {
    onConfirmed(card.id, momoNumber.trim(), momoName.trim());
  }

  const canAdvance  = selectedCount > 0;
  const canConfirm  = momoNumber.trim().length > 0 && momoName.trim().length > 0;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="p-0 gap-0 flex flex-col"
        style={{ maxWidth: 520, maxHeight: "88vh", overflow: "hidden" }}
      >
        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: Farmer Selection                                            */}
        {/* ------------------------------------------------------------------ */}
        {step === 1 && (
          <>
            <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
              <div className="flex items-start justify-between">
                <DialogTitle className="text-[18px] font-bold leading-snug">Interested farmers</DialogTitle>
              </div>
            </DialogHeader>

            {/* Group info row */}
            <div className="px-6 py-4 border-b border-border shrink-0 flex items-center gap-3">
              {/* Group icon */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#DCFCE7" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="9" cy="7" r="3" stroke="#16A34A" strokeWidth="1.6"/>
                  <path d="M3 20c0-3.314 2.686-6 6-6h0c3.314 0 6 2.686 6 6" stroke="#16A34A" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="17" cy="8" r="2.5" stroke="#16A34A" strokeWidth="1.4"/>
                  <path d="M21 20c0-2.761-1.79-5-4-5" stroke="#16A34A" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900 leading-snug">{card.groupName}</p>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  {card.community}
                  <span className="mx-1 text-gray-300">|</span>
                  <span className="font-medium text-gray-600">{totalFarmers} interested farmers</span>
                </p>
              </div>
            </div>

            {/* Farmer list */}
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
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
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
                  <span className="font-semibold text-gray-600">{selectedCount}</span> of {totalFarmers} farmers selected
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between gap-3">
              <span className="text-[13px] font-semibold text-gray-600">{selectedCount} farmers selected</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onClose} className="h-9 text-[13px]">Cancel</Button>
                <Button
                  disabled={!canAdvance}
                  onClick={() => setStep(2)}
                  className="h-9 text-[13px] font-bold"
                  style={{ background: canAdvance ? "#16A34A" : undefined }}
                >
                  Confirm selection
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 2: Payment Details                                             */}
        {/* ------------------------------------------------------------------ */}
        {step === 2 && (
          <>
            <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-[18px] font-bold leading-snug">Payment details</DialogTitle>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    Enter the MoMo account details for this group's disbursement
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Confirmation summary card */}
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

              {/* Form fields */}
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
            <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(1)} className="h-9 text-[13px]">Back</Button>
              <Button
                disabled={!canConfirm}
                onClick={handleConfirm}
                className="h-9 px-5 text-[13px] font-bold"
                style={{ background: canConfirm ? "#16A34A" : undefined }}
              >
                Confirm &amp; submit
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
