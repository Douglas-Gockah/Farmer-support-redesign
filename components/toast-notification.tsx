"use client";

import { useEffect, useState } from "react";

export interface ToastMessage {
  id: number;
  message: string;
}

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), 2700);
    const removeTimer = setTimeout(() => onDone(), 3200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onDone]);

  return (
    <div
      className="flex items-center gap-3 text-white text-[13px] font-semibold px-4 py-3 rounded-xl shadow-xl"
      style={{
        width: 280,
        background: "#16A34A",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        opacity: visible ? 1 : 0,
        transition: "opacity 500ms ease",
        pointerEvents: "none",
      }}
    >
      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {message}
    </div>
  );
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} onDone={() => onRemove(t.id)} />
      ))}
    </div>
  );
}
