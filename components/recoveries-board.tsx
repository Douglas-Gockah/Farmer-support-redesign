"use client";

import { useState, useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColumnHeader } from "@/components/kanban/column-header";
import { RECOVERIES_COLUMNS } from "@/components/kanban/constants";
import { FilterBar, type ActiveFilters } from "@/components/kanban/filter-bar";
import { presetDates, avatarColor, initials, makeRefCode } from "@/components/kanban/helpers";
import { ActionTimeline } from "@/components/kanban/action-timeline";
import type { ActionRecord } from "@/components/kanban/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const INTEREST_RATE    = 0.05;  // 5% per month
const DEFAULT_PENALTY  = 0.15;  // 15% on cash

// ─── Types ────────────────────────────────────────────────────────────────────

type RecoveryStage =
  | "rec_pending_review"
  | "rec_finance_review"
  | "rec_approved"
  | "rec_rejected"
  | "rec_pending_recovery"
  | "rec_partial"
  | "rec_full";

interface RecoveryRequest {
  id:               string;
  groupName:        string;
  community:        string;
  region:           string;
  district:         string;
  agent:            string;
  farmersSupported: number;
  amountPerFarmer:  number;
  submittedDate:    Date;
  stage:            RecoveryStage;
  disbursedDate:    string;
  transactionId:    string;
  actionHistory?:   ActionRecord[];
  farmersList?:     Array<{ id: string; name: string }>;
  bagWeightKg?:     number;
  wantsDouble?:     boolean;
}

// ─── Mock recovery requests ───────────────────────────────────────────────────
// Derived from fully/partially fulfilled cash support groups

const MOCK_RECOVERY_REQUESTS: RecoveryRequest[] = [
  {
    id: "REC-001", groupName: "Kumbungu Crop Growers",
    community: "Tamale", region: "Northern", district: "Tamale Metro",
    agent: "Kofi Mensah", farmersSupported: 21, amountPerFarmer: 400, bagWeightKg: 100,
    submittedDate: new Date(2025, 11, 15), stage: "rec_pending_review",
    disbursedDate: "15 Aug 2025", transactionId: "TXN-FS-2024-016",
    actionHistory: [
      { id: "r001-1", stage: "synced",              actor: "Douglas Gockah", action: "Scored request",                  summary: "Douglas Gockah assigned a score of 74% to the group",                                                    timestamp: "2025-07-10T09:00:00" },
      { id: "r001-2", stage: "pending_approval",     actor: "Douglas Gockah", action: "Approved cash support",           summary: "Douglas Gockah approved GHS 400/farmer for 21 farmers, totalling GHS 8,400",                            timestamp: "2025-07-12T10:30:00" },
      { id: "r001-3", stage: "agent_confirmation",   actor: "Kofi Mensah",    action: "Confirmed participating farmers", summary: "Kofi Mensah confirmed 21 farmers and submitted MoMo for disbursement",                                   timestamp: "2025-07-20T08:00:00" },
      { id: "r001-4", stage: "finance_disbursement", actor: "Douglas Gockah", action: "Funds disbursed",                 summary: "GHS 8,400 disbursed to group via MoMo · TXN-FS-2024-016",                                               timestamp: "2025-08-15T11:00:00" },
      { id: "r001-5", stage: "disbursed",            actor: "Kofi Mensah",    action: "Fulfilment completed",            summary: "Kofi Mensah confirmed all 21 farmers received their support",                                            timestamp: "2025-10-04T09:15:00" },
      { id: "r001-6", stage: "disbursed",            actor: "Kofi Mensah",    action: "Recovery request submitted",      summary: "Kofi Mensah submitted a recovery request — 21 farmers at GHS 400/farmer",                              timestamp: "2025-12-15T08:30:00" },
    ],
    farmersList: [
      { id: "F101", name: "Abena Owusu" },       { id: "F102", name: "Kweku Asante" },
      { id: "F103", name: "Adwoa Mensah" },      { id: "F104", name: "Kofi Adu" },
      { id: "F105", name: "Akosua Baidoo" },     { id: "F106", name: "Yaw Appiah" },
      { id: "F107", name: "Efua Darko" },        { id: "F108", name: "Nana Boateng" },
      { id: "F109", name: "Ama Frimpong" },      { id: "F110", name: "Kwame Adjei" },
      { id: "F111", name: "Abena Asante" },      { id: "F112", name: "Kojo Mensah" },
      { id: "F113", name: "Akua Boakye" },       { id: "F114", name: "Yaw Amoah" },
      { id: "F115", name: "Efua Nyarko" },       { id: "F116", name: "Nana Bediako" },
      { id: "F117", name: "Ato Agyei" },         { id: "F118", name: "Maama Opoku" },
      { id: "F119", name: "Kwabena Antwi" },     { id: "F120", name: "Adjoa Adusei" },
      { id: "F121", name: "Kofi Kwarteng" },
    ],
  },
  {
    id: "REC-002", groupName: "Jirapa Fields Cooperative",
    community: "Wa", region: "Upper West", district: "Wa East",
    agent: "Ama Owusu", farmersSupported: 20, amountPerFarmer: 400, bagWeightKg: 100,
    submittedDate: new Date(2025, 11, 12), stage: "rec_pending_review",
    disbursedDate: "10 Aug 2025", transactionId: "TXN-FS-2024-022",
    actionHistory: [
      { id: "r002-1", stage: "synced",              actor: "Douglas Gockah", action: "Scored request",                  summary: "Douglas Gockah assigned a score of 66% to the group",                                                    timestamp: "2025-07-05T10:00:00" },
      { id: "r002-2", stage: "pending_approval",     actor: "Douglas Gockah", action: "Approved cash support",           summary: "Douglas Gockah approved GHS 400/farmer for 20 farmers, totalling GHS 8,000",                            timestamp: "2025-07-08T09:00:00" },
      { id: "r002-3", stage: "agent_confirmation",   actor: "Ama Owusu",      action: "Confirmed participating farmers", summary: "Ama Owusu confirmed 20 farmers and submitted MoMo for disbursement",                                     timestamp: "2025-07-18T08:30:00" },
      { id: "r002-4", stage: "finance_disbursement", actor: "Douglas Gockah", action: "Funds disbursed",                 summary: "GHS 8,000 disbursed to group via MoMo · TXN-FS-2024-022",                                               timestamp: "2025-08-10T11:30:00" },
      { id: "r002-5", stage: "disbursed",            actor: "Ama Owusu",      action: "Fulfilment completed",            summary: "Ama Owusu confirmed all 20 farmers received their support",                                              timestamp: "2025-10-12T10:00:00" },
      { id: "r002-6", stage: "disbursed",            actor: "Ama Owusu",      action: "Recovery request submitted",      summary: "Ama Owusu submitted a recovery request — 20 farmers at GHS 400/farmer",                                timestamp: "2025-12-12T09:00:00" },
    ],
    farmersList: [
      { id: "G101", name: "Issaka Mahama" },     { id: "G102", name: "Ramatu Abubakari" },
      { id: "G103", name: "Sumaila Seidu" },     { id: "G104", name: "Fatima Yakubu" },
      { id: "G105", name: "Alhassan Fuseini" },  { id: "G106", name: "Zenabu Dauda" },
      { id: "G107", name: "Amadu Mahama" },      { id: "G108", name: "Bintu Seidu" },
      { id: "G109", name: "Hawa Yakubu" },       { id: "G110", name: "Safiatu Alhassan" },
      { id: "G111", name: "Mariama Dauda" },     { id: "G112", name: "Fatimatu Amadu" },
      { id: "G113", name: "Huseini Baba" },      { id: "G114", name: "Baba Mahama" },
      { id: "G115", name: "Issaka Seidu" },      { id: "G116", name: "Ramatu Yakubu" },
      { id: "G117", name: "Sumaila Alhassan" },  { id: "G118", name: "Fatima Dauda" },
      { id: "G119", name: "Alhassan Amadu" },    { id: "G120", name: "Zenabu Baba" },
    ],
  },
  {
    id: "REC-003", groupName: "Bole Agri Cooperative",
    community: "Bole", region: "Savannah", district: "Bole",
    agent: "Kwame Asante", farmersSupported: 14, amountPerFarmer: 600, bagWeightKg: 100, wantsDouble: true,
    submittedDate: new Date(2025, 11, 10), stage: "rec_pending_review",
    disbursedDate: "5 Sep 2025", transactionId: "TXN-FS-2024-014",
    actionHistory: [
      { id: "r003-1", stage: "synced",              actor: "Douglas Gockah", action: "Scored request",                  summary: "Douglas Gockah assigned a score of 80% to the group",                                                    timestamp: "2025-08-01T09:30:00" },
      { id: "r003-2", stage: "pending_approval",     actor: "Douglas Gockah", action: "Approved cash support",           summary: "Douglas Gockah approved GHS 600/farmer for 14 farmers, totalling GHS 8,400",                            timestamp: "2025-08-04T10:00:00" },
      { id: "r003-3", stage: "agent_confirmation",   actor: "Kwame Asante",   action: "Confirmed participating farmers", summary: "Kwame Asante confirmed 14 farmers and submitted MoMo for disbursement",                                   timestamp: "2025-08-15T08:00:00" },
      { id: "r003-4", stage: "finance_disbursement", actor: "Douglas Gockah", action: "Funds disbursed",                 summary: "GHS 8,400 disbursed to group via MoMo · TXN-FS-2024-014",                                               timestamp: "2025-09-05T11:00:00" },
      { id: "r003-5", stage: "disbursed",            actor: "Kwame Asante",   action: "Fulfilment completed",            summary: "Kwame Asante confirmed all 14 farmers received their support",                                           timestamp: "2025-10-20T09:30:00" },
      { id: "r003-6", stage: "disbursed",            actor: "Kwame Asante",   action: "Recovery request submitted",      summary: "Kwame Asante submitted a recovery request — 14 farmers at GHS 600/farmer",                             timestamp: "2025-12-10T08:45:00" },
    ],
    farmersList: [
      { id: "H101", name: "Bawah Naabu" },       { id: "H102", name: "Asana Tampuri" },
      { id: "H103", name: "Seidu Wumbei" },      { id: "H104", name: "Ayisha Fuseini" },
      { id: "H105", name: "Dauda Ziblim" },      { id: "H106", name: "Memunatu Abukari" },
      { id: "H107", name: "Yakubu Alhassan" },   { id: "H108", name: "Rahinatu Mahama" },
      { id: "H109", name: "Sulley Abdulai" },    { id: "H110", name: "Fati Iddrisu" },
      { id: "H111", name: "Habiba Issah" },      { id: "H112", name: "Aminu Bawah" },
      { id: "H113", name: "Zuwera Naabu" },      { id: "H114", name: "Alimatu Seidu" },
    ],
  },
  {
    id: "REC-004", groupName: "Tolon Cooperative Society",
    community: "Tamale", region: "Northern", district: "Tamale Metro",
    agent: "Akosua Boateng", farmersSupported: 28, amountPerFarmer: 500, bagWeightKg: 100,
    submittedDate: new Date(2025, 11, 8), stage: "rec_pending_review",
    disbursedDate: "12 Sep 2025", transactionId: "TXN-FS-2024-015",
    actionHistory: [
      { id: "r004-1", stage: "synced",              actor: "Douglas Gockah",  action: "Scored request",                  summary: "Douglas Gockah assigned a score of 87% to the group",                                                    timestamp: "2025-08-05T09:00:00" },
      { id: "r004-2", stage: "pending_approval",     actor: "Douglas Gockah",  action: "Approved cash support",           summary: "Douglas Gockah approved GHS 500/farmer for 28 farmers, totalling GHS 14,000",                           timestamp: "2025-08-08T10:30:00" },
      { id: "r004-3", stage: "agent_confirmation",   actor: "Akosua Boateng",  action: "Confirmed participating farmers", summary: "Akosua Boateng confirmed 28 farmers and submitted MoMo for disbursement",                                  timestamp: "2025-08-20T08:15:00" },
      { id: "r004-4", stage: "finance_disbursement", actor: "Douglas Gockah",  action: "Funds disbursed",                 summary: "GHS 14,000 disbursed to group via MoMo · TXN-FS-2024-015",                                              timestamp: "2025-09-12T11:00:00" },
      { id: "r004-5", stage: "disbursed",            actor: "Akosua Boateng",  action: "Fulfilment completed",            summary: "Akosua Boateng confirmed all 28 farmers received their support",                                         timestamp: "2025-10-28T10:00:00" },
      { id: "r004-6", stage: "disbursed",            actor: "Akosua Boateng",  action: "Recovery request submitted",      summary: "Akosua Boateng submitted a recovery request — 28 farmers at GHS 500/farmer",                           timestamp: "2025-12-08T09:00:00" },
    ],
    farmersList: [
      { id: "T101", name: "Ama Mensah" },        { id: "T102", name: "Kofi Asante" },
      { id: "T103", name: "Akua Boateng" },      { id: "T104", name: "Yaw Amoah" },
      { id: "T105", name: "Abena Darko" },       { id: "T106", name: "Kwame Appiah" },
      { id: "T107", name: "Adwoa Acheampong" },  { id: "T108", name: "Kwesi Ofori" },
      { id: "T109", name: "Afua Frimpong" },     { id: "T110", name: "Kojo Adjei" },
      { id: "T111", name: "Akosua Asare" },      { id: "T112", name: "Nana Boakye" },
      { id: "T113", name: "Efua Antwi" },        { id: "T114", name: "Ato Nyarko" },
      { id: "T115", name: "Maama Bediako" },     { id: "T116", name: "Yaa Agyei" },
      { id: "T117", name: "Kwabena Opoku" },     { id: "T118", name: "Adjoa Adusei" },
      { id: "T119", name: "Kofi Kwarteng" },     { id: "T120", name: "Esi Mensah" },
      { id: "T121", name: "Akua Owusu" },        { id: "T122", name: "Yaw Darko" },
      { id: "T123", name: "Kwame Asante" },      { id: "T124", name: "Abena Boateng" },
      { id: "T125", name: "Kwesi Amoah" },       { id: "T126", name: "Adwoa Frimpong" },
      { id: "T127", name: "Kojo Appiah" },       { id: "T128", name: "Akosua Adjei" },
    ],
  },
];

const ALL_RECOVERY_AGENTS = [...new Set(MOCK_RECOVERY_REQUESTS.map((r) => r.agent))].sort();

const DEFAULT_FILTERS: ActiveFilters = {
  search: "", community: null, region: null, district: null, agent: null, datePreset: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtShort(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function toInputValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseInputDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ─── Recovery Request Card ────────────────────────────────────────────────────

function RecoveryCard({
  req,
  onReview,
}: {
  req: RecoveryRequest;
  onReview: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const agentColor    = avatarColor(req.agent);
  const agentInitials = initials(req.agent);
  const agentDisplay  = req.agent.split(" ").slice(0, 2).join(" ");
  const refCode       = makeRefCode(fmtShort(req.submittedDate), req.id, req.agent);

  return (
    <div
      style={{
        background:   "#ffffff",
        borderRadius: "12px",
        border:       "1px solid var(--gray-200)",
        boxShadow:    hovered ? "0px 4px 16px rgba(16,24,40,0.10)" : "0px 1px 3px rgba(16,24,40,0.06)",
        transform:    hovered ? "translateY(-2px)" : "none",
        transition:   "box-shadow 0.2s, transform 0.2s",
        marginBottom: 10,
        cursor:       "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onReview}
    >
      <div style={{ padding: "16px" }}>

        {/* Group name */}
        <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--gray-900)", lineHeight: 1.3, marginBottom: 2 }}>
          {req.groupName}
        </p>

        {/* Community · farmers */}
        <p style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginBottom: 10 }}>
          {req.community} · {req.farmersSupported} farmers supported
        </p>

        {/* Cash support pill */}
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "3px 8px", borderRadius: 20,
            background: "var(--green-50)", color: "var(--green-600)",
            fontSize: "0.6875rem", fontWeight: 600,
          }}>
            Cash support
          </span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--gray-100)", marginBottom: 12 }} />

        {/* Agent row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                background: agentColor, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.625rem", fontWeight: 700,
              }}
            >
              {agentInitials}
            </span>
            <span style={{ maxWidth: 130, fontSize: "0.75rem", fontWeight: 500, color: "var(--gray-600)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {agentDisplay}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.6875rem", fontWeight: 500, color: "var(--gray-500)" }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 1v2M9 1v2M1 6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {fmtShort(req.submittedDate)}
          </div>
        </div>

        {/* Monospace ref ID */}
        <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", color: "var(--gray-400)", marginBottom: 12 }}>
          {refCode}
        </p>

        {/* Full-width Review CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onReview(); }}
          style={{
            width: "100%", height: 36, borderRadius: 8,
            border: "none", background: "var(--green-600)",
            color: "#fff", fontSize: "0.875rem", fontWeight: 600,
            cursor: "pointer", transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--green-700, #15803d)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--green-600)")}
        >
          Review
        </button>
      </div>
    </div>
  );
}

// ─── Farmer List Accordion (for recovery modal left panel) ───────────────────

function FarmerListAccordion({ farmers }: { farmers: Array<{ id: string; name: string }> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--gray-100)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
        style={{ background: open ? "var(--gray-50)" : "#fff" }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "var(--gray-400)" }}>
            <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="11" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M1 14c0-3 2.2-5 5-5h1c2.8 0 5 2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M13 10c2 0 3 1 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Farmers supported</span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
            style={{ background: "var(--gray-100)", color: "var(--gray-500)" }}
          >
            {farmers.length}
          </span>
        </div>
        <svg
          width="13" height="13" viewBox="0 0 13 13" fill="none"
          style={{
            color: "var(--gray-400)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        >
          <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--gray-100)" }}>
          {farmers.map((f, idx) => {
            const color = avatarColor(f.name);
            const ini   = initials(f.name);
            const isLast = idx === farmers.length - 1;
            return (
              <div
                key={f.id}
                className="flex items-center gap-2.5 px-3 py-2"
                style={{ borderBottom: isLast ? "none" : "1px solid var(--gray-100)" }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ background: color, fontSize: "0.5625rem", fontWeight: 700 }}
                >
                  {ini}
                </span>
                <span className="text-[12px] font-medium text-gray-800 flex-1 truncate">{f.name}</span>
                <span className="text-[10px] font-mono text-gray-400 shrink-0">{f.id}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Recovery Approval Modal ──────────────────────────────────────────────────

function RecoveryApprovalModal({
  req,
  onClose,
  onApprove,
}: {
  req: RecoveryRequest;
  onClose: () => void;
  onApprove: (id: string, unitPrice: number, purchasePrice: number) => void;
}) {
  const [unitPriceStr,     setUnitPriceStr]     = useState("0.00");
  const [purchasePriceStr, setPurchasePriceStr] = useState("0.00");
  const [confirmed,        setConfirmed]        = useState(false);

  const unitPrice       = parseFloat(unitPriceStr) || 0;
  const hasValidPrice   = unitPrice > 0;
  const canApprove      = confirmed && hasValidPrice;
  const totalAmount     = req.farmersSupported * req.amountPerFarmer;
  const bagWeightKg     = req.bagWeightKg ?? 100;
  const wantsDouble     = req.wantsDouble ?? false;
  const bagsExpected    = wantsDouble ? 2 : 1;
  const bagValue        = hasValidPrice ? unitPrice * bagWeightKg : null;
  const totalBagValue   = hasValidPrice ? bagValue! * bagsExpected : null;
  const recoveryValue   = req.amountPerFarmer * (1 + DEFAULT_PENALTY);

  const agentColor    = avatarColor(req.agent);
  const agentInitials = initials(req.agent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: "min(960px, 95vw)", maxHeight: "92vh", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">Recovery request</h2>
            <p className="text-[12px] font-medium text-gray-400 mt-0.5">
              Review the group details and set the unit price for recovery
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body: two columns */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">

          {/* Mobile context strip */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div>
              <p className="text-[13px] font-bold text-gray-900">{req.groupName}</p>
              <p className="text-[11px] text-gray-500">{req.community} · {req.farmersSupported} farmers</p>
            </div>
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
              style={{ background: "var(--green-50)", color: "var(--green-600)" }}
            >
              Cash support
            </span>
          </div>

          {/* Left panel — group context */}
          <div
            className="hidden md:flex flex-col gap-5 shrink-0 overflow-y-auto"
            style={{ width: 310, borderRight: "1px solid var(--gray-100)", padding: "22px 20px 22px 24px" }}
          >
            {/* GROUP */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</p>
              <p className="text-[15px] font-bold text-gray-900 leading-snug">{req.groupName}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{req.community}</p>
            </div>

            {/* Stats tiles */}
            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                <p className="text-[10px] text-gray-400 mb-0.5">Farmers supported</p>
                <p className="text-[20px] font-bold text-gray-900">{req.farmersSupported}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                <p className="text-[10px] text-gray-400 mb-0.5">Pre-financing per Farmer</p>
                <p className="text-[20px] font-bold text-gray-900">GHS {req.amountPerFarmer.toFixed(2)}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                <p className="text-[10px] text-gray-400 mb-0.5">Total Disbursed Pre-financing</p>
                <p className="text-[20px] font-bold text-gray-900">GHS {totalAmount.toLocaleString("en-GH")}</p>
              </div>
            </div>

            {/* DISBURSEMENT */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {([
                  { label: "Transaction ID", value: req.transactionId },
                  { label: "Date disbursed",  value: req.disbursedDate },
                  { label: "Total amount",    value: `GHS ${totalAmount.toLocaleString("en-GH")}` },
                  { label: "Per farmer",      value: `GHS ${req.amountPerFarmer.toFixed(2)}` },
                ] as { label: string; value: string }[]).map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-3 py-2.5"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--gray-100)" : "none" }}
                  >
                    <span className="text-[11px] text-gray-400">{label}</span>
                    <span className="text-[12px] font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FIELD AGENT */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Agent</p>
              <div className="flex items-center gap-2.5">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                  style={{ background: agentColor }}
                >
                  {agentInitials}
                </span>
                <p className="text-[13px] font-semibold text-gray-800">{req.agent}</p>
              </div>
            </div>

            {/* FARMERS SUPPORTED */}
            {req.farmersList && req.farmersList.length > 0 && (
              <div>
                <FarmerListAccordion farmers={req.farmersList} />
              </div>
            )}

            {/* APPROVAL TIMELINE (accordion, collapsed by default) */}
            {req.actionHistory && req.actionHistory.length > 0 && (
              <div>
                <ActionTimeline records={req.actionHistory} accordion />
              </div>
            )}
          </div>

          {/* Right panel — action area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Rate tiles */}
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Applicable rates
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {/* Interest rate tile */}
                  <div style={{ borderRadius: 12, border: "1px solid #fde68a", background: "#fffbeb", padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke="#d97706" strokeWidth="1.5" />
                          <path d="M8 5v4M8 11v.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em" }}>Interest rate</span>
                    </div>
                    <p style={{ fontSize: "1.375rem", fontWeight: 800, color: "#92400e", margin: 0, lineHeight: 1 }}>{INTEREST_RATE * 100}%</p>
                    <p style={{ fontSize: "0.75rem", color: "#b45309", margin: "4px 0 0", fontWeight: 500 }}>per month</p>
                  </div>
                  {/* Default penalty tile */}
                  <div style={{ borderRadius: 12, border: "1px solid #fecaca", background: "#fff5f5", padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 2L2 13h12L8 2z" stroke="#dc2626" strokeWidth="1.5" strokeLinejoin="round" />
                          <path d="M8 7v3M8 11.5v.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.05em" }}>Default penalty</span>
                    </div>
                    <p style={{ fontSize: "1.375rem", fontWeight: 800, color: "#7f1d1d", margin: 0, lineHeight: 1 }}>{DEFAULT_PENALTY * 100}%</p>
                    <p style={{ fontSize: "0.75rem", color: "#b91c1c", margin: "4px 0 0", fontWeight: 500 }}>on cash disbursed</p>
                  </div>
                </div>
              </div>

              {/* Recovery unit price input */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: 2 }}>
                  Recovery unit price (GHS per kg)
                </label>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 8 }}>
                  Price used to calculate the commodity value for bag recovery
                </p>
                <div style={{
                  display: "flex", height: 48,
                  border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    paddingLeft: 14, paddingRight: 14,
                    borderRight: "1px solid #e5e7eb", background: "#f9fafb",
                    fontSize: "0.875rem", fontWeight: 500, color: "#6b7280",
                    flexShrink: 0,
                  }}>
                    GHS
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPriceStr}
                    onChange={(e) => setUnitPriceStr(e.target.value)}
                    style={{
                      flex: 1, paddingLeft: 14, paddingRight: 14,
                      border: "none", outline: "none",
                      fontSize: "0.9375rem", color: "#111827", background: "transparent",
                    }}
                  />
                </div>
              </div>

              {/* Bag recovery calculation */}
              {hasValidPrice && bagValue !== null && totalBagValue !== null && (
                <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  {/* Card header */}
                  <div style={{ padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                      Bag Recovery Calculation
                    </p>
                  </div>
                  {/* Rows */}
                  <div style={{ padding: "4px 0" }}>
                    {/* Expected bag weight */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6" }}>
                      <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Expected bag weight</span>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827" }}>{bagWeightKg} kg / bag</span>
                    </div>
                    {/* Value of one bag */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6" }}>
                      <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                        Value of 1 bag&nbsp;
                        <span style={{ color: "#9ca3af" }}>({bagWeightKg} kg × GHS {unitPrice.toFixed(2)})</span>
                      </span>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827" }}>
                        GHS {bagValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {/* Bags expected — always show, highlight double */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6", background: wantsDouble ? "#fffbeb" : "transparent" }}>
                      <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Bags expected per farmer</span>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: wantsDouble ? "#d97706" : "#111827" }}>
                        {bagsExpected} bag{bagsExpected > 1 ? "s" : ""}
                        {wantsDouble && <span style={{ fontWeight: 500, marginLeft: 6, fontSize: "0.75rem" }}>(double amount opted)</span>}
                      </span>
                    </div>
                    {/* Total recovery per farmer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: "#f0fdf4" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>
                        Total recovery per farmer
                      </span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#16a34a" }}>
                        GHS {totalBagValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchasing price input */}
              <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                    Extra Commodity Purchase Price
                  </p>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 12, lineHeight: 1.5 }}>
                    Set the price field agents should use when buying any <strong style={{ color: "#374151" }}>extra commodity</strong> from farmers who want to sell beyond the recovery quantity.
                  </p>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    Purchasing price (GHS per kg)
                  </label>
                  <div style={{
                    display: "flex", height: 48,
                    border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center",
                      paddingLeft: 14, paddingRight: 14,
                      borderRight: "1px solid #e5e7eb", background: "#f9fafb",
                      fontSize: "0.875rem", fontWeight: 500, color: "#6b7280",
                      flexShrink: 0,
                    }}>
                      GHS
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={purchasePriceStr}
                      onChange={(e) => setPurchasePriceStr(e.target.value)}
                      style={{
                        flex: 1, paddingLeft: 14, paddingRight: 14,
                        border: "none", outline: "none",
                        fontSize: "0.9375rem", color: "#111827", background: "transparent",
                      }}
                    />
                  </div>
                  {parseFloat(purchasePriceStr) > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" fill="#dcfce7" />
                        <path d="M5 8l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 500 }}>
                        GHS {parseFloat(purchasePriceStr).toFixed(2)} / kg set for extra purchases
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation checkbox */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <div
                  style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
                    border: `2px solid ${confirmed ? "#16a34a" : "#d1d5db"}`,
                    background: confirmed ? "#16a34a" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.12s, border-color 0.12s",
                  }}
                  onClick={() => setConfirmed((v) => !v)}
                >
                  {confirmed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.5, userSelect: "none" }}>
                  I have reviewed the details of this request and confirm my decision to proceed with approval.
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="h-9 px-5 rounded-lg border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!canApprove}
                onClick={() => { if (canApprove) onApprove(req.id, unitPrice, parseFloat(purchasePriceStr) || 0); }}
                className="h-9 px-6 rounded-lg text-[13px] font-bold transition-colors"
                style={{
                  background: canApprove ? "#16a34a" : "#e5e7eb",
                  color:      canApprove ? "#fff"    : "#9ca3af",
                  cursor:     canApprove ? "pointer" : "not-allowed",
                }}
                onMouseEnter={(e) => { if (canApprove) e.currentTarget.style.background = "#15803d"; }}
                onMouseLeave={(e) => { if (canApprove) e.currentTarget.style.background = canApprove ? "#16a34a" : "#e5e7eb"; }}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Finance Review Modal ─────────────────────────────────────────────────────

function FinanceReviewModal({
  req,
  approvedUnitPrice,
  approvedPurchasePrice,
  onClose,
  onActivate,
}: {
  req: RecoveryRequest;
  approvedUnitPrice: number;
  approvedPurchasePrice: number;
  onClose: () => void;
  onActivate: (id: string, finalPurchasePrice: number, comment: string) => void;
}) {
  const [purchasePriceStr, setPurchasePriceStr] = useState(
    approvedPurchasePrice > 0 ? approvedPurchasePrice.toFixed(2) : "0.00"
  );
  const [comment, setComment] = useState("");

  const finalPurchasePrice = parseFloat(purchasePriceStr) || 0;
  const priceChanged       = Math.abs(finalPurchasePrice - approvedPurchasePrice) > 0.001;
  const canActivate        = !priceChanged || comment.trim().length > 0;

  const totalAmount  = req.farmersSupported * req.amountPerFarmer;
  const bagWeightKg  = req.bagWeightKg ?? 100;
  const wantsDouble  = req.wantsDouble ?? false;
  const bagsExpected = wantsDouble ? 2 : 1;
  const bagValue     = approvedUnitPrice * bagWeightKg;
  const totalBagValue = bagValue * bagsExpected;

  const agentColor    = avatarColor(req.agent);
  const agentInitials = initials(req.agent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: "min(960px, 95vw)", maxHeight: "92vh", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h8M2 12h5" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="13" cy="11" r="2.5" stroke="#2563eb" strokeWidth="1.4" />
                <path d="M13 9.8V11l.8.8" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">Finance review</h2>
              <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                Review and verify the recovery parameters before activation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body: two columns */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">

          {/* Mobile strip */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div>
              <p className="text-[13px] font-bold text-gray-900">{req.groupName}</p>
              <p className="text-[11px] text-gray-500">{req.community} · {req.farmersSupported} farmers</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0" style={{ background: "var(--green-50)", color: "var(--green-600)" }}>
              Cash support
            </span>
          </div>

          {/* Left panel — read-only context */}
          <div
            className="hidden md:flex flex-col gap-5 shrink-0 overflow-y-auto min-h-0"
            style={{ width: 310, borderRight: "1px solid var(--gray-100)", padding: "22px 20px 22px 24px" }}
          >
            {/* Group */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</p>
              <p className="text-[15px] font-bold text-gray-900 leading-snug">{req.groupName}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{req.community}</p>
            </div>

            {/* Stats tiles */}
            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                <p className="text-[10px] text-gray-400 mb-0.5">Farmers supported</p>
                <p className="text-[20px] font-bold text-gray-900">{req.farmersSupported}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                <p className="text-[10px] text-gray-400 mb-0.5">Pre-financing per Farmer</p>
                <p className="text-[20px] font-bold text-gray-900">GHS {req.amountPerFarmer.toFixed(2)}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                <p className="text-[10px] text-gray-400 mb-0.5">Total Disbursed Pre-financing</p>
                <p className="text-[20px] font-bold text-gray-900">GHS {totalAmount.toLocaleString("en-GH")}</p>
              </div>
            </div>

            {/* Disbursement */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {([
                  { label: "Transaction ID", value: req.transactionId },
                  { label: "Date disbursed",  value: req.disbursedDate },
                  { label: "Total amount",    value: `GHS ${totalAmount.toLocaleString("en-GH")}` },
                  { label: "Per farmer",      value: `GHS ${req.amountPerFarmer.toFixed(2)}` },
                ] as { label: string; value: string }[]).map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-3 py-2.5"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--gray-100)" : "none" }}
                  >
                    <span className="text-[11px] text-gray-400">{label}</span>
                    <span className="text-[12px] font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Agent */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Agent</p>
              <div className="flex items-center gap-2.5">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                  style={{ background: agentColor }}
                >
                  {agentInitials}
                </span>
                <p className="text-[13px] font-semibold text-gray-800">{req.agent}</p>
              </div>
            </div>

            {/* Farmers accordion */}
            {req.farmersList && req.farmersList.length > 0 && (
              <div>
                <FarmerListAccordion farmers={req.farmersList} />
              </div>
            )}

            {/* Action timeline */}
            {req.actionHistory && req.actionHistory.length > 0 && (
              <div>
                <ActionTimeline records={req.actionHistory} accordion />
              </div>
            )}
          </div>

          {/* Right panel — finance review actions */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Applicable rates (read-only) */}
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Applicable rates
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ borderRadius: 12, border: "1px solid #fde68a", background: "#fffbeb", padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke="#d97706" strokeWidth="1.5" />
                          <path d="M8 5v4M8 11v.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em" }}>Interest rate</span>
                    </div>
                    <p style={{ fontSize: "1.375rem", fontWeight: 800, color: "#92400e", margin: 0, lineHeight: 1 }}>{INTEREST_RATE * 100}%</p>
                    <p style={{ fontSize: "0.75rem", color: "#b45309", margin: "4px 0 0", fontWeight: 500 }}>per month</p>
                  </div>
                  <div style={{ borderRadius: 12, border: "1px solid #fecaca", background: "#fff5f5", padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 2L2 13h12L8 2z" stroke="#dc2626" strokeWidth="1.5" strokeLinejoin="round" />
                          <path d="M8 7v3M8 11.5v.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.05em" }}>Default penalty</span>
                    </div>
                    <p style={{ fontSize: "1.375rem", fontWeight: 800, color: "#7f1d1d", margin: 0, lineHeight: 1 }}>{DEFAULT_PENALTY * 100}%</p>
                    <p style={{ fontSize: "0.75rem", color: "#b91c1c", margin: "4px 0 0", fontWeight: 500 }}>on cash disbursed</p>
                  </div>
                </div>
              </div>

              {/* Recovery unit price — read-only */}
              <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                    Recovery Unit Price (set by manager)
                  </p>
                </div>
                <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Price per kg</span>
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                    GHS {approvedUnitPrice.toFixed(2)}<span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", marginLeft: 4 }}>/ kg</span>
                  </span>
                </div>
              </div>

              {/* Bag recovery calculation — read-only */}
              <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                    Bag Recovery Calculation
                  </p>
                </div>
                <div style={{ padding: "4px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Expected bag weight</span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827" }}>{bagWeightKg} kg / bag</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                      Value of 1 bag&nbsp;
                      <span style={{ color: "#9ca3af" }}>({bagWeightKg} kg × GHS {approvedUnitPrice.toFixed(2)})</span>
                    </span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827" }}>
                      GHS {bagValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6", background: wantsDouble ? "#fffbeb" : "transparent" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Bags expected per farmer</span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: wantsDouble ? "#d97706" : "#111827" }}>
                      {bagsExpected} bag{bagsExpected > 1 ? "s" : ""}
                      {wantsDouble && <span style={{ fontWeight: 500, marginLeft: 6, fontSize: "0.75rem" }}>(double amount opted)</span>}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: "#f0fdf4" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>Total recovery per farmer</span>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#16a34a" }}>
                      GHS {totalBagValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extra commodity purchase price — editable */}
              <div style={{ borderRadius: 12, border: priceChanged ? "1px solid #bfdbfe" : "1px solid #e5e7eb", overflow: "hidden", transition: "border-color 0.15s" }}>
                <div style={{ padding: "10px 16px", background: priceChanged ? "#eff6ff" : "#f9fafb", borderBottom: priceChanged ? "1px solid #bfdbfe" : "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background 0.15s" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: priceChanged ? "#1d4ed8" : "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                    Extra Commodity Purchase Price
                  </p>
                  {priceChanged && (
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#2563eb", background: "#dbeafe", padding: "2px 8px", borderRadius: 20 }}>
                      Modified
                    </span>
                  )}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, lineHeight: 1.5 }}>
                    Manager set: <strong style={{ color: "#374151" }}>
                      {approvedPurchasePrice > 0 ? `GHS ${approvedPurchasePrice.toFixed(2)} / kg` : "Not set"}
                    </strong>
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 12, lineHeight: 1.5 }}>
                    Adjust if needed. Field agents will use this price when recording surplus purchases from farmers.
                  </p>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    Purchasing price (GHS per kg)
                  </label>
                  <div style={{ display: "flex", height: 48, border: `1.5px solid ${priceChanged ? "#93c5fd" : "#e5e7eb"}`, borderRadius: 10, overflow: "hidden", transition: "border-color 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", paddingLeft: 14, paddingRight: 14, borderRight: `1px solid ${priceChanged ? "#bfdbfe" : "#e5e7eb"}`, background: "#f9fafb", fontSize: "0.875rem", fontWeight: 500, color: "#6b7280", flexShrink: 0 }}>
                      GHS
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={purchasePriceStr}
                      onChange={(e) => { setPurchasePriceStr(e.target.value); if (comment) setComment(""); }}
                      style={{ flex: 1, paddingLeft: 14, paddingRight: 14, border: "none", outline: "none", fontSize: "0.9375rem", color: "#111827", background: "transparent" }}
                    />
                  </div>

                  {/* Comment required when price is changed */}
                  {priceChanged && (
                    <div style={{ marginTop: 14 }}>
                      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>
                        Reason for adjustment <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Explain why the purchase price was adjusted…"
                        rows={3}
                        style={{
                          width: "100%", borderRadius: 10,
                          border: comment.trim() ? "1.5px solid #93c5fd" : "1.5px solid #fca5a5",
                          padding: "10px 12px",
                          fontSize: "0.875rem", color: "#374151",
                          outline: "none", resize: "vertical", boxSizing: "border-box",
                          lineHeight: 1.5,
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = comment.trim() ? "#93c5fd" : "#fca5a5")}
                      />
                      {!comment.trim() && (
                        <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: 4 }}>
                          A comment is required when updating the purchase price.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-2">
              <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                {priceChanged && !comment.trim()
                  ? "Add a comment to proceed with the adjusted price"
                  : "Review complete — activate to notify field agents"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="h-9 px-5 rounded-lg border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!canActivate}
                  onClick={() => { if (canActivate) onActivate(req.id, finalPurchasePrice, comment.trim()); }}
                  className="h-9 px-6 rounded-lg text-[13px] font-bold transition-colors flex items-center gap-2"
                  style={{
                    background: canActivate ? "#2563eb" : "#e5e7eb",
                    color:      canActivate ? "#fff"    : "#9ca3af",
                    cursor:     canActivate ? "pointer" : "not-allowed",
                  }}
                  onMouseEnter={(e) => { if (canActivate) e.currentTarget.style.background = "#1d4ed8"; }}
                  onMouseLeave={(e) => { if (canActivate) e.currentTarget.style.background = canActivate ? "#2563eb" : "#e5e7eb"; }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Activate recovery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Set Timeframe Modal ──────────────────────────────────────────────────────

function SetTimeframeModal({
  current,
  onConfirm,
  onClose,
}: {
  current: { start: Date; end: Date } | null;
  onConfirm: (start: Date, end: Date) => void;
  onClose: () => void;
}) {
  const [startVal, setStartVal] = useState(current ? toInputValue(current.start) : "");
  const [endVal,   setEndVal]   = useState(current ? toInputValue(current.end)   : "");
  const [error,    setError]    = useState<string | null>(null);

  function handleConfirm() {
    if (!startVal || !endVal) { setError("Please select both a start and end date."); return; }
    const s = parseInputDate(startVal);
    const e = parseInputDate(endVal);
    if (e <= s) { setError("End date must be after the start date."); return; }
    onConfirm(s, e);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28,
        width: "100%", maxWidth: 440,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2" width="14" height="13" rx="2.5" stroke="#16a34a" strokeWidth="1.5"/>
                <path d="M5 1v2.5M11 1v2.5M1 6.5h14" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="5.5" cy="10.5" r="0.9" fill="#16a34a"/>
                <circle cx="8"   cy="10.5" r="0.9" fill="#16a34a"/>
                <circle cx="10.5" cy="10.5" r="0.9" fill="#16a34a"/>
              </svg>
            </div>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0 }}>
              Set Recovery Timeframe
            </p>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#6b7280", lineHeight: 1.55, margin: 0 }}>
            Define the start and end date for the active recovery period.
            Field agents will be notified via the mobile app once confirmed.
          </p>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 12px", borderRadius: 8,
          background: "#eff6ff", border: "1px solid #bfdbfe", marginBottom: 20,
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <rect x="4" y="1" width="8" height="13" rx="2" stroke="#3b82f6" strokeWidth="1.4"/>
            <line x1="8" y1="11.5" x2="8" y2="11.5" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="6.5" y1="3" x2="9.5" y2="3" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 500 }}>
            This will trigger a recovery banner on field agents' mobile app.
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: error ? 10 : 22 }}>
          {[
            { label: "Start date", val: startVal, set: (v: string) => { setStartVal(v); setError(null); }, min: undefined },
            { label: "End date",   val: endVal,   set: (v: string) => { setEndVal(v);   setError(null); }, min: startVal || undefined },
          ].map(({ label, val, set, min }) => (
            <div key={label} style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {label}
              </label>
              <input
                type="date" value={val} min={min}
                onChange={(e) => set(e.target.value)}
                style={{
                  width: "100%", height: 40,
                  paddingLeft: 12, paddingRight: 12,
                  borderRadius: 8, border: "1.5px solid #d1d5db",
                  fontSize: "0.875rem", color: "#374151",
                  outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#16a34a")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "#d1d5db")}
              />
            </div>
          ))}
        </div>

        {error && (
          <p style={{ fontSize: "0.75rem", color: "var(--error-600)", marginBottom: 16, marginTop: -6 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, height: 40, borderRadius: 8,
              border: "1.5px solid #e5e7eb", background: "#fff",
              fontSize: "0.875rem", fontWeight: 600, color: "#374151", cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1, height: 40, borderRadius: 8,
              border: "none", background: "#16a34a",
              fontSize: "0.875rem", fontWeight: 600, color: "#fff", cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#15803d")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#16a34a")}
          >
            Confirm timeframe
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Recovery Timeframe Banner ────────────────────────────────────────────────

function RecoveryBanner({
  start, end,
}: { start: Date; end: Date }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const endDay = new Date(end); endDay.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isExpired    = daysLeft < 0;
  const isEndingSoon = !isExpired && daysLeft <= 3;

  const dotColor  = isExpired ? "#ef4444" : isEndingSoon ? "#f59e0b" : "#16a34a";
  const bgColor   = isExpired ? "#fef2f2" : isEndingSoon ? "#fffbeb" : "#f0fdf4";
  const bdColor   = isExpired ? "#fecaca" : isEndingSoon ? "#fde68a" : "#bbf7d0";
  const headColor = isExpired ? "#991b1b" : isEndingSoon ? "#92400e" : "#14532d";
  const subColor  = isExpired ? "#dc2626" : isEndingSoon ? "#b45309" : "#16a34a";
  const btnBorder = isExpired ? "#fca5a5" : isEndingSoon ? "#fcd34d" : "#86efac";
  const btnColor  = isExpired ? "#991b1b" : isEndingSoon ? "#92400e" : "#15803d";

  const label = isExpired
    ? "Recovery period has ended"
    : daysLeft === 0
      ? "Recoveries in progress · Last day"
      : `Recoveries in progress · ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`;

  return (
    <div
      className="flex items-center gap-3 shrink-0"
      style={{ padding: "14px 20px", background: bgColor, borderBottom: `1px solid ${bdColor}` }}
    >
      <span className="relative flex shrink-0" style={{ width: 10, height: 10 }}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: dotColor, opacity: 0.5 }} />
        <span className="relative inline-flex rounded-full" style={{ width: 10, height: 10, background: dotColor }} />
      </span>

      <div className="flex-1 flex items-baseline gap-3 flex-wrap">
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: headColor }}>{label}</span>
        <span style={{ fontSize: "0.8125rem", color: subColor }}>{fmtShort(start)} – {fmtShort(end)}</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 shrink-0"
        style={{ fontSize: "0.6875rem", fontWeight: 500, color: subColor, opacity: 0.8 }}>
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <rect x="4" y="1" width="8" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <line x1="8" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        Field agents notified
      </div>
    </div>
  );
}

// ─── Empty column placeholder ─────────────────────────────────────────────────

function EmptyColState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--gray-100)" }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="16" height="16" rx="3" stroke="var(--gray-300)" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M11 8v6M8 11h6" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[12px] text-gray-400">No items here yet</p>
        <p className="text-[11px] text-gray-300 mt-0.5">No results match your filters</p>
      </div>
    </div>
  );
}

// ─── RecoveriesBoard ──────────────────────────────────────────────────────────

export default function RecoveriesBoard() {
  const [mobileColId,    setMobileColId]    = useState(RECOVERIES_COLUMNS[0].id);
  const [timeframe,      setTimeframe]      = useState<{ start: Date; end: Date } | null>(null);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [reviewingReq,   setReviewingReq]   = useState<RecoveryRequest | null>(null);
  const [financingReq,   setFinancingReq]   = useState<RecoveryRequest | null>(null);
  const [stageOverrides, setStageOverrides] = useState<Record<string, RecoveryStage>>({});
  const [priceOverrides, setPriceOverrides] = useState<Record<string, { unitPrice: number; purchasePrice: number }>>({});
  const [filters,        setFilters]        = useState<ActiveFilters>(DEFAULT_FILTERS);

  const handleFilterChange = useCallback((f: ActiveFilters) => setFilters(f), []);

  // Apply filters + stage overrides to mock data
  const filteredRequests = useMemo(() => {
    return MOCK_RECOVERY_REQUESTS.map((r) => ({
      ...r,
      stage: (stageOverrides[r.id] ?? r.stage) as RecoveryStage,
    })).filter((req) => {
      const { search, region, district, community, agent, datePreset } = filters;
      if (search    && !req.groupName.toLowerCase().includes(search.toLowerCase())) return false;
      if (region    && req.region    !== region)    return false;
      if (district  && req.district  !== district)  return false;
      if (community && req.community !== community)  return false;
      if (agent     && req.agent     !== agent)      return false;
      if (datePreset) {
        const [ds, de] = presetDates(datePreset, new Date());
        if (req.submittedDate < ds || req.submittedDate > de) return false;
      }
      return true;
    });
  }, [filters, stageOverrides]);

  function cardsForCol(colId: string) {
    return filteredRequests.filter((r) => r.stage === colId);
  }

  function handleApprove(id: string, unitPrice: number, purchasePrice: number) {
    setStageOverrides((prev) => ({ ...prev, [id]: "rec_finance_review" }));
    setPriceOverrides((prev) => ({ ...prev, [id]: { unitPrice, purchasePrice } }));
    setReviewingReq(null);
  }

  function handleFinanceActivate(id: string, finalPurchasePrice: number, _comment: string) {
    setStageOverrides((prev) => ({ ...prev, [id]: "rec_approved" }));
    setPriceOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], purchasePrice: finalPurchasePrice },
    }));
    setFinancingReq(null);
  }

  const timeframeRightSlot = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"
      style={{
        height: 34, padding: "0 14px",
        borderRadius: 8,
        border: timeframe ? "1px solid #16a34a" : "1px solid #d1d5db",
        background: timeframe ? "#f0fdf4" : "#fff",
        fontSize: "0.8125rem", fontWeight: 600,
        color: timeframe ? "#15803d" : "#374151",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = timeframe ? "#dcfce7" : "#f9fafb")}
      onMouseLeave={(e) => (e.currentTarget.style.background = timeframe ? "#f0fdf4" : "#fff")}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 1v2.5M11 1v2.5M1 6.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {timeframe ? "Edit timeframe" : "Set recovery timeframe"}
    </button>
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "var(--gray-50)" }}>

      {/* ── Filter bar (with timeframe CTA in right slot) ── */}
      <FilterBar
        agents={ALL_RECOVERY_AGENTS}
        onFilterChange={handleFilterChange}
        rightSlot={timeframeRightSlot}
      />

      {/* ── Recovery timeframe banner (visible when timeframe is set) ── */}
      {timeframe && (
        <RecoveryBanner
          start={timeframe.start}
          end={timeframe.end}
        />
      )}

      {/* ── Mobile: column tab strip ── */}
      <div className="lg:hidden shrink-0 flex overflow-x-auto gap-2 px-4 py-2.5 bg-white border-b border-gray-200 scrollbar-none">
        {RECOVERIES_COLUMNS.map((col) => {
          const count    = cardsForCol(col.id).length;
          const isActive = mobileColId === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setMobileColId(col.id)}
              className="shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors"
              style={isActive
                ? { background: col.dotColor, color: "white" }
                : { background: "var(--gray-100)", color: "var(--gray-500)" }}
            >
              {col.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Mobile: single column ── */}
      <div className="lg:hidden flex-1 overflow-y-auto">
        <div className="py-3">
          {(() => {
            const cards = cardsForCol(mobileColId);
            if (cards.length === 0) return <EmptyColState />;
            return cards.map((r) => (
              <RecoveryCard
                key={r.id}
                req={r}
                onReview={() => mobileColId === "rec_finance_review" ? setFinancingReq(r) : setReviewingReq(r)}
              />
            ));
          })()}
        </div>
      </div>

      {/* ── Desktop: all columns ── */}
      <div className="hidden lg:block" style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
        <div style={{
          display: "flex", flexDirection: "row",
          gap: 12, padding: "16px 20px",
          height: "100%", minWidth: "max-content",
        }}>
          {RECOVERIES_COLUMNS.map((col) => {
            const cards = cardsForCol(col.id);
            const isFinanceCol = col.id === "rec_finance_review";
            return (
              <div
                key={col.id}
                style={{
                  width: 288, minWidth: 288, flexShrink: 0,
                  display: "flex", flexDirection: "column",
                  height: "100%", overflow: "hidden",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <ColumnHeader label={col.label} dotColor={col.dotColor} count={cards.length} />
                </div>
                <ScrollArea className="flex-1 min-h-0">
                  <div style={{ paddingTop: 8, paddingBottom: 16 }}>
                    {cards.length === 0
                      ? <EmptyColState />
                      : cards.map((r) => (
                          <RecoveryCard
                            key={r.id}
                            req={r}
                            onReview={() => isFinanceCol ? setFinancingReq(r) : setReviewingReq(r)}
                          />
                        ))
                    }
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recovery approval modal (agent manager) ── */}
      {reviewingReq && (
        <RecoveryApprovalModal
          req={reviewingReq}
          onClose={() => setReviewingReq(null)}
          onApprove={handleApprove}
        />
      )}

      {/* ── Finance review modal ── */}
      {financingReq && priceOverrides[financingReq.id] && (
        <FinanceReviewModal
          req={financingReq}
          approvedUnitPrice={priceOverrides[financingReq.id].unitPrice}
          approvedPurchasePrice={priceOverrides[financingReq.id].purchasePrice}
          onClose={() => setFinancingReq(null)}
          onActivate={handleFinanceActivate}
        />
      )}

      {/* ── Set/edit timeframe modal ── */}
      {modalOpen && (
        <SetTimeframeModal
          current={timeframe}
          onConfirm={(s, e) => { setTimeframe({ start: s, end: e }); setModalOpen(false); }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
