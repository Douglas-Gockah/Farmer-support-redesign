import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import KanbanScreen from "@/components/kanban-screen";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Header />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <KanbanScreen />
        </div>
      </div>
    </div>
  );
}
