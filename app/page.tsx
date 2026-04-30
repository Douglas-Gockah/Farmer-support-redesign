"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import KanbanScreen from "@/components/kanban-screen";
import DashboardScreen from "@/components/dashboard-screen";
import type { AppScreen } from "@/components/sidebar";

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("kanban");

  return (
    <AppShell activeScreen={screen} onNavigate={setScreen}>
      {screen === "dashboard" ? <DashboardScreen /> : <KanbanScreen />}
    </AppShell>
  );
}
