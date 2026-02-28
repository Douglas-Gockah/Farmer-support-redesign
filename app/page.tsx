"use client";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import KanbanScreen from "@/components/kanban-screen";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left sidebar */}
        <Sidebar />

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", marginLeft: 64 }}>
          {/* Top header — fixed height */}
          <Header />

          {/* Kanban area — takes all remaining space */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <KanbanScreen />
          </div>
        </div>
      </div>
    </div>
  );
}
