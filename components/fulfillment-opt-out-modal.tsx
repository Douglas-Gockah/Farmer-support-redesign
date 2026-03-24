"use client";

import { useEffect, useState } from "react";
import type { FulfillmentRequest } from "@/components/kanban/types";
import { initials, avatarColor } from "@/components/kanban/helpers";

export default function FulfillmentOptOutModal({
  req,
  onClose,
}: {
  req: FulfillmentRequest;
  onClose: () => void;
}) {
  const farmers = req.optedOutFarmers ?? [];
  const refundPerFarmer = req.approvedAmountPerFarmer;
  const totalRefund = farmers.length * refundPerFarmer;

  // Track uploaded proof per farmer id
  const [uploads, setUploads] = useState<Record<string, string>>({});

  const uploadedCount = Object.keys(uploads).length;
  const allUploaded = farmers.length > 0 && uploadedCount === farmers.length;

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
          className="pointer-events-auto w-full flex flex-col bg-white rounded-2xl shadow-2xl"
          style={{ maxWidth: 480, maxHeight: "calc(100vh - 64px)" }}
        >
          {/* ── Header ── */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
            <div>
              <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">
                Cash Opt-Outs &mdash; {farmers.length} farmer{farmers.length !== 1 ? "s" : ""}
              </p>
              <h2 className="text-[16px] font-bold text-gray-900 leading-snug">
                {req.groupName}
              </h2>
              <p className="text-[12px] text-gray-500 mt-0.5">{req.community}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0 ml-4 mt-0.5"
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

          {/* ── Refund summary banner ── */}
          <div
            className="mx-6 mb-4 rounded-xl px-4 py-3 shrink-0"
            style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-amber-600 font-semibold">Total refund amount</p>
                <p className="text-[18px] font-bold text-amber-800">
                  GHS {totalRefund.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-amber-600">Per farmer</p>
                <p className="text-[14px] font-bold text-amber-800">
                  GHS {refundPerFarmer.toLocaleString()}
                </p>
              </div>
            </div>
            {farmers.length > 0 && (
              <div className="mt-2 pt-2 border-t border-amber-200">
                <div className="flex items-center justify-between text-[11px] text-amber-600">
                  <span>Proof uploaded</span>
                  <span className="font-bold">
                    {uploadedCount} / {farmers.length}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full" style={{ background: "#FEF3C7" }}>
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(uploadedCount / farmers.length) * 100}%`,
                      background: allUploaded ? "#16A34A" : "#F59E0B",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Description ── */}
          <p className="px-6 pb-3 text-[12px] text-gray-500 shrink-0">
            Upload a refund document (PDF, JPG, or PNG) as proof of refund for each opted-out farmer.
          </p>

          {/* ── Farmer list (scrollable) ── */}
          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            <div className="divide-y divide-gray-100">
              {farmers.map((farmer) => {
                const uploaded = uploads[farmer.id];
                const inputId = `refund-${req.id}-${farmer.id}`;
                const color = avatarColor(farmer.name);

                return (
                  <div
                    key={farmer.id}
                    className="flex items-center gap-3 py-3"
                  >
                    {/* Avatar */}
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ background: color }}
                    >
                      {initials(farmer.name)}
                    </span>

                    {/* Name + refund amount */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">
                        {farmer.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        GHS {refundPerFarmer.toLocaleString()} refund
                      </p>
                    </div>

                    {/* Upload / Done button */}
                    <input
                      type="file"
                      id={inputId}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const fileName = e.target.files?.[0]?.name;
                        if (fileName) {
                          setUploads((prev) => ({ ...prev, [farmer.id]: fileName }));
                        }
                      }}
                    />
                    <label
                      htmlFor={inputId}
                      className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[12px] font-semibold cursor-pointer transition-colors whitespace-nowrap"
                      style={
                        uploaded
                          ? { borderColor: "#16A34A", color: "#16A34A", background: "#F0FDF4" }
                          : { borderColor: "#D1D5DB", color: "#6B7280", background: "transparent" }
                      }
                    >
                      {uploaded ? (
                        <>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Uploaded
                        </>
                      ) : (
                        <>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M6 1v6M4 4l2-2 2 2M2 10h8"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Upload
                        </>
                      )}
                    </label>

                    {/* Uploaded filename tooltip */}
                    {uploaded && (
                      <span
                        className="text-[10px] text-gray-400 truncate max-w-[80px] hidden sm:block"
                        title={uploaded}
                      >
                        {uploaded}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-100 mt-2 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {allUploaded && (
              <button
                onClick={onClose}
                className="flex-1 h-9 rounded-lg text-[13px] font-bold text-white transition-colors"
                style={{ background: "#16A34A" }}
              >
                Mark as complete
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
