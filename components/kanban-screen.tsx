"use client";

import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SlideOverPanel from "@/components/slide-over-panel";
import ApprovalModal from "@/components/approval-modal";
import DisbursementModal from "@/components/disbursement-modal";
import ManagerConfirmationModal from "@/components/manager-confirmation-modal";
import FulfillmentBoard from "@/components/fulfillment-board";
import RecoveriesBoard from "@/components/recoveries-board";
import DisbursementRecordsTable from "@/components/disbursement-records-table";
import { ToastContainer } from "@/components/toast-notification";
import { FilterBar, type ActiveFilters } from "@/components/kanban/filter-bar";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { ColumnHeader } from "@/components/kanban/column-header";
import { ScoringModal } from "@/components/kanban/scoring-modal";
import { useKanbanState } from "@/components/kanban/use-kanban-state";
import { COLUMNS } from "@/components/kanban/constants";
import type { Stage } from "@/components/kanban/types";

// ---------------------------------------------------------------------------
// Flow tabs
// ---------------------------------------------------------------------------
type ActiveFlow = "disbursement" | "fulfillment" | "recoveries";

const FLOWS: { id: ActiveFlow; label: string; shortLabel: string }[] = [
  { id: "disbursement", label: "Requests & Disbursement", shortLabel: "Disbursement" },
  { id: "fulfillment",  label: "Support Fulfilment",      shortLabel: "Fulfilment"   },
  { id: "recoveries",   label: "Recoveries",              shortLabel: "Recoveries"   },
];

const DEFAULT_FILTERS: ActiveFilters = {
  search: "", community: null, region: null, district: null, agent: null, datePreset: null,
};

export default function KanbanScreen() {
  const [activeFlow,    setActiveFlow]    = useState<ActiveFlow>("disbursement");
  const [viewMode,      setViewMode]      = useState<"pipeline" | "records">("pipeline");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [mobileColId,   setMobileColId]   = useState<Stage>("synced");

  const handleFilterChange = useCallback((f: ActiveFilters) => setActiveFilters(f), []);

  const {
    filtered, agents,
    selectedCard, setSelectedCard,
    reviewCard,   setReviewCard,
    scoreCard,    setScoreCard,
    disburseCard, setDisburseCard,
    managerCard,  setManagerCard,
    toasts, removeToast,
    scoreSort, cycleScoreSort,
    ctaAction,
    handleApproved, handleManagerConfirmed,
    handleHeld, handleRejected, handleScored, handleDisbursed,
  } = useKanbanState(activeFilters);

  function cardOnView(r: Parameters<typeof setSelectedCard>[0], colId: string) {
    if (colId === "synced")               return setScoreCard(r);
    if (colId === "pending_approval")     return setReviewCard(r);
    if (colId === "agent_confirmation")   return setManagerCard(r);
    if (colId === "finance_disbursement") return setDisburseCard(r);
    setSelectedCard(r);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-3 border-b border-gray-200 shrink-0" style={{ background: "#F9FAFB" }}>
        <span className="text-[13px] text-gray-400 font-medium">Farmer support</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 3l4 4-4 4" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[13px] font-bold text-gray-800">Requesting groups</span>
      </div>

      {/* ── Flow tabs ── */}
      <div className="shrink-0 flex overflow-x-auto border-b border-gray-200 bg-white scrollbar-none">
        {FLOWS.map((flow) => (
          <button
            key={flow.id}
            onClick={() => setActiveFlow(flow.id)}
            className="shrink-0 h-11 px-4 sm:px-5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap"
            style={activeFlow === flow.id
              ? { borderBottomColor: "#16A34A", color: "#16A34A" }
              : { borderBottomColor: "transparent", color: "#6B7280" }}
          >
            {/* Show short label on small screens, full label on sm+ */}
            <span className="sm:hidden">{flow.shortLabel}</span>
            <span className="hidden sm:inline">{flow.label}</span>
          </button>
        ))}
      </div>

      {/* ── Flow: Requests & Disbursement ── */}
      {activeFlow === "disbursement" && (
        <>
          {/* Filter bar — toggle lives inline on the right via rightSlot */}
          <FilterBar
            agents={agents}
            onFilterChange={handleFilterChange}
            rightSlot={
              <div className="flex items-center rounded-lg p-0.5 gap-0.5" style={{ background: "#F3F4F6" }}>
                <button
                  onClick={() => setViewMode("pipeline")}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-semibold transition-all"
                  style={viewMode === "pipeline"
                    ? { background: "#FFFFFF", color: "#111827", boxShadow: "0 1px 3px rgba(0,0,0,0.10)" }
                    : { background: "transparent", color: "#6B7280" }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="4" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="6" y="1" width="4" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="11" y="1" width="4" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  Pipeline
                </button>
                <button
                  onClick={() => setViewMode("records")}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-semibold transition-all"
                  style={viewMode === "records"
                    ? { background: "#FFFFFF", color: "#111827", boxShadow: "0 1px 3px rgba(0,0,0,0.10)" }
                    : { background: "transparent", color: "#6B7280" }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="14" height="3.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="1" y="6.25" width="14" height="3.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="1" y="11.5" width="14" height="3.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  Records
                </button>
              </div>
            }
          />

          {/* ── Pipeline view ── */}
          {viewMode === "pipeline" && (
            <>
              {/* Mobile: column tab strip */}
              <div className="lg:hidden shrink-0 flex overflow-x-auto gap-2 px-4 py-2.5 bg-white border-b border-gray-200 scrollbar-none">
                {COLUMNS.map((col) => {
                  const count    = filtered.filter((r) => r.stage === col.id).length;
                  const isActive = mobileColId === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => setMobileColId(col.id)}
                      className="shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors"
                      style={isActive
                        ? { background: col.dotColor, color: "white" }
                        : { background: "#F3F4F6", color: "#6B7280" }}
                    >
                      {col.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Mobile: single column view */}
              <div className="lg:hidden flex-1 overflow-y-auto" style={{ background: "#F9FAFB" }}>
                <div className="px-4 py-4">
                  {(() => {
                    const col   = COLUMNS.find((c) => c.id === mobileColId)!;
                    let cards   = filtered.filter((r) => r.stage === mobileColId);
                    if (mobileColId === "pending_approval" && scoreSort !== "default") {
                      cards = [...cards].sort((a, b) => {
                        const sa = a.score ?? -1; const sb = b.score ?? -1;
                        return scoreSort === "desc" ? sb - sa : sa - sb;
                      });
                    }
                    if (cards.length === 0) return (
                      <div className="flex items-center justify-center h-32">
                        <span className="text-[13px] text-gray-300">No requests</span>
                      </div>
                    );
                    return cards.map((r) => (
                      <KanbanCard
                        key={r.id}
                        r={r}
                        ctaLabel={col.ctaLabel}
                        onCta={() => ctaAction(r, col.id)}
                        onView={() => cardOnView(r, col.id)}
                      />
                    ));
                  })()}
                </div>
              </div>

              {/* Desktop: all columns, horizontal scroll */}
              <div className="hidden lg:block" style={{ flex: 1, overflowX: "auto", overflowY: "hidden", background: "#F9FAFB" }}>
                <div style={{ display: "flex", flexDirection: "row", gap: 12, padding: "16px 20px", height: "100%", minWidth: "max-content" }}>
                  {COLUMNS.map((col) => {
                    let cards = filtered.filter((r) => r.stage === col.id);
                    if (col.id === "pending_approval" && scoreSort !== "default") {
                      cards = [...cards].sort((a, b) => {
                        const sa = a.score ?? -1; const sb = b.score ?? -1;
                        return scoreSort === "desc" ? sb - sa : sa - sb;
                      });
                    }
                    const isPendingCol = col.id === "pending_approval";
                    return (
                      <div key={col.id} style={{ width: 288, minWidth: 288, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                        <div style={{ flexShrink: 0 }}>
                          <ColumnHeader
                            label={col.label}
                            dotColor={col.dotColor}
                            count={cards.length}
                            scoreSort={isPendingCol ? scoreSort : undefined}
                            onCycleSort={isPendingCol ? cycleScoreSort : undefined}
                          />
                        </div>
                        <ScrollArea className="flex-1 min-h-0">
                          <div style={{ paddingBottom: 16 }}>
                            {cards.length === 0 ? (
                              <div className="flex items-center justify-center h-20">
                                <span className="text-[12px] text-gray-300">No requests</span>
                              </div>
                            ) : (
                              cards.map((r) => (
                                <KanbanCard
                                  key={r.id}
                                  r={r}
                                  ctaLabel={col.ctaLabel}
                                  onCta={() => ctaAction(r, col.id)}
                                  onView={() => cardOnView(r, col.id)}
                                />
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── Records view ── */}
          {viewMode === "records" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ background: "#FFFFFF" }}>
              <DisbursementRecordsTable
                records={filtered.filter((r) => r.stage === "disbursed")}
              />
            </div>
          )}
        </>
      )}

      {/* ── Flow: Support Fulfilment ── */}
      {activeFlow === "fulfillment" && <FulfillmentBoard />}

      {/* ── Flow: Recoveries ── */}
      {activeFlow === "recoveries" && <RecoveriesBoard />}

      {/* Modals + panels */}
      {managerCard && (
        <ManagerConfirmationModal
          card={managerCard}
          onClose={() => setManagerCard(null)}
          onConfirmed={handleManagerConfirmed}
        />
      )}
      {selectedCard && (
        <SlideOverPanel
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onScore={(card) => { setSelectedCard(null); setScoreCard(card); }}
          onReview={(card) => { setSelectedCard(null); setReviewCard(card); }}
          onDisburse={(card) => { setSelectedCard(null); setDisburseCard(card); }}
        />
      )}
      {reviewCard && (
        <ApprovalModal
          card={reviewCard}
          onClose={() => setReviewCard(null)}
          onApproved={handleApproved}
          onHeld={handleHeld}
          onRejected={handleRejected}
        />
      )}
      {scoreCard && (
        <ScoringModal
          card={scoreCard}
          onClose={() => setScoreCard(null)}
          onScored={handleScored}
        />
      )}
      {disburseCard && (
        <DisbursementModal
          card={disburseCard}
          onClose={() => setDisburseCard(null)}
          onDisbursed={handleDisbursed}
        />
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
