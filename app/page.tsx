"use client";

import Sidebar from "@/components/sidebar";
import KanbanScreen from "@/components/kanban-screen";

export default function Home() {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left sidebar */}
      <Sidebar />

      {/* Main content — header is inside KanbanScreen */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", marginLeft: 64 }}>
        <KanbanScreen />
      </div>
    </div>
  );
}
