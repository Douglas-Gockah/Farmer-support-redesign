"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FarmerRequest } from "@/components/kanban/types";

// ---------------------------------------------------------------------------
// Hold Modal
// ---------------------------------------------------------------------------
export function HoldModal({
  card,
  onClose,
  onConfirm,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  const [comment, setComment] = useState("");

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[540px] p-6">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold">Place support request on hold</DialogTitle>
          <p className="text-[13px] text-muted-foreground mt-1">
            Are you sure you want to place this support request on hold?
          </p>
        </DialogHeader>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Type a comment for placing this request on hold. Make it short and simple."
          className="mt-4 resize-none h-20 text-[13px]"
        />

        <div className="flex gap-3 mt-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={comment.trim() === ""}
            onClick={() => onConfirm(card.id)}
            style={{ background: "var(--green-600)" }}
            className="flex-1 text-white disabled:opacity-50"
          >
            Place on hold
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Evidence section (inside Scoring Modal)
// ---------------------------------------------------------------------------
function EvidenceSection({
  title,
  icon,
  score,
  onScoreChange,
}: {
  title: string;
  icon: string;
  score: number;
  onScoreChange: (v: number) => void;
}) {
  return (
    <div className="border border-border rounded-xl p-4 space-y-4">
      <p className="text-[14px] font-semibold text-foreground">
        {icon} {title}
      </p>

      {/* Evidence image placeholder */}
      <div className="w-full rounded-lg bg-muted flex items-center justify-center gap-2 h-20">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="4" width="16" height="12" rx="2" stroke="#9CA3AF" strokeWidth="1.5"/>
          <circle cx="7" cy="9" r="1.5" stroke="#9CA3AF" strokeWidth="1.5"/>
          <path d="M2 14l4-4 3 3 3-3 4 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[12px] text-muted-foreground">Evidence image placeholder</span>
      </div>

      {/* Score slider row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">Score (0–10)</span>
          <span className="text-[15px] font-bold text-[var(--green-600)]">{score}</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={score}
          onChange={(e) => onScoreChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            accentColor: "var(--green-600)",
            background: `linear-gradient(to right, var(--green-600) ${score * 10}%, #E5E7EB ${score * 10}%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0</span><span>5</span><span>10</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scoring Modal
// ---------------------------------------------------------------------------
export function ScoringModal({
  card,
  onClose,
  onConfirm,
}: {
  card: FarmerRequest;
  onClose: () => void;
  onConfirm: (id: string, score: number) => void;
}) {
  const [meetingScore, setMeetingScore] = useState(5);
  const [financialScore, setFinancialScore] = useState(5);
  const [confirmed, setConfirmed] = useState(false);

  const avgScore = Math.round(((meetingScore + financialScore) / 20) * 100);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[540px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[17px] font-bold">Score: {card.groupName}</DialogTitle>
          <p className="text-[13px] text-muted-foreground mt-0.5">Review evidence and confirm scores</p>
        </DialogHeader>

        <div className="space-y-4 mb-5">
          <EvidenceSection
            title="Meeting Minutes Records"
            icon="📄"
            score={meetingScore}
            onScoreChange={setMeetingScore}
          />
          <EvidenceSection
            title="Financial Contribution Records"
            icon="💰"
            score={financialScore}
            onScoreChange={setFinancialScore}
          />
        </div>

        {/* Confirmation */}
        <div className="flex items-start gap-3 mb-5">
          <Checkbox
            id="confirm-score"
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(Boolean(v))}
            className="mt-0.5 data-[state=checked]:bg-[var(--green-600)] data-[state=checked]:border-[var(--green-600)]"
          />
          <Label htmlFor="confirm-score" className="text-[13px] text-muted-foreground leading-relaxed cursor-pointer">
            I have reviewed all evidence and confirm these scores are accurate.
          </Label>
        </div>

        <Button
          disabled={!confirmed}
          onClick={() => onConfirm(card.id, avgScore)}
          style={{ background: "var(--green-600)" }}
        className="w-full text-white disabled:opacity-50"
        >
          Confirm scores
        </Button>
      </DialogContent>
    </Dialog>
  );
}
