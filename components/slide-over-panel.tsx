"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types (re-exported so kanban-screen can import them)
// ---------------------------------------------------------------------------
export type SupportType = "Cash" | "Ploughing";
export type Stage =
  | "pending_scoring"
  | "scoring_complete"
  | "pending_approval"
  | "approved"
  | "agent_confirmed"
  | "funds_disbursed";

export interface FarmerRequest {
  id: string;
  date: string;
  agent: string;
  community: string;
  groupName: string;
  score: number | null;
  stage: Stage;
  supportType: SupportType;
  farmers: number;
  onHold: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STAGE_LABELS: Record<Stage, string> = {
  pending_scoring:  "Pending Scoring",
  scoring_complete: "Scoring Complete",
  pending_approval: "Pending Approval",
  approved:         "Approved",
  agent_confirmed:  "Agent Confirmed",
  funds_disbursed:  "Funds Disbursed",
};

const STAGE_STYLES: Record<Stage, React.CSSProperties> = {
  pending_scoring:  { background: "#FEF3C7", color: "#D97706" },
  scoring_complete: { background: "#DBEAFE", color: "#2563EB" },
  pending_approval: { background: "#FEF3C7", color: "#D97706" },
  approved:         { background: "#DCFCE7", color: "#16A34A" },
  agent_confirmed:  { background: "#DCFCE7", color: "#16A34A" },
  funds_disbursed:  { background: "#F3F4F6", color: "#6B7280" },
};

// ---------------------------------------------------------------------------
// ScoreBar
// ---------------------------------------------------------------------------
function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="w-full">
      <div
        className="relative h-2.5 rounded-full"
        style={{ background: "linear-gradient(to right, #EF4444, #F59E0B, #16A34A)" }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-zinc-500 shadow"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Poor</span><span>Fair</span><span>Good</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CriterionRow
// ---------------------------------------------------------------------------
function CriterionRow({ label, type, score, max = 10 }: {
  label: string;
  type: "Auto-scored" | "Manual";
  score: number;
  max?: number;
}) {
  const pct = (score / max) * 100;
  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <p className="text-[13px] font-medium text-foreground">{label}</p>
          <Badge
            variant="outline"
            className="text-[10px] font-semibold border-0 px-1.5 py-0.5 mt-0.5"
            style={
              type === "Auto-scored"
                ? { background: "#DBEAFE", color: "#2563EB" }
                : { background: "#FEF3C7", color: "#D97706" }
            }
          >
            {type}
          </Badge>
        </div>
        <span className="text-[13px] font-bold text-muted-foreground">{score}/{max}</span>
      </div>
      <Progress value={pct} className="h-1.5 [&>div]:bg-[#16A34A]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component — now a Dialog instead of a slide-over
// ---------------------------------------------------------------------------
export default function SlideOverPanel({
  card,
  onClose,
  onApprove,
  onHold,
  onScore,
  onDisburse,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onApprove?: (card: FarmerRequest) => void;
  onHold?: (card: FarmerRequest) => void;
  onScore?: (card: FarmerRequest) => void;
  onDisburse?: (card: FarmerRequest) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const stageStyle = STAGE_STYLES[card.stage];
  const supportStyle =
    card.supportType === "Cash"
      ? { background: "#EFF6FF", color: "#2563EB" }
      : { background: "#F3E8FF", color: "#7C3AED" };
  const scoreDisplay = card.score !== null ? `${card.score}%` : "Not yet scored";

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="p-0 gap-0 flex flex-col"
        style={{ maxWidth: 580, maxHeight: "85vh", overflow: "hidden" }}
      >
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-5 pb-0 border-b border-border shrink-0">
          <DialogTitle className="text-[16px] font-bold leading-snug">
            {card.groupName}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-0.5 mt-0.5">
              <p className="text-[12px] text-muted-foreground">
                {card.community} &middot; {card.farmers} farmers
                <span className="ml-2 font-mono text-[10px] text-muted-foreground/50">{card.id}</span>
              </p>
              {/* Stage + support chips */}
              <div className="flex items-center gap-2 pt-1 pb-3">
                <Badge
                  variant="outline"
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full border-0"
                  style={stageStyle}
                >
                  {STAGE_LABELS[card.stage]}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full border-0"
                  style={supportStyle}
                >
                  {card.supportType}
                </Badge>
              </div>
            </div>
          </DialogDescription>

          {/* Tabs — live inside the header border area */}
          <Tabs defaultValue="overview" className="-mb-px">
            <TabsList className="bg-transparent rounded-none p-0 h-auto gap-0">
              <TabsTrigger
                value="overview"
                className="rounded-none px-4 py-2.5 text-[13px] font-semibold border-b-2 border-transparent data-[state=active]:border-[#16A34A] data-[state=active]:text-[#16A34A] data-[state=inactive]:text-muted-foreground bg-transparent shadow-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="score_details"
                className="rounded-none px-4 py-2.5 text-[13px] font-semibold border-b-2 border-transparent data-[state=active]:border-[#16A34A] data-[state=active]:text-[#16A34A] data-[state=inactive]:text-muted-foreground bg-transparent shadow-none"
              >
                Score Details
              </TabsTrigger>
            </TabsList>

            {/* ── BODY (scrollable) ──────────────────────────────────── */}
            <div style={{ overflowY: "auto", maxHeight: "calc(85vh - 280px)" }}>
              {/* Overview tab */}
              <TabsContent value="overview" className="mt-0 px-6 py-5 space-y-5">
                {/* Group Score */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Group Score
                    </p>
                    <span className="text-[20px] font-bold text-foreground">{scoreDisplay}</span>
                  </div>
                  {card.score !== null ? (
                    <ScoreBar score={card.score} />
                  ) : (
                    <div className="h-2.5 rounded-full bg-muted" />
                  )}
                </section>

                <Separator />

                {/* Support Interests */}
                <section>
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Support Interests
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Primary",   value: card.supportType },
                      { label: "Secondary", value: card.supportType === "Cash" ? "Ploughing" : "Cash" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5"
                      >
                        <span className="text-[12px] text-muted-foreground">{row.label}</span>
                        <span className="text-[12px] font-semibold text-foreground">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* Agent */}
                <section>
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Agent
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#F0FDF4] flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="5" r="3" stroke="#16A34A" strokeWidth="1.5"/>
                        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{card.agent}</p>
                      <p className="text-[11px] text-muted-foreground">Requested: {card.date}</p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Voice Note Evidence */}
                <section>
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Voice Note Evidence
                  </p>
                  <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                    <Button
                      size="icon"
                      className="w-9 h-9 rounded-full shrink-0 bg-[#16A34A] hover:bg-[#15803D]"
                      onClick={() => setIsPlaying(!isPlaying)}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                          <rect x="2" y="1" width="3" height="10" rx="1"/>
                          <rect x="7" y="1" width="3" height="10" rx="1"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                          <path d="M3 2l7 4-7 4V2z"/>
                        </svg>
                      )}
                    </Button>
                    <div className="flex-1">
                      <Progress value={35} className="h-1.5 [&>div]:bg-[#16A34A]" />
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">0:23</span>
                  </div>
                </section>
              </TabsContent>

              {/* Score Details tab */}
              <TabsContent value="score_details" className="mt-0 px-6 py-5">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Scoring Criteria
                </p>
                <div className="rounded-xl border border-border px-4">
                  <CriterionRow label="Meeting Attendance"              type="Auto-scored" score={8} />
                  <CriterionRow label="Group Savings"                   type="Auto-scored" score={7} />
                  <CriterionRow label="Meeting Minutes Records"         type="Manual"      score={6} />
                  <CriterionRow label="Financial Contribution Records"  type="Manual"      score={9} />
                </div>
              </TabsContent>
            </div>

            {/* ── FOOTER ACTIONS ─────────────────────────────────────── */}
            <div className="border-t border-border px-6 py-4 shrink-0">
              {card.stage === "pending_scoring" && (
                <Button
                  className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white"
                  onClick={() => { onClose(); onScore && onScore(card); }}
                >
                  Update Scores
                </Button>
              )}
              {card.stage === "pending_approval" && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white"
                    onClick={() => { onClose(); onApprove && onApprove(card); }}
                  >
                    Approve Request
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { onClose(); onHold && onHold(card); }}
                  >
                    Place on Hold
                  </Button>
                </div>
              )}
              {card.stage === "agent_confirmed" && (
                <Button
                  className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white"
                  onClick={() => { onClose(); onDisburse && onDisburse(card); }}
                >
                  Disburse Funds
                </Button>
              )}
              {card.stage === "scoring_complete" && (
                <p className="text-[12px] text-center text-muted-foreground">Awaiting approver review</p>
              )}
              {card.stage === "approved" && (
                <p className="text-[12px] text-center text-muted-foreground">Awaiting field agent confirmation</p>
              )}
              {card.stage === "funds_disbursed" && (
                <p className="text-[12px] text-center text-muted-foreground">Funds have been disbursed</p>
              )}
            </div>
          </Tabs>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
