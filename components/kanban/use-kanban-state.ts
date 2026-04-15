"use client";

import { useState, useMemo } from "react";
import type { FarmerRequest, Stage, SupportType, ScoreSort, ActionRecord, DisbursementBreakdown } from "./types";
import type { ToastMessage } from "@/components/toast-notification";
import type { ActiveFilters } from "./filter-bar";
import { MOCK_REQUESTS } from "./mock-data";

// ---------------------------------------------------------------------------
// Action record helpers
// ---------------------------------------------------------------------------
const CURRENT_USER = "Douglas Gockah";

function makeRecord(
  stage: Stage,
  actor: string,
  action: string,
  reason?: string,
  summary?: string,
): ActionRecord {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stage,
    actor,
    action,
    summary,
    reason: reason || undefined,
    timestamp: new Date().toLocaleString("en-GH", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }),
  };
}

function appendRecord(
  requests: FarmerRequest[],
  id: string,
  record: ActionRecord,
): FarmerRequest[] {
  return requests.map((r) =>
    r.id !== id ? r : { ...r, actionHistory: [...(r.actionHistory ?? []), record] },
  );
}

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
  const [archivedIds,  setArchivedIds]  = useState<Set<string>>(new Set());

  // Derived: filtered requests (archived cards are hidden from the board)
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (archivedIds.has(r.id)) return false;
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        if (!r.groupName.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) return false;
      }
      if (activeFilters.community && r.community !== activeFilters.community) return false;
      if (activeFilters.agent     && r.agent     !== activeFilters.agent)     return false;
      return true;
    });
  }, [requests, activeFilters, archivedIds]);

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
    setRequests((prev) => {
      const card = prev.find((r) => r.id === id);
      const farmers = card?.farmers ?? 0;
      const short = approvedType === "Cash" ? "Approved cash support" : "Approved ploughing support";
      const narrative = approvedType === "Cash"
        ? `${CURRENT_USER} approved Cash support for ${farmers} farmers at GHS ${amountPerFarmer?.toLocaleString() ?? "—"}/farmer, totalling GHS ${((amountPerFarmer ?? 0) * farmers).toLocaleString()}`
        : `${CURRENT_USER} approved Ploughing support for ${farmers} farmers at ${landSizePerFarmer} ac/farmer, totalling ${((landSizePerFarmer ?? 0) * farmers).toFixed(1)} ac`;
      let next = prev.map((r) =>
        r.id !== id ? r : {
          ...r,
          stage: "agent_confirmation" as Stage,
          approvedSupportType: approvedType,
          approvedAmountPerFarmer: amountPerFarmer,
          approvedLandSizePerFarmer: landSizePerFarmer,
        },
      );
      next = appendRecord(next, id, makeRecord("pending_approval", CURRENT_USER, short, undefined, narrative));
      return next;
    });
    setReviewCard(null);
    showToast("Request moved to Manager Confirmation");
  }

  function handleManagerConfirmed(id: string, momoNumber: string, momoName: string) {
    setRequests((prev) => {
      const card = prev.find((r) => r.id === id);
      const farmers = card?.farmers ?? 0;
      let next = prev.map((r) =>
        r.id !== id ? r : { ...r, stage: "finance_disbursement" as Stage, momoNumber, momoName },
      );
      next = appendRecord(next, id, makeRecord(
        "agent_confirmation", CURRENT_USER,
        "Confirmed participating farmers",
        undefined,
        `${CURRENT_USER} confirmed ${farmers} interested farmers and submitted MoMo ${momoNumber} (${momoName}) for disbursement`,
      ));
      return next;
    });
    setManagerCard(null);
    showToast("Manager confirmation complete — request moved to Finance & Disbursement");
  }

  function handleHeld(id: string, comment: string) {
    setRequests((prev) => {
      let next = prev.map((r) => (r.id !== id ? r : { ...r, onHold: true, holdComment: comment }));
      next = appendRecord(next, id, makeRecord(
        "pending_approval", CURRENT_USER,
        "Placed on hold",
        comment,
        `${CURRENT_USER} placed the request on hold`,
      ));
      return next;
    });
    setReviewCard(null);
    showToast("Request placed on hold");
  }

  function handleRejected(id: string, comment: string) {
    setRequests((prev) => {
      let next = prev.map((r) =>
        r.id !== id ? r : { ...r, stage: "rejected" as Stage, rejectionComment: comment },
      );
      next = appendRecord(next, id, makeRecord(
        "pending_approval", CURRENT_USER,
        "Rejected request",
        comment,
        `${CURRENT_USER} rejected the request`,
      ));
      return next;
    });
    setReviewCard(null);
    showToast("Request moved to Rejected");
  }

  function handleScored(id: string, score: number) {
    setRequests((prev) => {
      let next = prev.map((r) =>
        r.id !== id ? r : { ...r, score, stage: "pending_approval" as Stage },
      );
      next = appendRecord(next, id, makeRecord(
        "synced", CURRENT_USER,
        "Scored request",
        undefined,
        `${CURRENT_USER} assigned a score of ${score}% to the group`,
      ));
      return next;
    });
    setScoreCard(null);
    showToast("Score submitted — moved to Pending Approval");
  }

  function handleAmountEdited(
    id: string,
    field: "Cash" | "Land",
    oldValue: number,
    newValue: number,
    reason: string,
  ) {
    const fmt = (v: number) => field === "Cash" ? `GHS ${v.toLocaleString()}` : `${v} acres`;
    const short = field === "Cash" ? "Updated support amount" : "Updated land size";
    const narrative = `${CURRENT_USER} updated the ${field === "Cash" ? "cash amount" : "land size"} per farmer from ${fmt(oldValue)} to ${fmt(newValue)}`;
    setRequests((prev) =>
      appendRecord(prev, id, makeRecord("pending_approval", CURRENT_USER, short, reason || undefined, narrative)),
    );
  }

  function archiveRequest(id: string) {
    setArchivedIds((prev) => new Set(prev).add(id));
    showToast("Request archived");
  }

  function handleDisbursed(id: string, txId: string, amount: number, breakdown?: DisbursementBreakdown, momoUpdateRecord?: ActionRecord) {
    const date = new Date().toLocaleDateString("en-GH", {
      day: "2-digit", month: "short", year: "numeric",
    });
    setRequests((prev) => {
      let next = prev.map((r) =>
        r.id !== id ? r : {
          ...r,
          stage: "disbursed" as Stage,
          transactionId: txId,
          disbursedAmount: amount,
          disbursedDate: date,
          disbursementBreakdown: breakdown,
        },
      );
      // Append MoMo update record first (if number was corrected during verification)
      if (momoUpdateRecord) {
        next = appendRecord(next, id, momoUpdateRecord);
      }
      next = appendRecord(next, id, makeRecord(
        "finance_disbursement", CURRENT_USER,
        "Disbursed funds",
        undefined,
        `${CURRENT_USER} disbursed GHS ${amount.toLocaleString()} via MoMo · ${txId}`,
      ));
      return next;
    });
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
    archiveRequest,
    handleApproved,
    handleManagerConfirmed,
    handleHeld,
    handleRejected,
    handleScored,
    handleDisbursed,
    handleAmountEdited,
  };
}
