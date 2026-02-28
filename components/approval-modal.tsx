"use client";

import { useState, useEffect } from "react";
import type { FarmerRequest } from "@/components/slide-over-panel";

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-gray-900 text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-xl"
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
  onClose,
  onApprove,
}: {
  card: FarmerRequest;
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[540px] max-h-[90vh] overflow-y-auto"
        style={{ padding: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[18px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="6" r="3" stroke="#16A34A" strokeWidth="1.5"/>
                <circle cx="13" cy="6" r="3" stroke="#16A34A" strokeWidth="1.5"/>
                <path d="M1 17c0-3.5 2.5-5.5 6-5.5m6 0c3.5 0 6 2 6 5.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">{card.groupName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-gray-400">Cash support</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>
                  Pending
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 text-[18px] leading-none transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: "Farmers", value: String(card.farmers) },
            { label: "Amount / Farmer", value: `GHS ${amountPerFarmer.toFixed(2)}` },
            { label: "Total Amount", value: `GHS ${totalAmount.toFixed(2)}` },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[18px] font-bold text-gray-900">{item.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {/* MoMo row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "MoMo Number", value: "0244-XXX-XXX" },
            { label: "MoMo Name", value: card.agent },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-[11px] text-gray-400">{item.label}</p>
              <p className="text-[13px] font-semibold text-gray-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        <hr className="border-gray-100 mb-4" />

        {/* Approve request section */}
        <p className="text-[13px] font-bold text-gray-800 mb-3">Approve request</p>

        {/* Details box */}
        <div className="border border-gray-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between gap-4">
            {/* Amount per farmer */}
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1">Amount per farmer</p>
              <div className="flex items-center gap-1">
                <span className="text-[12px] text-gray-500 font-medium">GHS</span>
                {amountEditing ? (
                  <input
                    type="number"
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-[13px] font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-400"
                    value={amountPerFarmer}
                    onChange={(e) => setAmountPerFarmer(Number(e.target.value))}
                    autoFocus
                  />
                ) : (
                  <span className="text-[15px] font-bold text-gray-900">{amountPerFarmer.toFixed(2)}</span>
                )}
              </div>
            </div>
            {/* Total amount */}
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1">Total amount</p>
              <p className="text-[15px] font-bold text-gray-900">GHS {totalAmount.toFixed(2)}</p>
            </div>
            {/* Edit link */}
            <button
              className="text-[12px] font-semibold shrink-0"
              style={{ color: "#16A34A" }}
              onClick={() => setAmountEditing(!amountEditing)}
            >
              {amountEditing ? "Done" : "Edit"}
            </button>
          </div>
        </div>

        {/* Expected quantity row */}
        <div className="flex items-end gap-4 mb-5">
          <div className="flex-1">
            <p className="text-[11px] text-gray-400 mb-1">Expected quantity per farmer</p>
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-[13px] font-bold text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-400"
                value={qtyPerFarmer}
                onChange={(e) => setQtyPerFarmer(Number(e.target.value))}
              />
              <span className="text-[12px] text-gray-400">KG</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-gray-400 mb-1">Expected total quantity</p>
            <p className="text-[14px] font-bold text-gray-900">{totalQty} KG</p>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer mb-5 p-3 rounded-xl bg-gray-50">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 accent-[#16A34A] w-4 h-4 shrink-0"
          />
          <span className="text-[12px] text-gray-600 leading-relaxed">
            I have reviewed the details of this request and confirm my decision to proceed with approval.
          </span>
        </label>

        {/* CTAs */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 text-[13px] font-semibold transition-colors"
            style={{ borderColor: "#EF4444", color: "#EF4444" }}
          >
            Reject
          </button>
          <button
            disabled={!confirmed}
            onClick={onApprove}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
            style={{
              background: confirmed ? "#16A34A" : "#E5E7EB",
              color: confirmed ? "#fff" : "#9CA3AF",
              cursor: confirmed ? "pointer" : "not-allowed",
            }}
          >
            Approve request
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ploughing Support Modal
// ---------------------------------------------------------------------------
function PloughingModal({
  card,
  onClose,
  onApprove,
}: {
  card: FarmerRequest;
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[540px] max-h-[90vh] overflow-y-auto"
        style={{ padding: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="6" r="3" stroke="#16A34A" strokeWidth="1.5"/>
                <circle cx="13" cy="6" r="3" stroke="#16A34A" strokeWidth="1.5"/>
                <path d="M1 17c0-3.5 2.5-5.5 6-5.5m6 0c3.5 0 6 2 6 5.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">{card.groupName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-gray-400">Ploughing support</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>
                  Full payment
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>
                  Pending
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 text-[18px] leading-none transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Farmers", value: String(card.farmers) },
            { label: "Land / Farmer", value: `${landPerFarmer.toFixed(2)} ac` },
            { label: "Total Land", value: `${totalLand} ac` },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[18px] font-bold text-gray-900">{item.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        <hr className="border-gray-100 mb-4" />

        <p className="text-[13px] font-bold text-gray-800 mb-3">Approve request</p>

        {/* Details box */}
        <div className="border border-gray-200 rounded-lg p-3 mb-3 space-y-3">
          {/* Land size */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1">Land size per farmer</p>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-[13px] font-bold text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-400"
                  value={landPerFarmer}
                  onChange={(e) => setLandPerFarmer(Number(e.target.value))}
                />
                <span className="text-[12px] text-gray-400">acres</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1">Total land size</p>
              <p className="text-[14px] font-bold text-gray-900">{totalLand} acres</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Amount */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1">Amount per farmer</p>
              <div className="flex items-center gap-1">
                <span className="text-[12px] text-gray-500 font-medium">GHS</span>
                <input
                  type="number"
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-[13px] font-bold text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-400"
                  value={amountPerFarmer}
                  onChange={(e) => setAmountPerFarmer(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1">Total amount</p>
              <p className="text-[14px] font-bold text-gray-900">GHS {totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <p className="text-[11px] text-gray-400 mb-1">Assign service provider</p>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-400"
            >
              <option>FieldTech Ghana</option>
              <option>AgriMech Ltd</option>
            </select>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-1">Payment arrangement</p>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-400"
            >
              <option>Full payment</option>
              <option>50% upfront</option>
            </select>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer mb-5 p-3 rounded-xl bg-gray-50">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 accent-[#16A34A] w-4 h-4 shrink-0"
          />
          <span className="text-[12px] text-gray-600 leading-relaxed">
            I have reviewed the details of this request and confirm my decision to proceed with approval.
          </span>
        </label>

        {/* CTAs */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 text-[13px] font-semibold transition-colors"
            style={{ borderColor: "#EF4444", color: "#EF4444" }}
          >
            Reject
          </button>
          <button
            disabled={!confirmed}
            onClick={onApprove}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
            style={{
              background: confirmed ? "#16A34A" : "#E5E7EB",
              color: confirmed ? "#fff" : "#9CA3AF",
              cursor: confirmed ? "pointer" : "not-allowed",
            }}
          >
            Approve request
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public export: ApprovalModal (picks Cash or Ploughing based on card type)
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
        <CashModal card={card} onClose={onClose} onApprove={handleApprove} />
      ) : (
        <PloughingModal card={card} onClose={onClose} onApprove={handleApprove} />
      )}
      {showToast && (
        <Toast
          message={`${card.groupName} approved successfully`}
          onDone={() => { setShowToast(false); onClose(); }}
        />
      )}
    </>
  );
}
