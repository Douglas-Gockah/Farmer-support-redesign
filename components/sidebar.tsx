"use client";

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { LayoutDashboard, Wheat, Users, BarChart2, Settings } from "lucide-react";

export type AppScreen = "dashboard" | "kanban";

const NAV_ITEMS: { icon: typeof LayoutDashboard; label: string; screen: AppScreen | null }[] = [
  { icon: LayoutDashboard, label: "Dashboard",      screen: "dashboard" },
  { icon: Wheat,           label: "Farmer Support", screen: "kanban"    },
  { icon: Users,           label: "Profiles",       screen: null        },
  { icon: BarChart2,       label: "Reports",        screen: null        },
  { icon: Settings,        label: "Settings",       screen: null        },
];

export default function Sidebar({
  isOpen = false,
  onClose,
  activeScreen,
  onNavigate,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={[
          "flex flex-col items-center bg-white border-r border-gray-200 flex-shrink-0",
          "fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{ width: 56, minWidth: 56, height: "100vh" }}
        aria-label="Main navigation"
      >
        {/* Logo mark */}
        <div style={{ marginTop: 16, marginBottom: 12 }}>
          <div
            className="flex items-center justify-center rounded-lg font-bold text-white select-none"
            style={{ width: 36, height: 36, background: "var(--green-600)", fontSize: 18 }}
            aria-label="TreeSyt"
          >
            T
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col items-center gap-1 w-full px-1.5" aria-label="Site navigation">
          {NAV_ITEMS.map(({ icon: Icon, label, screen }) => {
            const active = screen !== null && screen === activeScreen;
            return (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <button
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                    className="relative flex items-center justify-center transition-colors"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: active ? "var(--green-25)" : "transparent",
                      color: active ? "var(--green-600)" : "var(--gray-500)",
                    }}
                    onClick={() => {
                      if (screen) onNavigate(screen);
                      onClose?.();
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--gray-100)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-2 bottom-2 rounded-r-full"
                        style={{ width: 3, background: "var(--green-600)" }}
                        aria-hidden="true"
                      />
                    )}
                    <Icon size={20} strokeWidth={1.8} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
