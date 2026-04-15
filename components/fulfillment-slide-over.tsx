"use client";

import { useEffect, useState } from "react";
import type { FulfillmentRequest, FarmerFulfillmentRecord, FulfillmentDocument } from "@/components/kanban/types";
import { initials, avatarColor } from "@/components/kanban/helpers";
import { NativeVoiceNote } from "@/components/kanban/native-voice-note";

// ---------------------------------------------------------------------------
// Farmer row — received (with voice proof) or pending
// ---------------------------------------------------------------------------
function FarmerRow({
  farmer,
  amountPerFarmer,
}: {
  farmer: FarmerFulfillmentRecord;
  amountPerFarmer: number;
}) {
  const color = avatarColor(farmer.name);

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
          style={{ background: color }}
        >
          {initials(farmer.name)}
        </span>

        <div className="flex-1 min-w-0">
          {/* Name + amount */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[13px] font-semibold text-gray-800 truncate">
              {farmer.name}
            </span>
            <span className="text-[12px] font-bold text-gray-900 shrink-0">
              GHS {amountPerFarmer.toLocaleString()}
            </span>
          </div>

          {/* Voice proof (received only) — two recordings: farmer + witness */}
          {farmer.received && farmer.voiceRecordingDuration && (
            <div className="mt-2 space-y-2">
              <NativeVoiceNote title="Farmer" duration={farmer.voiceRecordingDuration} />
              {farmer.witnessRecordingDuration && (
                <NativeVoiceNote title="Witness" duration={farmer.witnessRecordingDuration} />
              )}
              {farmer.receivedDate && (
                <p className="text-[10px] text-gray-400 mt-0.5 pl-1">
                  Confirmed {farmer.receivedDate}
                </p>
              )}
            </div>
          )}

          {/* Pending indicator */}
          {!farmer.received && (
            <span className="text-[11px] text-gray-400 italic">
              Awaiting confirmation
            </span>
          )}
        </div>

        {/* Status icon */}
        {farmer.received ? (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "var(--green-100)" }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="var(--green-600)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "var(--gray-100)" }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="#9CA3AF" strokeWidth="1.2" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Document image lightbox
// ---------------------------------------------------------------------------
function DocLightbox({
  doc,
  startIndex,
  onClose,
}: {
  doc: FulfillmentDocument;
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const total = doc.images.length;

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, total - 1));
      if (e.key === "ArrowLeft")  setIdx((i) => Math.max(i - 1, 0));
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, total]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.80)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480, width: "100%" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <span className="text-white text-[13px] font-semibold">{doc.label}</span>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-[12px]">{idx + 1} / {total}</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Document placeholder — large */}
        <div
          className="w-full rounded-xl flex flex-col"
          style={{
            background: "#F9FAFB",
            border: "1px solid rgba(255,255,255,0.15)",
            aspectRatio: "3/4",
            padding: "32px 28px",
            gap: 8,
          }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 10,
                borderRadius: 3,
                background: i < 3 ? "var(--gray-400)" : i < 8 ? "var(--gray-300)" : "var(--gray-200)",
                width: i % 3 === 0 ? "90%" : i % 3 === 1 ? "75%" : "60%",
              }}
            />
          ))}
          <div style={{ marginTop: 16, height: 80, borderRadius: 8, background: "var(--gray-200)" }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`b${i}`}
              style={{
                height: 10,
                borderRadius: 3,
                background: "var(--gray-200)",
                width: i % 2 === 0 ? "80%" : "65%",
              }}
            />
          ))}
          <div
            style={{
              marginTop: "auto", alignSelf: "flex-end", fontSize: "0.6875rem",
              fontFamily: "monospace", color: "var(--gray-400)", fontWeight: 700,
            }}
          >
            Page {idx + 1}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIdx((i) => Math.max(i - 1, 0))}
            disabled={idx === 0}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
            style={{ background: "rgba(255,255,255,0.15)", opacity: idx === 0 ? 0.3 : 1 }}
            aria-label="Previous"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dot strip */}
          <div className="flex items-center gap-1.5">
            {doc.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 20 : 6,
                  height: 6,
                  background: i === idx ? "white" : "rgba(255,255,255,0.35)",
                }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setIdx((i) => Math.min(i + 1, total - 1))}
            disabled={idx === total - 1}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
            style={{ background: "rgba(255,255,255,0.15)", opacity: idx === total - 1 ? 0.3 : 1 }}
            aria-label="Next"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left info panel — group + disbursement summary
// ---------------------------------------------------------------------------
function InfoPanel({ req }: { req: FulfillmentRequest }) {
  const received = req.confirmedFarmers.filter((f) => f.received).length;
  const total = req.confirmedFarmers.length;
  const pct = total > 0 ? Math.round((received / total) * 100) : 0;
  const isFull = req.fulfillmentStage === "fully_fulfilled";
  const isPartial = req.fulfillmentStage === "partially_fulfilled";
  const agentColor = avatarColor(req.agent);
  const [lightbox, setLightbox] = useState<{ doc: FulfillmentDocument; idx: number } | null>(null);

  const stageLabel =
    isFull ? "Fully Fulfilled" :
    isPartial ? "Partially Fulfilled" :
    "Pending Fulfilment";

  const stageDot =
    isFull ? "var(--green-600)" :
    isPartial ? "var(--yellow-500)" :
    "#7C3AED";

  return (
    <div className="flex flex-col gap-4">
      {/* Stage badge */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: stageDot }}
        />
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: stageDot }}
        >
          {stageLabel}
        </span>
      </div>

      {/* Group info */}
      <div>
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
          Group
        </p>
        <p className="text-[14px] font-bold text-gray-900">{req.groupName}</p>
        <p className="text-[12px] text-gray-500 mt-0.5">{req.community}</p>
      </div>

      {/* Agent */}
      <div className="flex items-center gap-2">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ background: agentColor }}
        >
          {initials(req.agent)}
        </span>
        <div>
          <p className="text-[11px] text-gray-400">Field Agent</p>
          <p className="text-[12px] font-semibold text-gray-800">{req.agent}</p>
        </div>
      </div>

      {/* Progress (partially / fully fulfilled) */}
      {(isPartial || isFull) && (
        <div
          className="rounded-xl p-3"
          style={{ background: isFull ? "var(--green-25)" : "var(--yellow-50)", border: `1px solid ${isFull ? "var(--green-100)" : "var(--yellow-200)"}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold" style={{ color: isFull ? "var(--green-600)" : "var(--yellow-600)" }}>
              {received} / {total} received
            </span>
            <span className="text-[12px] font-bold" style={{ color: isFull ? "var(--green-600)" : "var(--yellow-600)" }}>
              {pct}%
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ background: isFull ? "var(--green-100)" : "var(--yellow-100)" }}>
            <div
              className="h-2 rounded-full"
              style={{ width: `${pct}%`, background: isFull ? "var(--green-600)" : "var(--yellow-500)" }}
            />
          </div>
        </div>
      )}

      {/* Disbursement summary */}
      <div>
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Disbursement
        </p>
        <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {[
            { label: "Transaction ID", value: req.transactionId, mono: true, green: true },
            { label: "Date",           value: req.disbursedDate },
            { label: "Total amount",   value: `GHS ${req.disbursedAmount.toLocaleString()}`, bold: true },
            { label: "Per farmer",     value: `GHS ${req.approvedAmountPerFarmer.toLocaleString()}` },
          ].map(({ label, value, mono, green, bold }) => (
            <div key={label} className="flex items-center justify-between px-3 py-2">
              <span className="text-[11px] text-gray-400">{label}</span>
              <span
                className={[
                  "text-[12px]",
                  mono ? "font-mono" : "",
                  bold ? "font-bold text-gray-900" : "font-medium text-gray-700",
                ].join(" ")}
                style={green ? { color: "var(--green-600)", fontWeight: 600 } : undefined}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MoMo */}
      <div>
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
          MoMo Account
        </p>
        <div
          className="rounded-xl px-3 py-2.5"
          style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }}
        >
          <p className="text-[13px] font-semibold font-mono text-gray-800">{req.momoNumber}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{req.momoName}</p>
        </div>
      </div>

      {/* Documents */}
      {req.documents && req.documents.length > 0 && (
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
            Documents
          </p>
          {req.documents.map((doc) => (
            <div key={doc.label} className="mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="1" width="10" height="14" rx="1.5" stroke="var(--gray-400)" strokeWidth="1.4" />
                  <path d="M5 5h6M5 8h6M5 11h4" stroke="var(--gray-400)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-600)" }}>{doc.label}</span>
                <span style={{ marginLeft: "auto", fontSize: "0.6875rem", color: "var(--gray-400)" }}>
                  {doc.images.length} image{doc.images.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {doc.images.map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setLightbox({ doc, idx })}
                    className="shrink-0 rounded-lg flex flex-col items-stretch overflow-hidden transition-all hover:shadow-md"
                    style={{
                      width: 68, height: 90,
                      background: "var(--gray-50)",
                      border: "1px solid var(--gray-200)",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    aria-label={`View ${doc.label} page ${idx + 1}`}
                  >
                    {/* Document lines */}
                    <div style={{ flex: 1, padding: "7px 6px", display: "flex", flexDirection: "column", gap: 3.5 }}>
                      {[80, 65, 75, 55, 70, 60].map((w, i) => (
                        <div
                          key={i}
                          style={{
                            height: 3.5, borderRadius: 2,
                            background: i < 2 ? "var(--gray-400)" : "var(--gray-300)",
                            width: `${w}%`,
                          }}
                        />
                      ))}
                    </div>
                    {/* Footer */}
                    <div
                      style={{
                        background: "var(--gray-100)",
                        borderTop: "1px solid var(--gray-200)",
                        padding: "2px 5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "0.5rem", fontFamily: "monospace", color: "var(--gray-400)", fontWeight: 700 }}>
                        {idx + 1}/{doc.images.length}
                      </span>
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                        <path d="M1 5V1h4M11 5V1H7M1 7v4h4M11 7v4H7" stroke="var(--gray-400)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <DocLightbox
          doc={lightbox.doc}
          startIndex={lightbox.idx}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right content panel — farmer list, segmented by receipt status
// ---------------------------------------------------------------------------
function FarmersPanel({ req }: { req: FulfillmentRequest }) {
  const received = req.confirmedFarmers.filter((f) => f.received);
  const pending = req.confirmedFarmers.filter((f) => !f.received);
  const optedOut = req.optedOutFarmers ?? [];
  const isFull = req.fulfillmentStage === "fully_fulfilled";
  const isPending = req.fulfillmentStage === "pending_fulfillment";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 shrink-0 border-b border-gray-100">
        <h3 className="text-[15px] font-bold text-gray-900">
          {isFull
            ? `All ${req.confirmedFarmers.length} Farmers Confirmed`
            : isPending
            ? `Confirmed Farmers (${req.confirmedFarmers.length})`
            : `Fulfilment Progress`}
        </h3>
        <p className="text-[12px] text-gray-400 mt-0.5">
          {isFull
            ? "Voice recordings collected as proof of receipt."
            : isPending
            ? "Funds have been disbursed. Awaiting farmer confirmations."
            : `${received.length} confirmed · ${pending.length} pending${optedOut.length > 0 ? ` · ${optedOut.length} opted out` : ""}`}
        </p>
      </div>

      {/* Scrollable farmer list */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* Received section */}
        {received.length > 0 && (
          <div className="mt-4">
            {!isPending && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--green-600)" }}
                />
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--green-700)" }}>
                  {isFull ? `All received (${received.length})` : `Received support (${received.length})`}
                </span>
              </div>
            )}
            <div>
              {received.map((f) => (
                <FarmerRow
                  key={f.id}
                  farmer={f}
                  amountPerFarmer={req.approvedAmountPerFarmer}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pending section */}
        {pending.length > 0 && (
          <div className="mt-4">
            {received.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#9CA3AF" }}
                />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Awaiting confirmation ({pending.length})
                </span>
              </div>
            )}
            <div>
              {pending.map((f) => (
                <FarmerRow
                  key={f.id}
                  farmer={f}
                  amountPerFarmer={req.approvedAmountPerFarmer}
                />
              ))}
            </div>
          </div>
        )}

        {/* Opted-out section */}
        {optedOut.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--yellow-500)" }}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--yellow-600)" }}>
                Opted out ({optedOut.length})
              </span>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--yellow-200)", background: "var(--yellow-50)" }}>
              {optedOut.map((f, idx) => {
                const color = avatarColor(f.name);
                return (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderTop: idx > 0 ? "1px solid var(--yellow-200)" : undefined }}
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ background: color }}
                    >
                      {initials(f.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{f.name}</p>
                      <p className="text-[11px] text-amber-600 font-mono">{f.id}</p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                      style={{ background: "var(--yellow-100)", color: "var(--yellow-600)" }}
                    >
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M5 3v2.5M5 7v.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      Opted out
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-8" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main — FulfillmentSlideOver
// ---------------------------------------------------------------------------
export default function FulfillmentSlideOver({
  req,
  onClose,
}: {
  req: FulfillmentRequest;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.50)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ maxWidth: 860, height: "min(88vh, 700px)" }}
        >
          {/* ── Header bar ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Support Fulfilment
              </p>
              <h2 className="text-[16px] font-bold text-gray-900 leading-snug">
                {req.groupName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors ml-4"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* ── Body: two columns on desktop ── */}
          <div className="flex flex-1 min-h-0">
            {/* Left — info panel (scrollable) */}
            <div
              className="hidden lg:block w-72 shrink-0 border-r border-gray-100 overflow-y-auto p-5"
              style={{ background: "#FAFAFA" }}
            >
              <InfoPanel req={req} />
            </div>

            {/* Right — farmers list (scrollable within) */}
            <div className="flex-1 min-w-0 flex flex-col">
              <FarmersPanel req={req} />
            </div>
          </div>

          {/* ── Mobile: info accordion strip ── */}
          <div className="lg:hidden border-t border-gray-100 px-4 py-3 shrink-0 bg-gray-50">
            <div className="flex items-center justify-between text-[12px] text-gray-500">
              <span className="font-semibold">{req.community}</span>
              <span className="font-mono" style={{ color: "var(--green-600)" }}>{req.transactionId}</span>
              <span className="font-bold text-gray-900">GHS {req.disbursedAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
