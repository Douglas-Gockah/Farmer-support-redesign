"use client";

import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SlideOverPanel from "@/components/slide-over-panel";
import ApprovalModal from "@/components/approval-modal";
import DisbursementModal from "@/components/disbursement-modal";
import ManagerConfirmationModal from "@/components/manager-confirmation-modal";
import { ToastContainer } from "@/components/toast-notification";
import { FilterBar, type ActiveFilters } from "@/components/kanban/filter-bar";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { ColumnHeader } from "@/components/kanban/column-header";
import { ScoringModal } from "@/components/kanban/scoring-modal";
import { useKanbanState } from "@/components/kanban/use-kanban-state";
import { COLUMNS } from "@/components/kanban/constants";

const DEFAULT_FILTERS: ActiveFilters = {
  search: "", community: null, region: null, district: null, agent: null, datePreset: null,
};

export default function KanbanScreen() {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);

  // Stable callback so FilterBar doesn't cause unnecessary re-renders
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200" style={{ background: "#F9FAFB", flexShrink: 0 }}>
        <span className="text-[13px] text-gray-400 font-medium">Farmer support</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 3l4 4-4 4" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[13px] font-bold text-gray-800">Requesting groups</span>
      </div>

      {/* Search + filter bar (self-contained) */}
      <FilterBar agents={agents} onFilterChange={handleFilterChange} />

      {/* Kanban board */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden", background: "#F9FAFB" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 12, padding: "16px 20px", height: "100%", minWidth: "max-content" }}>
          {COLUMNS.map((col) => {
            let cards = filtered.filter((r) => r.stage === col.id);
            if (col.id === "pending_approval" && scoreSort !== "default") {
              cards = [...cards].sort((a, b) => {
                const sa = a.score ?? -1;
                const sb = b.score ?? -1;
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
                          onView={() => setSelectedCard(r)}
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
