"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import KanbanScreen from "@/components/kanban-screen";
import DashboardScreen from "@/components/dashboard-screen";
import PurchasesScreen from "@/components/purchases-screen";
import type { AppScreen } from "@/components/sidebar";

const PURCHASES_SCREENS = new Set<AppScreen>([
  "purchases-dashboard",
  "purchases-list",
  "purchases-requests",
  "purchases-reconciliations",
  "purchases-pres",
  "purchases-warehouse",
]);

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("kanban");

  function renderScreen() {
    if (screen === "dashboard") return <DashboardScreen />;
    if (PURCHASES_SCREENS.has(screen)) {
      return <PurchasesScreen activeSubScreen={screen} onNavigate={setScreen} />;
    }
    return <KanbanScreen />;
  }

  return (
    <AppShell activeScreen={screen} onNavigate={setScreen}>
      {renderScreen()}
    </AppShell>
  );
}
