"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

type ActiveScreen = "dashboard" | "kanban";

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("kanban");

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Left sidebar */}
      <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />

      {/* Main content */}
      <div className="flex flex-col flex-1" style={{ marginLeft: 64 }}>
        {/* Top header */}
        <Header activeScreen={activeScreen} />

        {/* Page body */}
        <main className="flex-1 p-6">
          {activeScreen === "dashboard" && (
            <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-gray-300 bg-white">
              <p className="text-gray-400 text-sm">Dashboard content coming soon</p>
            </div>
          )}
          {activeScreen === "kanban" && (
            <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-gray-300 bg-white">
              <p className="text-gray-400 text-sm">Farmer Support board coming soon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
