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
  actionHistory?:        ActionRecord[];
  farmersList?:          Array<{ id: string; name: string; recoveredKg?: number; recoveredDate?: string }>;
  bagWeightKg?:          number;
  wantsDouble?:          boolean;
  approvedUnitPrice?:    number;
  approvedPurchasePrice?: number;
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
  {
    id: "REC-005", groupName: "Savelugu Crop Farmers",
    community: "Savelugu", region: "Northern", district: "Savelugu",
    agent: "Kofi Mensah", farmersSupported: 16, amountPerFarmer: 450, bagWeightKg: 100,
    approvedUnitPrice: 2.50, approvedPurchasePrice: 2.20,
    submittedDate: new Date(2025, 10, 20), stage: "rec_pending_recovery",
    disbursedDate: "5 Jul 2025", transactionId: "TXN-FS-2024-009",
    actionHistory: [
      { id: "r005-1", stage: "synced",              actor: "Douglas Gockah", action: "Scored request",                  summary: "Douglas Gockah assigned a score of 79% to the group",                                  timestamp: "2025-05-10T09:00:00" },
      { id: "r005-2", stage: "pending_approval",     actor: "Douglas Gockah", action: "Approved cash support",           summary: "Douglas Gockah approved GHS 450/farmer for 16 farmers, totalling GHS 7,200",            timestamp: "2025-05-13T10:00:00" },
      { id: "r005-3", stage: "agent_confirmation",   actor: "Kofi Mensah",    action: "Confirmed participating farmers", summary: "Kofi Mensah confirmed 16 farmers and submitted MoMo for disbursement",                 timestamp: "2025-05-25T08:00:00" },
      { id: "r005-4", stage: "finance_disbursement", actor: "Douglas Gockah", action: "Funds disbursed",                 summary: "GHS 7,200 disbursed to group via MoMo · TXN-FS-2024-009",                             timestamp: "2025-07-05T11:00:00" },
      { id: "r005-5", stage: "disbursed",            actor: "Kofi Mensah",    action: "Fulfilment completed",            summary: "Kofi Mensah confirmed all 16 farmers received their support",                          timestamp: "2025-09-10T09:00:00" },
      { id: "r005-6", stage: "disbursed",            actor: "Kofi Mensah",    action: "Recovery request submitted",      summary: "Kofi Mensah submitted a recovery request — 16 farmers at GHS 450/farmer",            timestamp: "2025-10-20T08:30:00" },
      { id: "r005-7", stage: "rec_finance_review",   actor: "Agent Manager",  action: "Recovery request reviewed & approved", summary: "Set recovery unit price to GHS 2.50/kg and extra commodity purchase price to GHS 2.20/kg. Forwarded to finance for activation.", timestamp: "2025-10-22T10:00:00" },
      { id: "r005-8", stage: "rec_approved",         actor: "Finance Officer", action: "Recovery request activated",     summary: "Recovery activated. Purchase price confirmed at GHS 2.20/kg.",                         timestamp: "2025-10-23T14:00:00" },
    ],
    farmersList: [
      { id: "S101", name: "Alidu Tampuri" },       { id: "S102", name: "Rahinatu Ziblim" },
      { id: "S103", name: "Fuseini Mahama" },      { id: "S104", name: "Mariama Abukari" },
      { id: "S105", name: "Issaka Alhassan" },     { id: "S106", name: "Bintu Dauda" },
      { id: "S107", name: "Yakubu Naabu" },        { id: "S108", name: "Fati Iddrisu" },
      { id: "S109", name: "Sulley Seidu" },        { id: "S110", name: "Habiba Bawah" },
      { id: "S111", name: "Aminu Alhassan" },      { id: "S112", name: "Zuwera Mahama" },
      { id: "S113", name: "Alimatu Fuseini" },     { id: "S114", name: "Huseini Tampuri" },
      { id: "S115", name: "Baba Ziblim" },         { id: "S116", name: "Ramatu Abukari" },
    ],
  },
  {
    id: "REC-006", groupName: "Nalerigu Women Cooperative",
    community: "Nalerigu", region: "North East", district: "Nalerigu",
    agent: "Ama Owusu", farmersSupported: 12, amountPerFarmer: 600, bagWeightKg: 100, wantsDouble: true,
    approvedUnitPrice: 3.00, approvedPurchasePrice: 2.80,
    submittedDate: new Date(2025, 10, 15), stage: "rec_pending_recovery",
    disbursedDate: "20 Jul 2025", transactionId: "TXN-FS-2024-011",
    actionHistory: [
      { id: "r006-1", stage: "synced",              actor: "Douglas Gockah", action: "Scored request",                  summary: "Douglas Gockah assigned a score of 83% to the group",                                  timestamp: "2025-05-20T09:00:00" },
      { id: "r006-2", stage: "pending_approval",     actor: "Douglas Gockah", action: "Approved cash support",           summary: "Douglas Gockah approved GHS 600/farmer for 12 farmers, totalling GHS 7,200",            timestamp: "2025-05-22T10:00:00" },
      { id: "r006-3", stage: "agent_confirmation",   actor: "Ama Owusu",      action: "Confirmed participating farmers", summary: "Ama Owusu confirmed 12 farmers and submitted MoMo for disbursement",                   timestamp: "2025-06-05T08:00:00" },
      { id: "r006-4", stage: "finance_disbursement", actor: "Douglas Gockah", action: "Funds disbursed",                 summary: "GHS 7,200 disbursed to group via MoMo · TXN-FS-2024-011",                             timestamp: "2025-07-20T11:00:00" },
      { id: "r006-5", stage: "disbursed",            actor: "Ama Owusu",      action: "Fulfilment completed",            summary: "Ama Owusu confirmed all 12 farmers received their support",                            timestamp: "2025-09-25T09:00:00" },
      { id: "r006-6", stage: "disbursed",            actor: "Ama Owusu",      action: "Recovery request submitted",      summary: "Ama Owusu submitted a recovery request — 12 farmers at GHS 600/farmer (double amount opted)", timestamp: "2025-10-15T08:30:00" },
      { id: "r006-7", stage: "rec_finance_review",   actor: "Agent Manager",  action: "Recovery request reviewed & approved", summary: "Set recovery unit price to GHS 3.00/kg and extra commodity purchase price to GHS 2.80/kg. Group opted for double amount (2 bags per farmer). Forwarded to finance for activation.", timestamp: "2025-10-17T10:00:00" },
      { id: "r006-8", stage: "rec_approved",         actor: "Finance Officer", action: "Recovery request activated",     summary: "Recovery activated. Purchase price confirmed at GHS 2.80/kg.",                         timestamp: "2025-10-18T14:30:00" },
    ],
    farmersList: [
      { id: "N101", name: "Abiba Mahama" },        { id: "N102", name: "Fati Alhassan" },
      { id: "N103", name: "Rahinatu Seidu" },      { id: "N104", name: "Mariama Baba" },
      { id: "N105", name: "Bintu Tampuri" },       { id: "N106", name: "Zenabu Fuseini" },
      { id: "N107", name: "Habiba Dauda" },        { id: "N108", name: "Hawa Ziblim" },
      { id: "N109", name: "Amina Abukari" },       { id: "N110", name: "Safiatu Naabu" },
      { id: "N111", name: "Ramatu Iddrisu" },      { id: "N112", name: "Fatimatu Alhassan" },
    ],
  },
  {
    id: "REC-007", groupName: "Yendi Grain Producers",
    community: "Yendi", region: "Northern", district: "Yendi",
    agent: "Kwame Asante", farmersSupported: 18, amountPerFarmer: 500, bagWeightKg: 100,
    approvedUnitPrice: 2.80, approvedPurchasePrice: 2.60,
    submittedDate: new Date(2025, 9, 5), stage: "rec_partial",
    disbursedDate: "20 Jun 2025", transactionId: "TXN-FS-2024-007",
    actionHistory: [
      { id: "r007-1", stage: "synced",              actor: "Douglas Gockah", action: "Scored request",                  summary: "Douglas Gockah assigned a score of 77% to the group",                                  timestamp: "2025-04-05T09:00:00" },
      { id: "r007-2", stage: "pending_approval",     actor: "Douglas Gockah", action: "Approved cash support",           summary: "Douglas Gockah approved GHS 500/farmer for 18 farmers, totalling GHS 9,000",            timestamp: "2025-04-08T10:00:00" },
      { id: "r007-3", stage: "agent_confirmation",   actor: "Kwame Asante",   action: "Confirmed participating farmers", summary: "Kwame Asante confirmed 18 farmers and submitted MoMo for disbursement",                  timestamp: "2025-04-20T08:00:00" },
      { id: "r007-4", stage: "finance_disbursement", actor: "Douglas Gockah", action: "Funds disbursed",                 summary: "GHS 9,000 disbursed to group via MoMo · TXN-FS-2024-007",                             timestamp: "2025-06-20T11:00:00" },
      { id: "r007-5", stage: "disbursed",            actor: "Kwame Asante",   action: "Fulfilment completed",            summary: "Kwame Asante confirmed all 18 farmers received their support",                          timestamp: "2025-08-15T09:00:00" },
      { id: "r007-6", stage: "disbursed",            actor: "Kwame Asante",   action: "Recovery request submitted",      summary: "Kwame Asante submitted a recovery request — 18 farmers at GHS 500/farmer",            timestamp: "2025-10-05T08:30:00" },
      { id: "r007-7", stage: "rec_finance_review",   actor: "Agent Manager",  action: "Recovery request reviewed & approved", summary: "Set recovery unit price to GHS 2.80/kg and extra commodity purchase price to GHS 2.60/kg. Forwarded to finance for activation.", timestamp: "2025-10-07T10:00:00" },
      { id: "r007-8", stage: "rec_approved",         actor: "Finance Officer", action: "Recovery request activated",     summary: "Recovery activated. Purchase price confirmed at GHS 2.60/kg.",                         timestamp: "2025-10-08T14:00:00" },
      { id: "r007-9", stage: "rec_partial",          actor: "Kwame Asante",   action: "Partial recovery recorded",       summary: "Kwame Asante recorded recoveries for 11 of 18 farmers. 7 farmers are still pending.",    timestamp: "2025-10-20T11:30:00" },
    ],
    farmersList: [
      { id: "Y101", name: "Alidu Fuseini",    recoveredKg: 100, recoveredDate: "2025-10-20" },
      { id: "Y102", name: "Rahinatu Yahaya",  recoveredKg: 100, recoveredDate: "2025-10-20" },
      { id: "Y103", name: "Fuseini Dramani",  recoveredKg: 100, recoveredDate: "2025-10-18" },
      { id: "Y104", name: "Mariama Issaka",   recoveredKg: 100, recoveredDate: "2025-10-18" },
      { id: "Y105", name: "Issaka Sumaila",   recoveredKg: 100, recoveredDate: "2025-10-17" },
      { id: "Y106", name: "Bintu Seidu",      recoveredKg: 100, recoveredDate: "2025-10-17" },
      { id: "Y107", name: "Yakubu Bawah",     recoveredKg: 100, recoveredDate: "2025-10-16" },
      { id: "Y108", name: "Fati Iddrissu",    recoveredKg: 100, recoveredDate: "2025-10-16" },
      { id: "Y109", name: "Sulley Abukari",   recoveredKg: 100, recoveredDate: "2025-10-15" },
      { id: "Y110", name: "Habiba Naabu",     recoveredKg: 100, recoveredDate: "2025-10-15" },
      { id: "Y111", name: "Aminu Tampuri",    recoveredKg: 100, recoveredDate: "2025-10-14" },
      { id: "Y112", name: "Zuwera Alhassan" },
      { id: "Y113", name: "Alimatu Mahama" },
      { id: "Y114", name: "Huseini Dauda" },
      { id: "Y115", name: "Baba Ziblim" },
      { id: "Y116", name: "Ramatu Fuseini" },
      { id: "Y117", name: "Fatimatu Seidu" },
      { id: "Y118", name: "Aminata Abukari" },
    ],
  },
  {
    id: "REC-008", groupName: "Damongo Women Farmers",
    community: "Damongo", region: "Savannah", district: "West Gonja",
    agent: "Ama Owusu", farmersSupported: 15, amountPerFarmer: 450, bagWeightKg: 100,
    approvedUnitPrice: 2.70, approvedPurchasePrice: 2.50,
    submittedDate: new Date(2025, 8, 18), stage: "rec_full",
    disbursedDate: "10 Jun 2025", transactionId: "TXN-FS-2024-005",
    actionHistory: [
      { id: "r008-1", stage: "synced",              actor: "Douglas Gockah", action: "Scored request",                  summary: "Douglas Gockah assigned a score of 81% to the group",                                  timestamp: "2025-03-18T09:00:00" },
      { id: "r008-2", stage: "pending_approval",     actor: "Douglas Gockah", action: "Approved cash support",           summary: "Douglas Gockah approved GHS 450/farmer for 15 farmers, totalling GHS 6,750",            timestamp: "2025-03-20T10:00:00" },
      { id: "r008-3", stage: "agent_confirmation",   actor: "Ama Owusu",      action: "Confirmed participating farmers", summary: "Ama Owusu confirmed 15 farmers and submitted MoMo for disbursement",                   timestamp: "2025-04-02T08:00:00" },
      { id: "r008-4", stage: "finance_disbursement", actor: "Douglas Gockah", action: "Funds disbursed",                 summary: "GHS 6,750 disbursed to group via MoMo · TXN-FS-2024-005",                             timestamp: "2025-06-10T11:00:00" },
      { id: "r008-5", stage: "disbursed",            actor: "Ama Owusu",      action: "Fulfilment completed",            summary: "Ama Owusu confirmed all 15 farmers received their support",                            timestamp: "2025-07-25T09:00:00" },
      { id: "r008-6", stage: "disbursed",            actor: "Ama Owusu",      action: "Recovery request submitted",      summary: "Ama Owusu submitted a recovery request — 15 farmers at GHS 450/farmer",             timestamp: "2025-09-18T08:30:00" },
      { id: "r008-7", stage: "rec_finance_review",   actor: "Agent Manager",  action: "Recovery request reviewed & approved", summary: "Set recovery unit price to GHS 2.70/kg and extra commodity purchase price to GHS 2.50/kg. Forwarded to finance for activation.", timestamp: "2025-09-20T10:00:00" },
      { id: "r008-8", stage: "rec_approved",         actor: "Finance Officer", action: "Recovery request activated",     summary: "Recovery activated. Purchase price confirmed at GHS 2.50/kg.",                         timestamp: "2025-09-21T14:00:00" },
      { id: "r008-9", stage: "rec_full",             actor: "Ama Owusu",      action: "Full recovery recorded",          summary: "Ama Owusu recorded recoveries for all 15 farmers. Total recovered: 1,500 kg.",          timestamp: "2025-10-10T15:00:00" },
    ],
    farmersList: [
      { id: "D101", name: "Abiba Fuseini",    recoveredKg: 100, recoveredDate: "2025-10-10" },
      { id: "D102", name: "Fati Seidu",       recoveredKg: 100, recoveredDate: "2025-10-10" },
      { id: "D103", name: "Rahinatu Bawah",   recoveredKg: 100, recoveredDate: "2025-10-09" },
      { id: "D104", name: "Mariama Naabu",    recoveredKg: 100, recoveredDate: "2025-10-09" },
      { id: "D105", name: "Bintu Alhassan",   recoveredKg: 100, recoveredDate: "2025-10-09" },
      { id: "D106", name: "Zenabu Mahama",    recoveredKg: 100, recoveredDate: "2025-10-08" },
      { id: "D107", name: "Habiba Ziblim",    recoveredKg: 100, recoveredDate: "2025-10-08" },
      { id: "D108", name: "Hawa Abukari",     recoveredKg: 100, recoveredDate: "2025-10-08" },
      { id: "D109", name: "Amina Iddrisu",    recoveredKg: 100, recoveredDate: "2025-10-07" },
      { id: "D110", name: "Safiatu Tampuri",  recoveredKg: 100, recoveredDate: "2025-10-07" },
      { id: "D111", name: "Ramatu Fuseini",   recoveredKg: 100, recoveredDate: "2025-10-07" },
      { id: "D112", name: "Fatimatu Dauda",   recoveredKg: 100, recoveredDate: "2025-10-06" },
      { id: "D113", name: "Huseini Seidu",    recoveredKg: 100, recoveredDate: "2025-10-06" },
      { id: "D114", name: "Alidu Mahama",     recoveredKg: 100, recoveredDate: "2025-10-06" },
      { id: "D115", name: "Issaka Abukari",   recoveredKg: 100, recoveredDate: "2025-10-05" },
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
  ctaLabel = "Review",
  ctaColor = "var(--green-600)",
  ctaHoverColor = "var(--green-700, #15803d)",
  subText,
}: {
  req: RecoveryRequest;
  onReview: () => void;
  ctaLabel?: string;
  ctaColor?: string;
  ctaHoverColor?: string;
  subText?: string;
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
          {subText ?? `${req.community} · ${req.farmersSupported} farmers supported`}
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

        {/* Full-width CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onReview(); }}
          style={{
            width: "100%", height: 36, borderRadius: 8,
            border: "none", background: ctaColor,
            color: "#fff", fontSize: "0.875rem", fontWeight: 600,
            cursor: "pointer", transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = ctaHoverColor)}
          onMouseLeave={(e) => (e.currentTarget.style.background = ctaColor)}
        >
          {ctaLabel}
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

// ─── Double Bag Banner ────────────────────────────────────────────────────────

function DoubleBagBanner({ bagWeightKg, bagsExpected, amountPerFarmer }: { bagWeightKg: number; bagsExpected: number; amountPerFarmer: number }) {
  const actualPerFarmer = amountPerFarmer * bagsExpected;
  return (
    <div style={{ borderRadius: 10, background: "#fffbeb", border: "1.5px solid #f59e0b", padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="4" width="5" height="9" rx="1" stroke="#d97706" strokeWidth="1.4" />
          <rect x="9" y="4" width="5" height="9" rx="1" stroke="#d97706" strokeWidth="1.4" />
          <path d="M4 4V3a1 1 0 011-1h1a1 1 0 011 1v1M10 4V3a1 1 0 011-1h1a1 1 0 011 1v1" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#92400e", margin: "0 0 3px" }}>
          Enhanced bag amount opted
          <span style={{ fontWeight: 500, marginLeft: 6, fontSize: "0.75rem", color: "#b45309" }}>({bagsExpected}× bags)</span>
        </p>
        <p style={{ fontSize: "0.75rem", color: "#b45309", margin: 0, lineHeight: 1.5 }}>
          Each farmer received <strong>GHS {actualPerFarmer.toLocaleString()}</strong> ({bagsExpected}× the standard GHS {amountPerFarmer.toLocaleString()}) and is expected to return <strong>{bagsExpected} bags ({bagWeightKg * bagsExpected} kg)</strong> instead of the standard 1 bag ({bagWeightKg} kg).
        </p>
      </div>
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
            </div>

            {/* DISBURSEMENT */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {([
                  { label: "Transaction ID", value: req.transactionId },
                  { label: "Date disbursed",  value: req.disbursedDate },
                  { label: "Total amount",    value: `GHS ${(req.farmersSupported * req.amountPerFarmer * bagsExpected).toLocaleString("en-GH")}` },
                  { label: "Per farmer",      value: `GHS ${(req.amountPerFarmer * bagsExpected).toFixed(2)}` },
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

              {/* Double bag notice */}
              {wantsDouble && <DoubleBagBanner bagWeightKg={bagWeightKg} bagsExpected={bagsExpected} amountPerFarmer={req.amountPerFarmer} />}

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
                    {/* Bags expected — always show, highlight enhanced */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6", background: bagsExpected > 1 ? "#fffbeb" : "transparent" }}>
                      <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Bags expected per farmer</span>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: bagsExpected > 1 ? "#d97706" : "#111827" }}>
                        {bagsExpected} bag{bagsExpected > 1 ? "s" : ""}
                        {bagsExpected > 1 && <span style={{ fontWeight: 500, marginLeft: 6, fontSize: "0.75rem" }}>({bagsExpected}× bags opted)</span>}
                      </span>
                    </div>
                    {/* Amount received per farmer — enhanced groups only */}
                    {bagsExpected > 1 && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6", background: "#fffbeb" }}>
                        <div>
                          <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Amount received per farmer</span>
                          <span style={{ display: "block", fontSize: "0.6875rem", color: "#9ca3af" }}>{bagsExpected}× GHS {req.amountPerFarmer.toFixed(2)}</span>
                        </div>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#d97706" }}>
                          GHS {(req.amountPerFarmer * bagsExpected).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {/* Total recovery per farmer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: "#f0fdf4" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>
                        Total recovery per farmer
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#16a34a", display: "block" }}>
                          GHS {totalBagValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span style={{ fontSize: "0.6875rem", color: "#6b7280" }}>= {bagWeightKg * bagsExpected} kg</span>
                      </div>
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
            </div>

            {/* Disbursement */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {([
                  { label: "Transaction ID", value: req.transactionId },
                  { label: "Date disbursed",  value: req.disbursedDate },
                  { label: "Total amount",    value: `GHS ${(req.farmersSupported * req.amountPerFarmer * bagsExpected).toLocaleString("en-GH")}` },
                  { label: "Per farmer",      value: `GHS ${(req.amountPerFarmer * bagsExpected).toFixed(2)}` },
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

              {/* Double bag notice */}
              {wantsDouble && <DoubleBagBanner bagWeightKg={bagWeightKg} bagsExpected={bagsExpected} amountPerFarmer={req.amountPerFarmer} />}

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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6", background: bagsExpected > 1 ? "#fffbeb" : "transparent" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Bags expected per farmer</span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: bagsExpected > 1 ? "#d97706" : "#111827" }}>
                      {bagsExpected} bag{bagsExpected > 1 ? "s" : ""}
                      {bagsExpected > 1 && <span style={{ fontWeight: 500, marginLeft: 6, fontSize: "0.75rem" }}>({bagsExpected}× bags opted)</span>}
                    </span>
                  </div>
                  {bagsExpected > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6", background: "#fffbeb" }}>
                      <div>
                        <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Amount received per farmer</span>
                        <span style={{ display: "block", fontSize: "0.6875rem", color: "#9ca3af" }}>{bagsExpected}× GHS {req.amountPerFarmer.toFixed(2)}</span>
                      </div>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#d97706" }}>
                        GHS {(req.amountPerFarmer * bagsExpected).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: "#f0fdf4" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>Total recovery per farmer</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#16a34a", display: "block" }}>
                        GHS {totalBagValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "#6b7280" }}>= {bagWeightKg * bagsExpected} kg</span>
                    </div>
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

// ─── Pending Recovery Modal ───────────────────────────────────────────────────

function PendingRecoveryModal({
  req,
  unitPrice,
  purchasePrice,
  onClose,
}: {
  req: RecoveryRequest;
  unitPrice: number;
  purchasePrice: number;
  onClose: () => void;
}) {
  const [listOpen, setListOpen] = useState(true);

  const totalAmount    = req.farmersSupported * req.amountPerFarmer;
  const bagWeightKg    = req.bagWeightKg ?? 100;
  const wantsDouble    = req.wantsDouble ?? false;
  const bagsExpected   = wantsDouble ? 2 : 1;
  const bagValue       = unitPrice * bagWeightKg;
  const totalBagValue  = bagValue * bagsExpected;
  const weightPerFarmer = bagWeightKg * bagsExpected;
  const totalWeight    = weightPerFarmer * req.farmersSupported;

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
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#7c3aed" strokeWidth="1.4" />
                <path d="M8 5v3.5l2.5 1.5" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">Pending recovery</h2>
              <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                Awaiting recovery recordings from the field agent
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

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">

          {/* Mobile strip */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div>
              <p className="text-[13px] font-bold text-gray-900">{req.groupName}</p>
              <p className="text-[11px] text-gray-500">{req.community} · {req.farmersSupported} farmers</p>
            </div>
          </div>

          {/* Left panel — context */}
          <div
            className="hidden md:flex flex-col gap-5 shrink-0 overflow-y-auto min-h-0"
            style={{ width: 310, borderRight: "1px solid var(--gray-100)", padding: "22px 20px 22px 24px" }}
          >
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</p>
              <p className="text-[15px] font-bold text-gray-900 leading-snug">{req.groupName}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{req.community}</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                <p className="text-[10px] text-gray-400 mb-0.5">Farmers supported</p>
                <p className="text-[20px] font-bold text-gray-900">{req.farmersSupported}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {([
                  { label: "Transaction ID", value: req.transactionId },
                  { label: "Date disbursed",  value: req.disbursedDate },
                  { label: "Total amount",    value: `GHS ${(req.farmersSupported * req.amountPerFarmer * bagsExpected).toLocaleString("en-GH")}` },
                  { label: "Per farmer",      value: `GHS ${(req.amountPerFarmer * bagsExpected).toFixed(2)}` },
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

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Agent</p>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: agentColor }}>
                  {agentInitials}
                </span>
                <p className="text-[13px] font-semibold text-gray-800">{req.agent}</p>
              </div>
            </div>

            {req.actionHistory && req.actionHistory.length > 0 && (
              <div>
                <ActionTimeline records={req.actionHistory} accordion />
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Status banner */}
              <div style={{ borderRadius: 12, background: "#faf5ff", border: "1px solid #e9d5ff", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span className="relative flex shrink-0" style={{ width: 10, height: 10 }}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: "#7c3aed", opacity: 0.45 }} />
                  <span className="relative inline-flex rounded-full" style={{ width: 10, height: 10, background: "#7c3aed" }} />
                </span>
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#4c1d95", margin: 0 }}>Recovery in progress</p>
                  <p style={{ fontSize: "0.75rem", color: "#7c3aed", margin: "2px 0 0", fontWeight: 500 }}>
                    Field agent is expected to record {req.farmersSupported} recoveries · {totalWeight.toLocaleString()} kg total
                  </p>
                </div>
              </div>

              {/* Double bag notice */}
              {wantsDouble && <DoubleBagBanner bagWeightKg={bagWeightKg} bagsExpected={bagsExpected} amountPerFarmer={req.amountPerFarmer} />}

              {/* Approved recovery parameters */}
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Approved recovery parameters
                </p>
                <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 500, margin: 0 }}>Recovery unit price</p>
                      <p style={{ fontSize: "0.6875rem", color: "#9ca3af", margin: "2px 0 0" }}>For calculating bag recovery value</p>
                    </div>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                      GHS {unitPrice.toFixed(2)}<span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", marginLeft: 4 }}>/kg</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 500, margin: 0 }}>Extra commodity purchase price</p>
                      <p style={{ fontSize: "0.6875rem", color: "#9ca3af", margin: "2px 0 0" }}>For surplus purchases beyond recovery</p>
                    </div>
                    {purchasePrice > 0 ? (
                      <span style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                        GHS {purchasePrice.toFixed(2)}<span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", marginLeft: 4 }}>/kg</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.8125rem", color: "#9ca3af", fontStyle: "italic" }}>Not set</span>
                    )}
                  </div>
                  {/* Per-farmer recovery value */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f0fdf4" }}>
                    <div>
                      <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 600, margin: 0 }}>Recovery value per farmer</p>
                      <p style={{ fontSize: "0.6875rem", color: "#6b7280", margin: "2px 0 0" }}>{weightPerFarmer} kg × GHS {unitPrice.toFixed(2)}</p>
                    </div>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "#16a34a" }}>
                      GHS {totalBagValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Farmer recovery list accordion */}
              <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                {/* Accordion toggle */}
                <button
                  onClick={() => setListOpen((v) => !v)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: listOpen ? "#f9fafb" : "#fff", borderBottom: listOpen ? "1px solid #e5e7eb" : "none", cursor: "pointer", border: "none", textAlign: "left" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "#6b7280" }}>
                      <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M1 14c0-3 2.2-5 5-5h1c2.8 0 5 2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151" }}>Farmer recovery list</span>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 20 }}>
                      {req.farmersSupported} farmers
                    </span>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", padding: "2px 8px", borderRadius: 20 }}>
                      {totalWeight.toLocaleString()} kg total
                    </span>
                  </div>
                  <svg
                    width="13" height="13" viewBox="0 0 13 13" fill="none"
                    style={{ color: "#9ca3af", transform: listOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}
                  >
                    <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {listOpen && req.farmersList && req.farmersList.length > 0 && (
                  <>
                    {/* Column headers */}
                    <div style={{ display: "flex", alignItems: "center", padding: "7px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      <span style={{ flex: 1, fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Farmer</span>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
                        Expected weight
                      </span>
                    </div>

                    {/* Farmer rows */}
                    {req.farmersList.map((f, idx) => {
                      const color  = avatarColor(f.name);
                      const ini    = initials(f.name);
                      const isLast = idx === req.farmersList!.length - 1;
                      return (
                        <div
                          key={f.id}
                          style={{ display: "flex", alignItems: "center", padding: "9px 16px", borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
                        >
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <span style={{ width: 26, height: 26, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5625rem", fontWeight: 700, flexShrink: 0 }}>
                              {ini}
                            </span>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                            <span style={{ fontSize: "0.6875rem", fontFamily: "monospace", color: "#9ca3af", flexShrink: 0 }}>{f.id}</span>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: wantsDouble ? "#d97706" : "#374151" }}>
                              {weightPerFarmer} kg
                            </span>
                            {wantsDouble && (
                              <span style={{ display: "block", fontSize: "0.625rem", color: "#d97706", fontWeight: 500 }}>2 bags</span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Total row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#faf5ff", borderTop: "1px solid #e9d5ff" }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#4c1d95" }}>Total expected</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#7c3aed" }}>
                        {totalWeight.toLocaleString()} kg
                        <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#9ca3af", marginLeft: 4 }}>
                          ({req.farmersSupported} × {weightPerFarmer} kg)
                        </span>
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Applicable rates */}
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

            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end">
              <button
                onClick={onClose}
                className="h-9 px-6 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Activated Summary Modal ──────────────────────────────────────────────────

function ActivatedSummaryModal({
  req,
  approvedUnitPrice,
  approvedPurchasePrice,
  onClose,
  onCancel,
}: {
  req: RecoveryRequest;
  approvedUnitPrice: number;
  approvedPurchasePrice: number;
  onClose: () => void;
  onCancel: (id: string, comment: string) => void;
}) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelComment,    setCancelComment]    = useState("");
  const canConfirmCancel = cancelComment.trim().length > 0;

  const totalAmount   = req.farmersSupported * req.amountPerFarmer;
  const bagWeightKg   = req.bagWeightKg ?? 100;
  const wantsDouble   = req.wantsDouble ?? false;
  const bagsExpected  = wantsDouble ? 2 : 1;
  const bagValue      = approvedUnitPrice * bagWeightKg;
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
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.2" />
                <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">Recovery activated</h2>
              <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                Recovery is live — field agents are working with the parameters below
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

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">

          {/* Mobile strip */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div>
              <p className="text-[13px] font-bold text-gray-900">{req.groupName}</p>
              <p className="text-[11px] text-gray-500">{req.community} · {req.farmersSupported} farmers</p>
            </div>
          </div>

          {/* Left panel */}
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
            </div>

            {/* Disbursement */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {([
                  { label: "Transaction ID", value: req.transactionId },
                  { label: "Date disbursed",  value: req.disbursedDate },
                  { label: "Total amount",    value: `GHS ${(req.farmersSupported * req.amountPerFarmer * bagsExpected).toLocaleString("en-GH")}` },
                  { label: "Per farmer",      value: `GHS ${(req.amountPerFarmer * bagsExpected).toFixed(2)}` },
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

            {/* Full action timeline */}
            {req.actionHistory && req.actionHistory.length > 0 && (
              <div>
                <ActionTimeline records={req.actionHistory} accordion />
              </div>
            )}
          </div>

          {/* Right panel — read-only summary */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Active status banner */}
              <div style={{ borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span className="relative flex shrink-0" style={{ width: 10, height: 10 }}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: "#16a34a", opacity: 0.5 }} />
                  <span className="relative inline-flex rounded-full" style={{ width: 10, height: 10, background: "#16a34a" }} />
                </span>
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#14532d", margin: 0 }}>Recovery is active</p>
                  <p style={{ fontSize: "0.75rem", color: "#16a34a", margin: "2px 0 0", fontWeight: 500 }}>
                    Field agents have been notified via the mobile app
                  </p>
                </div>
              </div>

              {/* Double bag notice */}
              {wantsDouble && <DoubleBagBanner bagWeightKg={bagWeightKg} bagsExpected={bagsExpected} amountPerFarmer={req.amountPerFarmer} />}

              {/* Recovery parameters heading */}
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Active recovery parameters
                </p>

                {/* Unit prices */}
                <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 500, margin: 0 }}>Recovery unit price</p>
                      <p style={{ fontSize: "0.6875rem", color: "#9ca3af", margin: "2px 0 0" }}>Used to calculate bag recovery value</p>
                    </div>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                      GHS {approvedUnitPrice.toFixed(2)}<span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", marginLeft: 4 }}>/kg</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
                    <div>
                      <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 500, margin: 0 }}>Extra commodity purchase price</p>
                      <p style={{ fontSize: "0.6875rem", color: "#9ca3af", margin: "2px 0 0" }}>For surplus purchases beyond recovery quantity</p>
                    </div>
                    {approvedPurchasePrice > 0 ? (
                      <span style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                        GHS {approvedPurchasePrice.toFixed(2)}<span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", marginLeft: 4 }}>/kg</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.8125rem", color: "#9ca3af", fontStyle: "italic" }}>Not set</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bag recovery calculation */}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6", background: bagsExpected > 1 ? "#fffbeb" : "transparent" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Bags expected per farmer</span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: bagsExpected > 1 ? "#d97706" : "#111827" }}>
                      {bagsExpected} bag{bagsExpected > 1 ? "s" : ""}
                      {bagsExpected > 1 && <span style={{ fontWeight: 500, marginLeft: 6, fontSize: "0.75rem" }}>({bagsExpected}× bags opted)</span>}
                    </span>
                  </div>
                  {bagsExpected > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6", background: "#fffbeb" }}>
                      <div>
                        <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Amount received per farmer</span>
                        <span style={{ display: "block", fontSize: "0.6875rem", color: "#9ca3af" }}>{bagsExpected}× GHS {req.amountPerFarmer.toFixed(2)}</span>
                      </div>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#d97706" }}>
                        GHS {(req.amountPerFarmer * bagsExpected).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: "#f0fdf4" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>Total recovery per farmer</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#16a34a", display: "block" }}>
                        GHS {totalBagValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "#6b7280" }}>= {bagWeightKg * bagsExpected} kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicable rates */}
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

              {/* Cancel confirmation — inline */}
              {confirmingCancel && (
                <div style={{ borderRadius: 12, border: "1px solid #fecaca", background: "#fff5f5", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2L2 13h12L8 2z" stroke="#dc2626" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M8 7v3M8 11.5v.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#7f1d1d", margin: 0 }}>Cancel this recovery?</p>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "#b91c1c", lineHeight: 1.55, marginBottom: 12 }}>
                    This will invalidate the current recovery request. The field agent will be able to submit a new recovery request for this group.
                  </p>

                  {/* Required comment */}
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#7f1d1d", marginBottom: 6 }}>
                    Reason for cancellation <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    value={cancelComment}
                    onChange={(e) => setCancelComment(e.target.value)}
                    placeholder="Explain why this recovery request is being canceled…"
                    rows={3}
                    style={{
                      width: "100%", borderRadius: 8, marginBottom: 12,
                      border: cancelComment.trim() ? "1.5px solid #fca5a5" : "1.5px solid #fca5a5",
                      padding: "9px 12px", fontSize: "0.875rem", color: "#374151",
                      outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5,
                      background: "#fff",
                    }}
                    onFocus={(e)  => (e.currentTarget.style.borderColor = "#f87171")}
                    onBlur={(e)   => (e.currentTarget.style.borderColor = "#fca5a5")}
                  />
                  {!cancelComment.trim() && (
                    <p style={{ fontSize: "0.75rem", color: "#dc2626", marginBottom: 12, marginTop: -8 }}>
                      A reason is required to cancel this request.
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { setConfirmingCancel(false); setCancelComment(""); }}
                      style={{ flex: 1, height: 38, borderRadius: 8, border: "1px solid #fecaca", background: "#fff", fontSize: "0.8125rem", fontWeight: 600, color: "#b91c1c", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      Keep active
                    </button>
                    <button
                      disabled={!canConfirmCancel}
                      onClick={() => { if (canConfirmCancel) onCancel(req.id, cancelComment.trim()); }}
                      style={{ flex: 1, height: 38, borderRadius: 8, border: "none", background: canConfirmCancel ? "#dc2626" : "#e5e7eb", fontSize: "0.8125rem", fontWeight: 600, color: canConfirmCancel ? "#fff" : "#9ca3af", cursor: canConfirmCancel ? "pointer" : "not-allowed" }}
                      onMouseEnter={(e) => { if (canConfirmCancel) e.currentTarget.style.background = "#b91c1c"; }}
                      onMouseLeave={(e) => { if (canConfirmCancel) e.currentTarget.style.background = "#dc2626"; }}
                    >
                      Yes, cancel request
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-2">
              {!confirmingCancel ? (
                <button
                  onClick={() => setConfirmingCancel(true)}
                  style={{ height: 36, paddingLeft: 14, paddingRight: 14, borderRadius: 8, border: "1px solid #fecaca", background: "transparent", fontSize: "0.8125rem", fontWeight: 600, color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  Cancel request
                </button>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 500 }}>
                  {cancelComment.trim() ? "Submit cancellation above to proceed" : "A reason is required — fill in the form above"}
                </span>
              )}
              <button
                onClick={onClose}
                className="h-9 px-6 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Canceled Summary Modal ───────────────────────────────────────────────────

function CanceledSummaryModal({
  req,
  unitPrice,
  purchasePrice,
  onClose,
}: {
  req: RecoveryRequest;
  unitPrice: number;
  purchasePrice: number;
  onClose: () => void;
}) {
  const wantsDouble  = req.wantsDouble ?? false;
  const bagsExpected = wantsDouble ? 2 : 1;
  const totalAmount  = req.farmersSupported * req.amountPerFarmer;
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
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.4" />
                <path d="M5 5l6 6M11 5L5 11" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">Canceled request</h2>
              <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                This recovery request is no longer active
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

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">

          {/* Mobile strip */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <p className="text-[13px] font-bold text-gray-900">{req.groupName}</p>
          </div>

          {/* Left panel — full context + timeline */}
          <div
            className="hidden md:flex flex-col gap-5 shrink-0 overflow-y-auto min-h-0"
            style={{ width: 310, borderRight: "1px solid var(--gray-100)", padding: "22px 20px 22px 24px" }}
          >
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</p>
              <p className="text-[15px] font-bold text-gray-900 leading-snug">{req.groupName}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{req.community}</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                <p className="text-[10px] text-gray-400 mb-0.5">Farmers supported</p>
                <p className="text-[20px] font-bold text-gray-900">{req.farmersSupported}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {([
                  { label: "Transaction ID", value: req.transactionId },
                  { label: "Date disbursed",  value: req.disbursedDate },
                  { label: "Total amount",    value: `GHS ${(req.farmersSupported * req.amountPerFarmer * bagsExpected).toLocaleString("en-GH")}` },
                  { label: "Per farmer",      value: `GHS ${(req.amountPerFarmer * bagsExpected).toFixed(2)}` },
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

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Agent</p>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: agentColor }}>
                  {agentInitials}
                </span>
                <p className="text-[13px] font-semibold text-gray-800">{req.agent}</p>
              </div>
            </div>

            {req.farmersList && req.farmersList.length > 0 && (
              <div>
                <FarmerListAccordion farmers={req.farmersList} />
              </div>
            )}

            {req.actionHistory && req.actionHistory.length > 0 && (
              <div>
                <ActionTimeline records={req.actionHistory} accordion />
              </div>
            )}
          </div>

          {/* Right panel — read-only summary */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Cancellation banner */}
              <div style={{ borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.4" />
                    <path d="M5 5l6 6M11 5L5 11" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#7f1d1d", margin: "0 0 3px" }}>Recovery request canceled</p>
                  <p style={{ fontSize: "0.75rem", color: "#b91c1c", margin: 0, lineHeight: 1.55 }}>
                    This request is no longer active. The field agent may submit a new recovery request for this group.
                  </p>
                </div>
              </div>

              {/* Recovery parameters at time of cancellation — only if prices were set */}
              {(unitPrice > 0 || purchasePrice > 0) && (
                <div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Recovery parameters at time of cancellation
                  </p>
                  <div style={{ borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden", opacity: 0.8 }}>
                    {unitPrice > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: purchasePrice > 0 ? "1px solid #f3f4f6" : "none" }}>
                        <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Recovery unit price</span>
                        <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#374151" }}>GHS {unitPrice.toFixed(2)} <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#9ca3af" }}>/kg</span></span>
                      </div>
                    )}
                    {purchasePrice > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px" }}>
                        <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Extra commodity purchase price</span>
                        <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#374151" }}>GHS {purchasePrice.toFixed(2)} <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#9ca3af" }}>/kg</span></span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Info note */}
              <div style={{ borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb", padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="8" cy="8" r="7" stroke="#9ca3af" strokeWidth="1.3" />
                  <path d="M8 7v5M8 5v.5" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <p style={{ fontSize: "0.8125rem", color: "#6b7280", margin: 0, lineHeight: 1.55 }}>
                  Review the full action timeline on the left panel for the complete history of this request, including the reason for cancellation.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end">
              <button
                onClick={onClose}
                className="h-9 px-6 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Partial Recovery Modal ───────────────────────────────────────────────────

function PartialRecoveryModal({
  req,
  unitPrice,
  purchasePrice,
  onClose,
}: {
  req: RecoveryRequest;
  unitPrice: number;
  purchasePrice: number;
  onClose: () => void;
}) {
  const [listOpen, setListOpen] = useState(true);

  const bagWeightKg     = req.bagWeightKg ?? 100;
  const wantsDouble     = req.wantsDouble ?? false;
  const bagsExpected    = wantsDouble ? 2 : 1;
  const weightPerFarmer = bagWeightKg * bagsExpected;
  const totalExpected   = weightPerFarmer * req.farmersSupported;

  const farmers         = req.farmersList ?? [];
  const recovered       = farmers.filter((f) => f.recoveredKg != null);
  const pending         = farmers.filter((f) => f.recoveredKg == null);
  const totalRecovered  = recovered.reduce((s, f) => s + (f.recoveredKg ?? 0), 0);
  const progressPct     = Math.round((recovered.length / farmers.length) * 100);

  const agentColor    = avatarColor(req.agent);
  const agentInitials = initials(req.agent);
  const totalAmount   = req.farmersSupported * req.amountPerFarmer;

  function fmtDate(ds: string) {
    const [y, m, d] = ds.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

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
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#f59e0b" strokeWidth="1.4" />
                <path d="M4 8h4M8 5v6" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">Partially recovered</h2>
              <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                {recovered.length} of {farmers.length} farmers recovered · {totalRecovered.toLocaleString()} kg recorded
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

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">

          {/* Mobile strip */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div>
              <p className="text-[13px] font-bold text-gray-900">{req.groupName}</p>
              <p className="text-[11px] text-gray-500">{req.community} · {req.farmersSupported} farmers</p>
            </div>
          </div>

          {/* Left panel */}
          <div
            className="hidden md:flex flex-col gap-5 shrink-0 overflow-y-auto min-h-0"
            style={{ width: 310, borderRight: "1px solid var(--gray-100)", padding: "22px 20px 22px 24px" }}
          >
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</p>
              <p className="text-[15px] font-bold text-gray-900 leading-snug">{req.groupName}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{req.community}</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                <p className="text-[10px] text-gray-400 mb-0.5">Farmers supported</p>
                <p className="text-[20px] font-bold text-gray-900">{req.farmersSupported}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {([
                  { label: "Transaction ID", value: req.transactionId },
                  { label: "Date disbursed",  value: req.disbursedDate },
                  { label: "Total amount",    value: `GHS ${(req.farmersSupported * req.amountPerFarmer * bagsExpected).toLocaleString("en-GH")}` },
                  { label: "Per farmer",      value: `GHS ${(req.amountPerFarmer * bagsExpected).toFixed(2)}` },
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

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Agent</p>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: agentColor }}>
                  {agentInitials}
                </span>
                <p className="text-[13px] font-semibold text-gray-800">{req.agent}</p>
              </div>
            </div>

            {req.actionHistory && req.actionHistory.length > 0 && (
              <div>
                <ActionTimeline records={req.actionHistory} accordion />
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Progress banner */}
              <div style={{ borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", padding: "14px 16px" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#92400e", margin: 0 }}>Recovery in progress</p>
                    <p style={{ fontSize: "0.75rem", color: "#b45309", margin: "2px 0 0", fontWeight: 500 }}>
                      {recovered.length} of {farmers.length} farmers recovered · {pending.length} still pending
                    </p>
                  </div>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#d97706" }}>{progressPct}%</span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 8, borderRadius: 4, background: "#fef3c7", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progressPct}%`, background: "#f59e0b", borderRadius: 4, transition: "width 0.3s ease" }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span style={{ fontSize: "0.6875rem", color: "#b45309", fontWeight: 600 }}>
                    {totalRecovered.toLocaleString()} kg recorded
                  </span>
                  <span style={{ fontSize: "0.6875rem", color: "#9ca3af" }}>
                    {(totalExpected - totalRecovered).toLocaleString()} kg remaining
                  </span>
                </div>
              </div>

              {/* Double bag notice */}
              {wantsDouble && <DoubleBagBanner bagWeightKg={bagWeightKg} bagsExpected={bagsExpected} amountPerFarmer={req.amountPerFarmer} />}

              {/* Approved recovery parameters */}
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Approved recovery parameters
                </p>
                <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 500, margin: 0 }}>Recovery unit price</p>
                      <p style={{ fontSize: "0.6875rem", color: "#9ca3af", margin: "2px 0 0" }}>For calculating bag recovery value</p>
                    </div>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                      GHS {unitPrice.toFixed(2)}<span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", marginLeft: 4 }}>/kg</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f0fdf4" }}>
                    <div>
                      <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 600, margin: 0 }}>Recovery value per farmer</p>
                      <p style={{ fontSize: "0.6875rem", color: "#6b7280", margin: "2px 0 0" }}>{weightPerFarmer} kg × GHS {unitPrice.toFixed(2)}</p>
                    </div>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "#16a34a" }}>
                      GHS {(unitPrice * weightPerFarmer).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Farmer recovery list */}
              <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <button
                  onClick={() => setListOpen((v) => !v)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: listOpen ? "#f9fafb" : "#fff", borderBottom: listOpen ? "1px solid #e5e7eb" : "none", cursor: "pointer", border: "none", textAlign: "left" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "#6b7280" }}>
                      <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M1 14c0-3 2.2-5 5-5h1c2.8 0 5 2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151" }}>Farmer recovery list</span>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#16a34a", background: "#f0fdf4", padding: "2px 8px", borderRadius: 20 }}>
                      {recovered.length} recovered
                    </span>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#d97706", background: "#fffbeb", padding: "2px 8px", borderRadius: 20 }}>
                      {pending.length} pending
                    </span>
                  </div>
                  <svg
                    width="13" height="13" viewBox="0 0 13 13" fill="none"
                    style={{ color: "#9ca3af", transform: listOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}
                  >
                    <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {listOpen && farmers.length > 0 && (
                  <>
                    {/* Column headers */}
                    <div style={{ display: "flex", alignItems: "center", padding: "7px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      <span style={{ flex: 1, fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Farmer</span>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", width: 110 }}>Weight recorded</span>
                    </div>

                    {/* Recovered farmers */}
                    {recovered.map((f, idx) => {
                      const color = avatarColor(f.name);
                      const ini   = initials(f.name);
                      return (
                        <div
                          key={f.id}
                          style={{ display: "flex", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f3f4f6", background: "#f0fdf4" }}
                        >
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <span style={{ width: 26, height: 26, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5625rem", fontWeight: 700, flexShrink: 0 }}>
                              {ini}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{f.name}</span>
                              {f.recoveredDate && (
                                <span style={{ fontSize: "0.6875rem", color: "#6b7280" }}>{fmtDate(f.recoveredDate)}</span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", width: 110, flexShrink: 0 }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#16a34a" }}>{f.recoveredKg} kg</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Pending farmers */}
                    {pending.map((f, idx) => {
                      const color  = avatarColor(f.name);
                      const ini    = initials(f.name);
                      const isLast = idx === pending.length - 1;
                      return (
                        <div
                          key={f.id}
                          style={{ display: "flex", alignItems: "center", padding: "9px 16px", borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
                        >
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <span style={{ width: 26, height: 26, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5625rem", fontWeight: 700, flexShrink: 0 }}>
                              {ini}
                            </span>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                          </div>
                          <div style={{ textAlign: "right", width: 110, flexShrink: 0 }}>
                            <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: 600 }}>Pending</span>
                            <span style={{ display: "block", fontSize: "0.6875rem", color: "#9ca3af" }}>exp. {weightPerFarmer} kg</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Summary footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#fffbeb", borderTop: "1px solid #fde68a" }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#92400e" }}>
                        Total recovered so far
                      </span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#d97706" }}>
                        {totalRecovered.toLocaleString()} kg
                        <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#9ca3af", marginLeft: 4 }}>
                          of {totalExpected.toLocaleString()} kg expected
                        </span>
                      </span>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end">
              <button
                onClick={onClose}
                className="h-9 px-6 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Full Recovery Modal ───────────────────────────────────────────────────────

function FullRecoveryModal({
  req,
  unitPrice,
  purchasePrice,
  onClose,
}: {
  req: RecoveryRequest;
  unitPrice: number;
  purchasePrice: number;
  onClose: () => void;
}) {
  const [listOpen, setListOpen] = useState(true);

  const bagWeightKg     = req.bagWeightKg ?? 100;
  const wantsDouble     = req.wantsDouble ?? false;
  const bagsExpected    = wantsDouble ? 2 : 1;
  const weightPerFarmer = bagWeightKg * bagsExpected;

  const farmers        = req.farmersList ?? [];
  const totalRecovered = farmers.reduce((s, f) => s + (f.recoveredKg ?? 0), 0);
  const totalValue     = totalRecovered * unitPrice;

  const agentColor    = avatarColor(req.agent);
  const agentInitials = initials(req.agent);
  const totalAmount   = req.farmersSupported * req.amountPerFarmer;

  function fmtDate(ds: string) {
    const [y, m, d] = ds.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

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
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#059669" strokeWidth="1.4" />
                <path d="M5 8l2.5 2.5 4-5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">Fully recovered</h2>
              <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                All {farmers.length} farmers recovered · {totalRecovered.toLocaleString()} kg total
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

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">

          {/* Mobile strip */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div>
              <p className="text-[13px] font-bold text-gray-900">{req.groupName}</p>
              <p className="text-[11px] text-gray-500">{req.community} · {req.farmersSupported} farmers</p>
            </div>
          </div>

          {/* Left panel */}
          <div
            className="hidden md:flex flex-col gap-5 shrink-0 overflow-y-auto min-h-0"
            style={{ width: 310, borderRight: "1px solid var(--gray-100)", padding: "22px 20px 22px 24px" }}
          >
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Group</p>
              <p className="text-[15px] font-bold text-gray-900 leading-snug">{req.groupName}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{req.community}</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-3" style={{ background: "var(--gray-50)" }}>
                <p className="text-[10px] text-gray-400 mb-0.5">Farmers supported</p>
                <p className="text-[20px] font-bold text-gray-900">{req.farmersSupported}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {([
                  { label: "Transaction ID", value: req.transactionId },
                  { label: "Date disbursed",  value: req.disbursedDate },
                  { label: "Total amount",    value: `GHS ${(req.farmersSupported * req.amountPerFarmer * bagsExpected).toLocaleString("en-GH")}` },
                  { label: "Per farmer",      value: `GHS ${(req.amountPerFarmer * bagsExpected).toFixed(2)}` },
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

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Agent</p>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: agentColor }}>
                  {agentInitials}
                </span>
                <p className="text-[13px] font-semibold text-gray-800">{req.agent}</p>
              </div>
            </div>

            {req.actionHistory && req.actionHistory.length > 0 && (
              <div>
                <ActionTimeline records={req.actionHistory} accordion />
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Completion banner */}
              <div style={{ borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px 16px" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5 6.5-7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#14532d", margin: 0 }}>Recovery complete</p>
                    <p style={{ fontSize: "0.75rem", color: "#16a34a", margin: "2px 0 0" }}>
                      All {farmers.length} farmers have been recovered from
                    </p>
                  </div>
                </div>
                {/* Summary stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "#fff", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: "0.6875rem", color: "#6b7280", margin: "0 0 2px" }}>Total commodity recovered</p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 800, color: "#059669", margin: 0 }}>{totalRecovered.toLocaleString()} kg</p>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: "0.6875rem", color: "#6b7280", margin: "0 0 2px" }}>Total recovery value</p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 800, color: "#059669", margin: 0 }}>GHS {totalValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

              {/* Double bag notice */}
              {wantsDouble && <DoubleBagBanner bagWeightKg={bagWeightKg} bagsExpected={bagsExpected} amountPerFarmer={req.amountPerFarmer} />}

              {/* Approved recovery parameters */}
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Approved recovery parameters
                </p>
                <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 500, margin: 0 }}>Recovery unit price</p>
                      <p style={{ fontSize: "0.6875rem", color: "#9ca3af", margin: "2px 0 0" }}>For calculating bag recovery value</p>
                    </div>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                      GHS {unitPrice.toFixed(2)}<span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", marginLeft: 4 }}>/kg</span>
                    </span>
                  </div>
                  {purchasePrice > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                      <div>
                        <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 500, margin: 0 }}>Extra commodity purchase price</p>
                        <p style={{ fontSize: "0.6875rem", color: "#9ca3af", margin: "2px 0 0" }}>For surplus purchases beyond recovery</p>
                      </div>
                      <span style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                        GHS {purchasePrice.toFixed(2)}<span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", marginLeft: 4 }}>/kg</span>
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f0fdf4" }}>
                    <div>
                      <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 600, margin: 0 }}>Recovery value per farmer</p>
                      <p style={{ fontSize: "0.6875rem", color: "#6b7280", margin: "2px 0 0" }}>{weightPerFarmer} kg × GHS {unitPrice.toFixed(2)}</p>
                    </div>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "#16a34a" }}>
                      GHS {(unitPrice * weightPerFarmer).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* All farmers list */}
              <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <button
                  onClick={() => setListOpen((v) => !v)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: listOpen ? "#f9fafb" : "#fff", borderBottom: listOpen ? "1px solid #e5e7eb" : "none", cursor: "pointer", border: "none", textAlign: "left" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "#6b7280" }}>
                      <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M1 14c0-3 2.2-5 5-5h1c2.8 0 5 2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151" }}>All farmers</span>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#059669", background: "#f0fdf4", padding: "2px 8px", borderRadius: 20 }}>
                      {farmers.length} fully recovered
                    </span>
                  </div>
                  <svg
                    width="13" height="13" viewBox="0 0 13 13" fill="none"
                    style={{ color: "#9ca3af", transform: listOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}
                  >
                    <path d="M2 4.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {listOpen && farmers.length > 0 && (
                  <>
                    {/* Column headers */}
                    <div style={{ display: "flex", alignItems: "center", padding: "7px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      <span style={{ flex: 1, fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Farmer</span>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", width: 130 }}>Weight recorded</span>
                    </div>

                    {farmers.map((f, idx) => {
                      const color  = avatarColor(f.name);
                      const ini    = initials(f.name);
                      const isLast = idx === farmers.length - 1;
                      return (
                        <div
                          key={f.id}
                          style={{ display: "flex", alignItems: "center", padding: "9px 16px", borderBottom: isLast ? "none" : "1px solid #f3f4f6", background: "#f0fdf4" }}
                        >
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <span style={{ width: 26, height: 26, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5625rem", fontWeight: 700, flexShrink: 0 }}>
                              {ini}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{f.name}</span>
                              {f.recoveredDate && (
                                <span style={{ fontSize: "0.6875rem", color: "#6b7280" }}>{fmtDate(f.recoveredDate)}</span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", width: 130, flexShrink: 0 }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#059669" }}>{f.recoveredKg ?? weightPerFarmer} kg</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Total footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#dcfce7", borderTop: "1px solid #bbf7d0" }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#14532d" }}>Total recovered</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#059669" }}>
                        {totalRecovered.toLocaleString()} kg
                        <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", marginLeft: 4 }}>
                          ({farmers.length} × {weightPerFarmer} kg)
                        </span>
                      </span>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end">
              <button
                onClick={onClose}
                className="h-9 px-6 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
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

  const dotColor  = isExpired ? "#ef4444" : isEndingSoon ? "#f59e0b" : "#f97316";
  const bgColor   = isExpired ? "#fef2f2" : isEndingSoon ? "#fffbeb" : "#fff7ed";
  const bdColor   = isExpired ? "#fecaca" : isEndingSoon ? "#fde68a" : "#fed7aa";
  const headColor = isExpired ? "#991b1b" : isEndingSoon ? "#92400e" : "#7c2d12";
  const subColor  = isExpired ? "#dc2626" : isEndingSoon ? "#b45309" : "#ea580c";
  const btnBorder = isExpired ? "#fca5a5" : isEndingSoon ? "#fcd34d" : "#fdba74";
  const btnColor  = isExpired ? "#991b1b" : isEndingSoon ? "#92400e" : "#9a3412";

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
  const [financingReq,       setFinancingReq]       = useState<RecoveryRequest | null>(null);
  const [activatedReq,       setActivatedReq]       = useState<RecoveryRequest | null>(null);
  const [pendingRecoveryReq, setPendingRecoveryReq] = useState<RecoveryRequest | null>(null);
  const [canceledReq,        setCanceledReq]        = useState<RecoveryRequest | null>(null);
  const [partialReq,         setPartialReq]         = useState<RecoveryRequest | null>(null);
  const [fullReq,            setFullReq]            = useState<RecoveryRequest | null>(null);
  const [stageOverrides, setStageOverrides] = useState<Record<string, RecoveryStage>>({});
  const [priceOverrides, setPriceOverrides] = useState<Record<string, { unitPrice: number; purchasePrice: number }>>({});
  const [dynamicActions, setDynamicActions] = useState<Record<string, ActionRecord[]>>({});
  const [filters,        setFilters]        = useState<ActiveFilters>(DEFAULT_FILTERS);

  function enrichActions(req: RecoveryRequest): RecoveryRequest {
    const additions = dynamicActions[req.id] ?? [];
    if (additions.length === 0) return req;
    return { ...req, actionHistory: [...(req.actionHistory ?? []), ...additions] };
  }

  function resolvedPrices(req: RecoveryRequest) {
    const overrides = priceOverrides[req.id];
    return {
      unitPrice:     overrides?.unitPrice     ?? req.approvedUnitPrice    ?? 0,
      purchasePrice: overrides?.purchasePrice ?? req.approvedPurchasePrice ?? 0,
    };
  }

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
    setDynamicActions((prev) => ({
      ...prev,
      [id]: [
        ...(prev[id] ?? []),
        {
          id: `${id}-mgr-${Date.now()}`,
          stage: "rec_finance_review" as const,
          actor: "Agent Manager",
          action: "Recovery request reviewed & approved",
          summary: `Set recovery unit price to GHS ${unitPrice.toFixed(2)}/kg${purchasePrice > 0 ? ` and extra commodity purchase price to GHS ${purchasePrice.toFixed(2)}/kg` : ""}. Forwarded to finance for activation.`,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
    setReviewingReq(null);
  }

  function handleFinanceActivate(id: string, finalPurchasePrice: number, comment: string) {
    const prevPurchasePrice = priceOverrides[id]?.purchasePrice ?? 0;
    const priceAdjusted = Math.abs(finalPurchasePrice - prevPurchasePrice) > 0.001;
    setStageOverrides((prev) => ({ ...prev, [id]: "rec_approved" }));
    setPriceOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], purchasePrice: finalPurchasePrice },
    }));
    setDynamicActions((prev) => ({
      ...prev,
      [id]: [
        ...(prev[id] ?? []),
        {
          id: `${id}-fin-${Date.now()}`,
          stage: "rec_approved" as const,
          actor: "Finance Officer",
          action: "Recovery request activated",
          summary: priceAdjusted
            ? `Recovery activated with adjusted purchase price: GHS ${finalPurchasePrice.toFixed(2)}/kg (was GHS ${prevPurchasePrice.toFixed(2)}/kg). Reason: ${comment}`
            : `Recovery activated. Purchase price confirmed at GHS ${finalPurchasePrice.toFixed(2)}/kg.`,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
    setFinancingReq(null);
  }

  function handleCancelRequest(id: string, comment: string) {
    setStageOverrides((prev) => ({ ...prev, [id]: "rec_rejected" }));
    setDynamicActions((prev) => ({
      ...prev,
      [id]: [
        ...(prev[id] ?? []),
        {
          id: `${id}-cancel-${Date.now()}`,
          stage: "rec_rejected" as const,
          actor: "Finance Officer",
          action: "Recovery request canceled",
          summary: `Recovery request was canceled. Reason: ${comment} The field agent may submit a new request.`,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
    setActivatedReq(null);
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
            const isActivatedCol        = mobileColId === "rec_approved";
            const isFinanceCol          = mobileColId === "rec_finance_review";
            const isPendingRecoveryCol  = mobileColId === "rec_pending_recovery";
            const isCanceledCol         = mobileColId === "rec_rejected";
            const isPartialCol          = mobileColId === "rec_partial";
            const isFullCol             = mobileColId === "rec_full";
            const isViewOnly = isActivatedCol || isPendingRecoveryCol || isCanceledCol || isPartialCol || isFullCol;
            const ctaColor =
              isActivatedCol ? "#2563eb" :
              isCanceledCol  ? "#6b7280" :
              "var(--green-600)";
            const ctaHoverColor =
              isActivatedCol ? "#1d4ed8" :
              isCanceledCol  ? "#4b5563" :
              "var(--green-700, #15803d)";
            return cards.map((r) => {
              const farmers = r.farmersList ?? [];
              const recovered = farmers.filter((f) => f.recoveredKg != null);
              const cardSubText =
                isPartialCol ? `${recovered.length}/${farmers.length} farmers recovered` :
                isFullCol    ? `All ${farmers.length} farmers recovered` :
                undefined;
              return (
                <RecoveryCard
                  key={r.id}
                  req={r}
                  ctaLabel={isViewOnly ? "View details" : "Review"}
                  ctaColor={ctaColor}
                  ctaHoverColor={ctaHoverColor}
                  subText={cardSubText}
                  onReview={() => {
                    if (isActivatedCol)           setActivatedReq(r);
                    else if (isFinanceCol)         setFinancingReq(r);
                    else if (isPendingRecoveryCol) setPendingRecoveryReq(r);
                    else if (isCanceledCol)        setCanceledReq(r);
                    else if (isPartialCol)         setPartialReq(r);
                    else if (isFullCol)            setFullReq(r);
                    else                           setReviewingReq(r);
                  }}
                />
              );
            });
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
            const isActivatedCol       = col.id === "rec_approved";
            const isFinanceCol         = col.id === "rec_finance_review";
            const isPendingRecoveryCol = col.id === "rec_pending_recovery";
            const isCanceledCol        = col.id === "rec_rejected";
            const isPartialCol         = col.id === "rec_partial";
            const isFullCol            = col.id === "rec_full";
            const isViewOnly = isActivatedCol || isPendingRecoveryCol || isCanceledCol || isPartialCol || isFullCol;
            const colCtaColor =
              isActivatedCol ? "#2563eb" :
              isCanceledCol  ? "#6b7280" :
              "var(--green-600)";
            const colCtaHoverColor =
              isActivatedCol ? "#1d4ed8" :
              isCanceledCol  ? "#4b5563" :
              "var(--green-700, #15803d)";
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
                      : cards.map((r) => {
                          const _farmers  = r.farmersList ?? [];
                          const _recovered = _farmers.filter((f) => f.recoveredKg != null);
                          const _subText  =
                            isPartialCol ? `${_recovered.length}/${_farmers.length} farmers recovered` :
                            isFullCol    ? `All ${_farmers.length} farmers recovered` :
                            undefined;
                          return (
                            <RecoveryCard
                              key={r.id}
                              req={r}
                              ctaLabel={isViewOnly ? "View details" : "Review"}
                              ctaColor={colCtaColor}
                              ctaHoverColor={colCtaHoverColor}
                              subText={_subText}
                              onReview={() => {
                                if (isActivatedCol)            setActivatedReq(r);
                                else if (isFinanceCol)         setFinancingReq(r);
                                else if (isPendingRecoveryCol) setPendingRecoveryReq(r);
                                else if (isCanceledCol)        setCanceledReq(r);
                                else if (isPartialCol)         setPartialReq(r);
                                else if (isFullCol)            setFullReq(r);
                                else                           setReviewingReq(r);
                              }}
                            />
                          );
                        })
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
          req={enrichActions(reviewingReq)}
          onClose={() => setReviewingReq(null)}
          onApprove={handleApprove}
        />
      )}

      {/* ── Finance review modal ── */}
      {financingReq && priceOverrides[financingReq.id] && (
        <FinanceReviewModal
          req={enrichActions(financingReq)}
          approvedUnitPrice={priceOverrides[financingReq.id].unitPrice}
          approvedPurchasePrice={priceOverrides[financingReq.id].purchasePrice}
          onClose={() => setFinancingReq(null)}
          onActivate={handleFinanceActivate}
        />
      )}

      {/* ── Activated summary modal ── */}
      {activatedReq && priceOverrides[activatedReq.id] && (
        <ActivatedSummaryModal
          req={enrichActions(activatedReq)}
          approvedUnitPrice={priceOverrides[activatedReq.id].unitPrice}
          approvedPurchasePrice={priceOverrides[activatedReq.id].purchasePrice}
          onClose={() => setActivatedReq(null)}
          onCancel={handleCancelRequest}
        />
      )}

      {/* ── Pending recovery modal ── */}
      {pendingRecoveryReq && (() => {
        const { unitPrice, purchasePrice } = resolvedPrices(pendingRecoveryReq);
        return (
          <PendingRecoveryModal
            req={enrichActions(pendingRecoveryReq)}
            unitPrice={unitPrice}
            purchasePrice={purchasePrice}
            onClose={() => setPendingRecoveryReq(null)}
          />
        );
      })()}

      {/* ── Canceled summary modal ── */}
      {canceledReq && (() => {
        const { unitPrice, purchasePrice } = resolvedPrices(canceledReq);
        return (
          <CanceledSummaryModal
            req={enrichActions(canceledReq)}
            unitPrice={unitPrice}
            purchasePrice={purchasePrice}
            onClose={() => setCanceledReq(null)}
          />
        );
      })()}

      {/* ── Partial recovery modal ── */}
      {partialReq && (() => {
        const { unitPrice, purchasePrice } = resolvedPrices(partialReq);
        return (
          <PartialRecoveryModal
            req={enrichActions(partialReq)}
            unitPrice={unitPrice}
            purchasePrice={purchasePrice}
            onClose={() => setPartialReq(null)}
          />
        );
      })()}

      {/* ── Full recovery modal ── */}
      {fullReq && (() => {
        const { unitPrice, purchasePrice } = resolvedPrices(fullReq);
        return (
          <FullRecoveryModal
            req={enrichActions(fullReq)}
            unitPrice={unitPrice}
            purchasePrice={purchasePrice}
            onClose={() => setFullReq(null)}
          />
        );
      })()}

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
