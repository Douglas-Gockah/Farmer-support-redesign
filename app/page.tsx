"use client";

import Header from "@/components/header";
import KanbanScreen from "@/components/kanban-screen";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <KanbanScreen />
      </div>
    </div>
  );
}
