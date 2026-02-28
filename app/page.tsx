"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import DashboardScreen from "@/components/dashboard-screen";
import KanbanScreen from "@/components/kanban-screen";

type ActiveScreen = "dashboard" | "kanban";

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("dashboard");

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Left sidebar */}
      <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />

      {/* Main content */}
      <div className="flex flex-col flex-1" style={{ marginLeft: 64 }}>
        {/* Top header */}
        <Header activeScreen={activeScreen} />

        {/* Page body */}
        <main className="flex-1 overflow-hidden p-6">
          {activeScreen === "dashboard" && <DashboardScreen />}
          {activeScreen === "kanban" && <KanbanScreen />}
        </main>
      </div>
    </div>
  );
}
