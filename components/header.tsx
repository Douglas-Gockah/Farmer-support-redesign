"use client";

interface HeaderProps {
  activeScreen: "dashboard" | "kanban";
}

const screenConfig = {
  dashboard: {
    title: "Dashboard",
    breadcrumb: "TreeSyt / Dashboard",
  },
  kanban: {
    title: "Farmer Support",
    breadcrumb: "TreeSyt / Farmer Support",
  },
};

export default function Header({ activeScreen }: HeaderProps) {
  const { title, breadcrumb } = screenConfig[activeScreen];

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#E5E7EB] h-16">
      {/* Left: page title + breadcrumb */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[18px] font-bold leading-tight text-gray-900">{title}</h1>
        <p className="text-[12px] text-gray-400 leading-none">{breadcrumb}</p>
      </div>

      {/* Right: user info */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-full text-white font-semibold text-sm select-none shrink-0"
          style={{ width: 36, height: 36, backgroundColor: "#16A34A" }}
          aria-label="User avatar"
        >
          DG
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-gray-900 leading-tight">Douglas Gockah</span>
          <span className="text-[11px] text-gray-400 leading-none">Gockanfo</span>
        </div>
      </div>
    </header>
  );
}
