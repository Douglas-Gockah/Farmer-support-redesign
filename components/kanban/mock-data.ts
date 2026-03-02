// ---------------------------------------------------------------------------
// Mock data — replace with real API calls when connecting a backend
// ---------------------------------------------------------------------------
import type { FarmerRequest } from "./types";

export const MOCK_REQUESTS: FarmerRequest[] = [
  {
    id: "FS-2024-001", date: "12 Jan 2024", agent: "Kofi Mensah", community: "Tamale Metro",
    groupName: "Savannah Growers Union", score: null, stage: "synced", farmers: 22,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: null,
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 120, momoNumber: "0244-567-890", momoName: "Savannah Union GH" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.5 },
    ],
  },
  {
    id: "FS-2024-002", date: "15 Jan 2024", agent: "Ama Owusu", community: "Sawla-Tuna-Kalba",
    groupName: "Northern Fields Cooperative", score: null, stage: "synced", farmers: 18,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: null,
    hasFinancialRecords: true,
    supportInterests: [
      { rank: "Primary",   type: "Ploughing", landSizePerFarmer: 2.0 },
      { rank: "Secondary", type: "Cash",      amountPerFarmer: 100, momoNumber: "0200-123-456", momoName: "Northern Coop" },
    ],
  },
  {
    id: "FS-2024-003", date: "18 Jan 2024", agent: "Yaw Darko", community: "Bole",
    groupName: "Bole Farmers Alliance", score: 62, stage: "pending_approval", farmers: 14,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: null,
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 150, momoNumber: "0551-234-567", momoName: "Bole Alliance" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.0 },
    ],
  },
  {
    id: "FS-2024-004", date: "20 Jan 2024", agent: "Abena Asante", community: "Wa East",
    groupName: "Wa East Crop Circle", score: 78, stage: "pending_approval", farmers: 31,
    onHold: true, holdComment: "MoMo account details need verification from field.", rejectionComment: "", approvedSupportType: null,
    supportInterests: [
      { rank: "Primary",   type: "Ploughing", landSizePerFarmer: 3.0 },
      { rank: "Secondary", type: "Cash",      amountPerFarmer: 200, momoNumber: "0244-987-654", momoName: "WE Crop Circle" },
    ],
  },
  {
    id: "FS-2024-005", date: "10 Jan 2024", agent: "Kwame Boateng", community: "Tamale Metro",
    groupName: "Metro Harvest Group", score: 38, stage: "rejected", farmers: 9,
    onHold: false, holdComment: "", rejectionComment: "Score too low to meet minimum eligibility threshold of 50.", approvedSupportType: null,
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 80,  momoNumber: "0200-000-001", momoName: "Metro Harvest" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 0.5 },
    ],
  },
  {
    id: "FS-2024-006", date: "22 Jan 2024", agent: "Efua Nkrumah", community: "Sawla-Tuna-Kalba",
    groupName: "Kalba Green Initiative", score: 84, stage: "agent_confirmation", farmers: 27,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Cash",
    approvedAmountPerFarmer: 120,
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 120, momoNumber: "0244-111-222", momoName: "Kalba Green" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.5 },
    ],
  },
  {
    id: "FS-2024-007", date: "25 Jan 2024", agent: "Nana Adjei", community: "Bole",
    groupName: "Bole Plough Collective", score: 91, stage: "finance_disbursement", farmers: 16,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Ploughing",
    approvedLandSizePerFarmer: 2.0,
    momoNumber: "0551-777-888", momoName: "Bole Collective",
    supportInterests: [
      { rank: "Primary",   type: "Ploughing", landSizePerFarmer: 2.0 },
      { rank: "Secondary", type: "Cash",      amountPerFarmer: 180, momoNumber: "0551-777-888", momoName: "Bole Collective" },
    ],
  },
  {
    id: "FS-2024-009", date: "26 Jan 2024", agent: "Kofi Mensah", community: "Tamale Metro",
    groupName: "Tamale Pioneer Farmers", score: 75, stage: "finance_disbursement", farmers: 20,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Cash",
    approvedAmountPerFarmer: 150,
    momoNumber: "0244-333-444", momoName: "Tamale Pioneer",
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 150, momoNumber: "0244-333-444", momoName: "Tamale Pioneer" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.2 },
    ],
  },
  {
    id: "FS-2024-008", date: "30 Jan 2024", agent: "Akosua Frimpong", community: "Tamale Metro",
    groupName: "Metro Food Security Group", score: 88, stage: "disbursed", farmers: 34,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Cash",
    approvedAmountPerFarmer: 120,
    momoNumber: "0244-555-666", momoName: "Metro Food Security",
    transactionId: "TXN-4F8A2B1C", disbursedAmount: 4080, disbursedDate: "30 Jan 2024",
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 120, momoNumber: "0244-555-666", momoName: "Metro Food Security" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.0 },
    ],
  },
  {
    id: "FS-2024-010", date: "28 Jan 2024", agent: "Ama Owusu", community: "Wa East",
    groupName: "Wa East Food Coalition", score: 95, stage: "disbursed", farmers: 40,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Cash",
    approvedAmountPerFarmer: 180,
    momoNumber: "0244-999-000", momoName: "WE Food Coalition",
    transactionId: "TXN-7C3D9E2A", disbursedAmount: 7200, disbursedDate: "28 Jan 2024",
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 180, momoNumber: "0244-999-000", momoName: "WE Food Coalition" },
    ],
  },
  {
    id: "FS-2024-011", date: "02 Feb 2024", agent: "Akosua Frimpong", community: "Tamale Metro",
    groupName: "Metro Pioneer Group", score: 80, stage: "opted_out", farmers: 25,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Cash",
    approvedAmountPerFarmer: 120,
    momoNumber: "0244-777-888", momoName: "Metro Pioneer",
    transactionId: "TXN-1A2B3C4D", disbursedAmount: 2640, disbursedDate: "02 Feb 2024",
    optedOutFarmers: ["Rabi Alhassan", "Sana Korawuni", "Azuma Atta", "Doapok Tidow", "Mercy Bakanyin"],
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 120, momoNumber: "0244-777-888", momoName: "Metro Pioneer" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.0 },
    ],
  },
  {
    id: "FS-2024-012", date: "05 Feb 2024", agent: "Yaw Darko", community: "Bole",
    groupName: "Bole United Farmers", score: 88, stage: "opted_out", farmers: 30,
    onHold: false, holdComment: "", rejectionComment: "", approvedSupportType: "Cash",
    approvedAmountPerFarmer: 150,
    momoNumber: "0551-444-555", momoName: "Bole United",
    transactionId: "TXN-5E6F7G8H", disbursedAmount: 4200, disbursedDate: "05 Feb 2024",
    optedOutFarmers: ["Kusohuba Duku", "Shetu Affuro", "Yetama Akuta"],
    supportInterests: [
      { rank: "Primary",   type: "Cash",      amountPerFarmer: 150, momoNumber: "0551-444-555", momoName: "Bole United" },
      { rank: "Secondary", type: "Ploughing", landSizePerFarmer: 1.5 },
    ],
  },
];
