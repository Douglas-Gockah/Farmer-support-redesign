"use client";

import { useState, useMemo } from "react";
import type { FarmerRequest, Stage, SupportType, ScoreSort } from "./types";
import type { ToastMessage } from "@/components/toast-notification";
import type { ActiveFilters } from "./filter-bar";
import { MOCK_REQUESTS } from "./mock-data";

// ---------------------------------------------------------------------------
// Hook — manages all request state and workflow transitions
// ---------------------------------------------------------------------------
export function useKanbanState(activeFilters: ActiveFilters) {
  const [requests,     setRequests]     = useState<FarmerRequest[]>(MOCK_REQUESTS);
  const [selectedCard, setSelectedCard] = useState<FarmerRequest | null>(null);
  const [reviewCard,   setReviewCard]   = useState<FarmerRequest | null>(null);
  const [scoreCard,    setScoreCard]    = useState<FarmerRequest | null>(null);
  const [disburseCard, setDisburseCard] = useState<FarmerRequest | null>(null);
  const [managerCard,  setManagerCard]  = useState<FarmerRequest | null>(null);
  const [toasts,       setToasts]       = useState<ToastMessage[]>([]);
  const [scoreSort,    setScoreSort]    = useState<ScoreSort>("default");

  // Derived: filtered requests
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        if (!r.groupName.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) return false;
      }
      if (activeFilters.community && r.community !== activeFilters.community) return false;
      if (activeFilters.agent     && r.agent     !== activeFilters.agent)     return false;
      return true;
    });
  }, [requests, activeFilters]);

  // Derived: unique agent names for the filter bar
  const agents = useMemo(() => [...new Set(requests.map((r) => r.agent))], [requests]);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  function showToast(message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
  }
  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Score sort ─────────────────────────────────────────────────────────────
  function cycleScoreSort() {
    setScoreSort((s) => (s === "default" ? "desc" : s === "desc" ? "asc" : "default"));
  }

  // ── CTA dispatcher ─────────────────────────────────────────────────────────
  function ctaAction(r: FarmerRequest, stage: Stage) {
    if (stage === "synced")               setScoreCard(r);
    if (stage === "pending_approval")     setReviewCard(r);
    if (stage === "agent_confirmation")   setManagerCard(r);
    if (stage === "finance_disbursement") setDisburseCard(r);
  }

  // ── Workflow handlers ──────────────────────────────────────────────────────
  function handleApproved(
    id: string,
    approvedType: SupportType,
    amountPerFarmer?: number,
    landSizePerFarmer?: number,
  ) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id !== id ? r : {
          ...r,
          stage: "agent_confirmation" as Stage,
          approvedSupportType: approvedType,
          approvedAmountPerFarmer: amountPerFarmer,
          approvedLandSizePerFarmer: landSizePerFarmer,
        },
      ),
    );
    setReviewCard(null);
    showToast("Request moved to Manager Confirmation");
  }

  function handleManagerConfirmed(id: string, momoNumber: string, momoName: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id !== id ? r : { ...r, stage: "finance_disbursement" as Stage, momoNumber, momoName },
      ),
    );
    setManagerCard(null);
    showToast("Manager confirmation complete — request moved to Finance & Disbursement");
  }

  function handleHeld(id: string, comment: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id !== id ? r : { ...r, onHold: true, holdComment: comment })),
    );
    setReviewCard(null);
    showToast("Request placed on hold");
  }

  function handleRejected(id: string, comment: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id !== id ? r : { ...r, stage: "rejected" as Stage, rejectionComment: comment },
      ),
    );
    setReviewCard(null);
    showToast("Request moved to Rejected");
  }

  function handleScored(id: string, score: number) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id !== id ? r : { ...r, score, stage: "pending_approval" as Stage },
      ),
    );
    setScoreCard(null);
    showToast("Score submitted — moved to Pending Approval");
  }

  function handleDisbursed(id: string, txId: string, amount: number) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id !== id ? r : {
          ...r,
          stage: "disbursed" as Stage,
          transactionId: txId,
          disbursedAmount: amount,
          disbursedDate: new Date().toLocaleDateString("en-GH", {
            day: "2-digit", month: "short", year: "numeric",
          }),
        },
      ),
    );
    setDisburseCard(null);
    showToast("Funds disbursed successfully");
  }

  return {
    // Data
    requests,
    filtered,
    agents,
    // Modal state
    selectedCard, setSelectedCard,
    reviewCard,   setReviewCard,
    scoreCard,    setScoreCard,
    disburseCard, setDisburseCard,
    managerCard,  setManagerCard,
    // Toast
    toasts, removeToast,
    // Sort
    scoreSort, cycleScoreSort,
    // Handlers
    ctaAction,
    handleApproved,
    handleManagerConfirmed,
    handleHeld,
    handleRejected,
    handleScored,
    handleDisbursed,
  };
}
