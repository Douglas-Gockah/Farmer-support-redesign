"use client";

type ActiveScreen = "dashboard" | "kanban";

interface SidebarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="2" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="11" y="2" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="2" y="11" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="11" y="11" width="7" height="7" rx="1" fill="currentColor" />
    </svg>
  );
}

function KanbanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="2" width="4" height="13" rx="1" fill="currentColor" />
      <rect x="8" y="2" width="4" height="9" rx="1" fill="currentColor" />
      <rect x="14" y="2" width="4" height="11" rx="1" fill="currentColor" />
    </svg>
  );
}

export default function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  const navItems: { screen: ActiveScreen; label: string; icon: React.ReactNode }[] = [
    {
      screen: "dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      screen: "kanban",
      label: "Farmer Support",
      icon: <KanbanIcon />,
    },
  ];

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col items-center py-4 gap-2 bg-white border-r border-[#E5E7EB] z-10"
      style={{ width: 64 }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="mb-4 flex items-center justify-center">
        <div
          className="flex items-center justify-center rounded-lg text-white font-bold text-lg select-none"
          style={{ width: 36, height: 36, backgroundColor: "#16A34A" }}
          aria-label="TreeSyt logo"
        >
          T
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 w-full px-2" aria-label="Site navigation">
        {navItems.map(({ screen, label, icon }) => {
          const isActive = activeScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              title={label}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`w-full flex items-center justify-center rounded-lg p-2.5 transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#F0FDF4] text-[#16A34A]"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
            >
              {icon}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
