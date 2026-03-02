// ---------------------------------------------------------------------------
// Shared types for the Kanban / Farmer Support module
// ---------------------------------------------------------------------------

export type SupportType = "Cash" | "Ploughing";

export type Stage =
  | "synced"
  | "pending_approval"
  | "rejected"
  | "agent_confirmation"
  | "finance_disbursement"
  | "disbursed";

export interface SupportInterest {
  rank: "Primary" | "Secondary";
  type: SupportType;
  amountPerFarmer?: number;
  momoNumber?: string;
  momoName?: string;
  landSizePerFarmer?: number;
}

export interface FarmerRequest {
  id: string;
  date: string;
  agent: string;
  community: string;
  groupName: string;
  score: number | null;
  stage: Stage;
  farmers: number;
  onHold: boolean;
  holdComment: string;
  rejectionComment: string;
  supportInterests: SupportInterest[];
  approvedSupportType: SupportType | null;
  approvedAmountPerFarmer?: number;
  approvedLandSizePerFarmer?: number;
  momoNumber?: string;
  momoName?: string;
  transactionId?: string;
  disbursedAmount?: number;
  disbursedDate?: string;
  hasFinancialRecords?: boolean;
}

export interface ColDef {
  id: Stage;
  label: string;
  dotColor: string;
  ctaLabel: string;
  ctaStages: Stage[];
}

export type ScoreSort = "default" | "desc" | "asc";
