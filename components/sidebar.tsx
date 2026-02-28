"use client";

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { LayoutDashboard, Wheat, Users, BarChart2, Settings } from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",       active: false },
  { icon: Wheat,           label: "Farmer Support",  active: true  },
  { icon: Users,           label: "Profiles",        active: false },
  { icon: BarChart2,       label: "Reports",         active: false },
  { icon: Settings,        label: "Settings",        active: false },
];

export default function Sidebar() {
  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="flex flex-col items-center bg-white border-r border-gray-200"
        style={{ width: 56, minWidth: 56, height: "100vh", flexShrink: 0 }}
        aria-label="Main navigation"
      >
        {/* Logo mark */}
        <div style={{ marginTop: 16, marginBottom: 12 }}>
          <div
            className="flex items-center justify-center rounded-lg font-bold text-white select-none"
            style={{ width: 36, height: 36, background: "#16A34A", fontSize: 18 }}
            aria-label="TreeSyt"
          >
            T
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col items-center gap-1 w-full px-1.5" aria-label="Site navigation">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
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
                    background: active ? "#F0FDF4" : "transparent",
                    color: active ? "#16A34A" : "#6B7280",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#F3F4F6"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Active left border indicator */}
                  {active && (
                    <span
                      className="absolute left-0 top-2 bottom-2 rounded-r-full"
                      style={{ width: 3, background: "#16A34A" }}
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
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
