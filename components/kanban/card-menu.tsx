"use client";

import { useState, useRef, useEffect } from "react";

interface CardMenuProps {
  onView: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function CardMenu({ onView, onEdit, onReject }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [
    { label: "View Details",       onClick: () => { setOpen(false); onView();   }, red: false },
    { label: "Edit Application",   onClick: () => { setOpen(false); onEdit();   }, red: false },
    { label: "Reject Application", onClick: () => { setOpen(false); onReject(); }, red: true  },
  ];

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-label="Card options"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3"  r="1.2" fill="currentColor" />
          <circle cx="8" cy="8"  r="1.2" fill="currentColor" />
          <circle cx="8" cy="13" r="1.2" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 rounded-lg bg-white shadow-lg border border-gray-100 py-1 overflow-hidden">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full text-left px-4 py-2 text-[13px] font-medium transition-colors hover:bg-gray-50"
              style={{ color: item.red ? "#DC2626" : "#374151" }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
