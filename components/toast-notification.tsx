"use client";

import { useEffect, useState } from "react";

export interface ToastMessage {
  id: number;
  message: string;
}

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer  = setTimeout(() => setVisible(false), 2700);
    const removeTimer = setTimeout(() => onDone(), 3200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onDone]);

  return (
    <div
      className="flex items-center gap-3"
      style={{
        width: 304,
        background: "#ffffff",
        border: "1px solid var(--green-200)",
        borderRadius: "var(--radius)",
        padding: "12px 14px",
        boxShadow: "0px 4px 16px rgba(16,24,40,0.10)",
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(4px)",
        transition: "opacity 500ms ease, transform 500ms ease",
        pointerEvents: "none",
      }}
    >
      {/* Success icon */}
      <span
        className="flex items-center justify-center shrink-0"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--green-50)",
          border: "1px solid var(--green-200)",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6l2.5 2.5 5.5-5"
            stroke="var(--green-600)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* Message */}
      <span
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--gray-800)",
          flex: 1,
          lineHeight: 1.4,
        }}
      >
        {message}
      </span>
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
