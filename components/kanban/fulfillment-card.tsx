"use client";

import { useState } from "react";
import type { FulfillmentRequest } from "./types";
import { initials, avatarColor } from "./helpers";

interface FulfillmentCardProps {
  req: FulfillmentRequest;
  onView: () => void;
}

export function FulfillmentCard({ req, onView }: FulfillmentCardProps) {
  const [hovered, setHovered] = useState(false);

  const received      = req.confirmedFarmers.filter((f) => f.received).length;
  const total         = req.confirmedFarmers.length;
  const isPartial     = req.fulfillmentStage === "partially_fulfilled";
  const isFull        = req.fulfillmentStage === "fully_fulfilled";
  const isOptedOut    = req.fulfillmentStage === "opted_out";
  const optedOutCount = req.optedOutFarmers?.length ?? 0;
  const pct           = total > 0 ? Math.round((received / total) * 100) : 0;

  const agentInitials  = initials(req.agent);
  const agentColor     = avatarColor(req.agent);
  const progressColor  = isFull ? "var(--green-600)" : "var(--yellow-500)";

  return (
    <div
      className="bg-white rounded-xl mb-3 cursor-pointer"
      style={{
        boxShadow: hovered
          ? "0px 4px 16px rgba(16,24,40,0.10)"
          : "0px 1px 3px rgba(16,24,40,0.06)",
        transform:  hovered ? "translateY(-2px)" : "none",
        transition: "box-shadow 0.2s, transform 0.2s",
        border: isOptedOut
          ? "1.5px dashed var(--yellow-500)"
          : "1px solid var(--gray-200)",
      }}
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-4">
        {/* Group name */}
        <p className="text-[15px] font-semibold text-gray-900 leading-snug mb-0.5">
          {req.groupName}
        </p>

        {/* Community · confirmed farmers count */}
        <p style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--gray-500)", marginBottom: 12 }}>
          {req.community} &middot; {total} farmers confirmed
        </p>

        {/* Opted-out warning chip */}
        {isOptedOut && optedOutCount > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
            style={{ background: "var(--yellow-50)", border: "1px solid var(--yellow-200)" }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="var(--yellow-600)" strokeWidth="1.4" />
              <path d="M8 5v3.5M8 10.5v.5" stroke="var(--yellow-600)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--yellow-700)" }}>
              {optedOutCount} farmer{optedOutCount !== 1 ? "s" : ""} opted out
            </span>
            <span style={{ marginLeft: "auto", fontSize: "0.6875rem", fontWeight: 500, color: "var(--yellow-600)" }}>
              GHS {(optedOutCount * req.approvedAmountPerFarmer).toLocaleString()} to refund
            </span>
          </div>
        )}

        {/* Amount row */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: "var(--green-50)", color: "var(--green-600)" }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            GHS {req.approvedAmountPerFarmer.toLocaleString()} / farmer
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--gray-900)" }}>
            GHS {req.disbursedAmount.toLocaleString()}
          </span>
        </div>

        {/* Progress bar — partially or fully fulfilled */}
        {(isPartial || isFull) && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--gray-500)" }}>
                {received} of {total} received
              </span>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: progressColor }}>
                {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "var(--gray-100)" }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${pct}%`, background: progressColor }}
              />
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--gray-100)", marginBottom: 12 }} />

        {/* Agent + disbursed date */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ background: agentColor }}
            >
              {agentInitials}
            </span>
            <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--gray-600)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {req.agent}
            </span>
          </div>
          <div className="flex items-center gap-1" style={{ color: "var(--gray-400)" }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 1v2M9 1v2M1 6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "0.6875rem" }}>{req.disbursedDate}</span>
          </div>
        </div>

        {/* Request ID */}
        <span style={{ fontSize: "0.6875rem", fontWeight: 600, fontFamily: "monospace", color: "var(--gray-400)", letterSpacing: "0.05em" }}>
          {req.id}
        </span>
      </div>
    </div>
  );
}
