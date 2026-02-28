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
      style={{
        width: 280,
        background: "#16A34A",
        color: "#fff",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        opacity: visible ? 1 : 0,
        transition: "opacity 500ms ease",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-end",
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} onDone={() => onRemove(t.id)} />
      ))}
    </div>
  );
}
