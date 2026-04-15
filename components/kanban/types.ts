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
  | "disbursed"
  | "opted_out";

// ---------------------------------------------------------------------------
// Action timeline record — one entry per significant action taken
// ---------------------------------------------------------------------------
export interface ActionRecord {
  id: string;
  stage: Stage;
  actor: string;
  action: string;
  summary?: string;
  reason?: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Disbursement charge breakdown — stored on disbursed requests
// ---------------------------------------------------------------------------
export interface DisbursementBreakdown {
  baseAmount: number;
  withdrawalCharge: number;
  transportAllowance: number;
  total: number;
}

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
  optedOutFarmers?: string[];
  wantsDouble?: boolean;
  farmersList?: Array<{ id: string; name: string }>;
  groupScore?: number;
  actionHistory?: ActionRecord[];
  disbursementBreakdown?: DisbursementBreakdown;
  simulateMomoNotRegistered?: boolean;
}

export interface ColDef {
  id: Stage;
  label: string;
  dotColor: string;
  ctaLabel: string;
  ctaStages: Stage[];
}

export interface GenericColDef {
  id: string;
  label: string;
  dotColor: string;
}

export type ScoreSort = "default" | "desc" | "asc";

// ---------------------------------------------------------------------------
// Support Fulfilment types
// ---------------------------------------------------------------------------

export type FulfillmentStage = "pending_fulfillment" | "partially_fulfilled" | "fully_fulfilled" | "opted_out";

export interface FarmerFulfillmentRecord {
  id: string;
  name: string;
  received: boolean;
  voiceRecordingDuration?: string;  // farmer recording — proof of receipt
  witnessRecordingDuration?: string; // witness recording — corroboration
  receivedDate?: string;
}

export interface FulfillmentDocument {
  label: string;
  images: string[];  // placeholder identifiers for prototype
}

export interface FulfillmentRequest {
  id: string;
  groupName: string;
  community: string;
  agent: string;
  disbursedDate: string;
  transactionId: string;
  disbursedAmount: number;
  approvedAmountPerFarmer: number;
  approvedSupportType: SupportType;
  fulfillmentStage: FulfillmentStage;
  confirmedFarmers: FarmerFulfillmentRecord[];
  momoNumber: string;
  momoName: string;
  optedOutFarmers?: Array<{ id: string; name: string }>;
  documents?: FulfillmentDocument[];
}
