// ---------------------------------------------------------------------------
// Kanban column definitions and static lookup data
// ---------------------------------------------------------------------------
import type { ColDef, GenericColDef } from "./types";

// Flow 1 — Requests & Disbursement
export const COLUMNS: ColDef[] = [
  { id: "synced",               label: "Pending Scoring",        dotColor: "#D97706", ctaLabel: "Score",    ctaStages: ["synced"] },
  { id: "pending_approval",     label: "Pending Approval",       dotColor: "#2563EB", ctaLabel: "Review",   ctaStages: ["pending_approval"] },
  { id: "rejected",             label: "Rejected",               dotColor: "#DC2626", ctaLabel: "",         ctaStages: [] },
  { id: "agent_confirmation",   label: "Manager Confirmation",   dotColor: "#16A34A", ctaLabel: "Confirm",  ctaStages: ["agent_confirmation"] },
  { id: "finance_disbursement", label: "Pending Disbursement",   dotColor: "#7C3AED", ctaLabel: "Disburse", ctaStages: ["finance_disbursement"] },
  { id: "disbursed",            label: "Disbursed",              dotColor: "#6B7280", ctaLabel: "",         ctaStages: [] },
];

// Flow 2 — Support Fulfilment
export const FULFILLMENT_COLUMNS: GenericColDef[] = [
  { id: "pending_fulfillment", label: "Pending Fulfilment",  dotColor: "#7C3AED" },
  { id: "partially_fulfilled", label: "Partially Fulfilled", dotColor: "#F59E0B" },
  { id: "fully_fulfilled",     label: "Fully Fulfilled",     dotColor: "#16A34A" },
  { id: "opted_out",           label: "Cash Opt-Outs",       dotColor: "#F59E0B" },
];

// Flow 3 — Recoveries
export const RECOVERIES_COLUMNS: GenericColDef[] = [
  { id: "rec_pending_review",   label: "Pending Review",      dotColor: "#6B7280" },
  { id: "rec_approved",         label: "Approved",            dotColor: "#16A34A" },
  { id: "rec_rejected",         label: "Rejected",            dotColor: "#DC2626" },
  { id: "rec_pending_recovery", label: "Pending Recovery",    dotColor: "#7C3AED" },
  { id: "rec_partial",          label: "Partially Recovered", dotColor: "#F59E0B" },
  { id: "rec_full",             label: "Fully Recovered",     dotColor: "#059669" },
];

export const AVATAR_COLORS = [
  "#4F46E5", "#0891B2", "#D97706", "#16A34A", "#DC2626", "#7C3AED", "#0D9488",
];

export const SCORE_TILES = [
  { label: "Poor",      score: 25, desc: "Significant gaps in criteria",  border: "#FCA5A5", bg: "#FEF2F2", text: "#DC2626" },
  { label: "Fair",      score: 50, desc: "Meets some requirements",       border: "#FCD34D", bg: "#FFFBEB", text: "#D97706" },
  { label: "Good",      score: 75, desc: "Meets most criteria well",      border: "#93C5FD", bg: "#EFF6FF", text: "#2563EB" },
  { label: "Excellent", score: 95, desc: "Exceeds all scoring criteria",  border: "#86EFAC", bg: "#F0FDF4", text: "#16A34A" },
] as const;

export const DATE_PRESETS = [
  "Today", "Yesterday", "This Week", "Last Week",
  "This Month", "Last Month", "This Year", "Last Year",
];

export const GHANA_REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
  "Greater Accra", "North East", "Northern", "Oti", "Savannah",
  "Upper East", "Upper West", "Volta", "Western", "Western North",
];

export const COMMUNITIES = [
  "Tamale Metro", "Sawla-Tuna-Kalba", "Bole", "Wa East",
  "Sagon", "Lala", "Tonbu", "Cheyohi", "Nkoranza",
  "Buipe", "Tamale", "Wa", "Samini", "Nkoranza North",
];

export const DISTRICTS = [
  "Tamale Metro", "Sawla-Tuna-Kalba", "Bole", "Wa East",
];
