"use client";

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

function KanbanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="4" height="13" rx="1" fill="currentColor" />
      <rect x="8" y="2" width="4" height="9" rx="1" fill="currentColor" />
      <rect x="14" y="2" width="4" height="11" rx="1" fill="currentColor" />
    </svg>
  );
}

export default function Sidebar() {
  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="fixed top-0 left-0 h-full flex flex-col items-center py-4 gap-2 bg-white border-r border-border z-10"
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
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Farmer Support"
                aria-current="page"
                className="w-full flex items-center justify-center rounded-lg p-2.5 bg-[#F0FDF4] text-[#16A34A]"
              >
                <KanbanIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p>Farmer Support</p>
            </TooltipContent>
          </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
