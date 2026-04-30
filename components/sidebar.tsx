"use client";

import { useState } from "react";

export type AppScreen = "dashboard" | "kanban";

// ─── Nav items (order matches the screenshot) ─────────────────────────────────

const NAV_ITEMS: { icon: string; label: string; screen: AppScreen | null }[] = [
  { icon: "edit_document",   label: "Farmer Support", screen: "kanban"    },
  { icon: "group",           label: "Profiles",       screen: null        },
  { icon: "forest",          label: "Agroforestry",   screen: null        },
  { icon: "barcode_scanner", label: "Scanner",        screen: null        },
  { icon: "handshake",       label: "Partnerships",   screen: null        },
  { icon: "home_pin",        label: "Dashboard",      screen: "dashboard" },
  { icon: "travel_explore",  label: "Explore",        screen: null        },
  { icon: "badge",           label: "Credentials",    screen: null        },
  { icon: "settings",        label: "Settings",       screen: null        },
];

// ─── Tooltip state shape ──────────────────────────────────────────────────────

interface TooltipState { label: string; top: number }

// ─── Sidebar ──────────────────────────────────────────────────────────────────

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
  const [expanded, setExpanded]   = useState(false);
  const [tooltip,  setTooltip]    = useState<TooltipState | null>(null);

  const W = expanded ? 220 : 64;

  function showTip(e: React.MouseEvent<HTMLButtonElement>, label: string) {
    if (expanded) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, top: r.top + r.height / 2 });
  }

  function hideTip() { setTooltip(null); }

  return (
    <>
      <aside
        className={[
          "flex flex-col bg-white flex-shrink-0",
          "fixed inset-y-0 left-0 z-40",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{
          width:       W,
          minWidth:    W,
          height:      "100vh",
          borderRight: "1px solid #d4d4d4",
          paddingTop:  24,
          paddingBottom: 24,
          transition:  "width 0.2s ease, min-width 0.2s ease",
          overflow:    "hidden",
        }}
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <div style={{ paddingLeft: 14, marginBottom: 10 }}>
          <div
            className="flex items-center justify-center font-bold text-white select-none flex-shrink-0"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#1ab373", fontSize: 18 }}
            aria-label="TreeSyt"
          >
            T
          </div>
        </div>

        {/* ── Expand / Collapse button ── */}
        <div style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 6 }}>
          <button
            onClick={() => { setExpanded((v) => !v); hideTip(); }}
            onMouseEnter={(e) => showTip(e, expanded ? "Collapse sidebar" : "Expand sidebar")}
            onMouseLeave={hideTip}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            className="flex items-center w-full transition-colors"
            style={{
              height:       56,
              borderRadius: 4,
              background:   "#e8f7f1",
              paddingLeft:  12,
              paddingRight: 12,
              gap:          expanded ? 10 : 0,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, color: "#1ab373", lineHeight: 1, flexShrink: 0 }}
              aria-hidden="true"
            >
              {expanded ? "left_panel_close" : "left_panel_open"}
            </span>
            {expanded && (
              <span style={{ fontSize: 13, fontWeight: 500, color: "#1ab373", whiteSpace: "nowrap" }}>
                Collapse
              </span>
            )}
          </button>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "#d4d4d4", margin: "0 14px 6px" }} />

        {/* ── Nav items ── */}
        <nav className="flex flex-col flex-1" aria-label="Site navigation">
          {NAV_ITEMS.map(({ icon, label, screen }) => {
            const active = screen !== null && screen === activeScreen;
            return (
              <div key={icon} style={{ paddingLeft: 8, paddingRight: 8 }}>
                <button
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  onClick={() => { if (screen) onNavigate(screen); onClose?.(); hideTip(); }}
                  onMouseEnter={(e) => showTip(e, label)}
                  onMouseLeave={hideTip}
                  className="flex items-center w-full transition-colors"
                  style={{
                    height:       56,
                    borderRadius: 4,
                    background:   active ? "#e8f7f1" : "transparent",
                    paddingLeft:  12,
                    paddingRight: 12,
                    gap:          expanded ? 10 : 0,
                  }}
                  onFocus={(e)  => { if (!active) e.currentTarget.style.background = "#f5f5f5"; }}
                  onBlur={(e)   => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.background = active ? "#d1f0e4" : "#efefef"; }}
                  onMouseUp={(e)   => { (e.currentTarget as HTMLButtonElement).style.background = active ? "#e8f7f1" : "transparent"; }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 22, color: active ? "#1ab373" : "#737373", lineHeight: 1, flexShrink: 0 }}
                    aria-hidden="true"
                  >
                    {icon}
                  </span>
                  {expanded && (
                    <span
                      style={{
                        fontSize:   13,
                        fontWeight: active ? 600 : 400,
                        color:      active ? "#1ab373" : "#374151",
                        whiteSpace: "nowrap",
                        overflow:   "hidden",
                      }}
                    >
                      {label}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── Tooltip (position:fixed escapes overflow:hidden) ── */}
      {tooltip && !expanded && (
        <div
          role="tooltip"
          style={{
            position:     "fixed",
            left:         W + 8,
            top:          tooltip.top,
            transform:    "translateY(-50%)",
            background:   "#171717",
            color:        "#fff",
            padding:      "8px 16px",
            borderRadius: 8,
            fontSize:     13,
            fontWeight:   500,
            whiteSpace:   "nowrap",
            zIndex:       9999,
            pointerEvents:"none",
          }}
        >
          {/* Left-pointing arrow */}
          <span
            aria-hidden="true"
            style={{
              position:    "absolute",
              right:       "100%",
              top:         "50%",
              transform:   "translateY(-50%)",
              width:       0,
              height:      0,
              borderTop:   "5px solid transparent",
              borderBottom:"5px solid transparent",
              borderRight: "5px solid #171717",
            }}
          />
          {tooltip.label}
        </div>
      )}
    </>
  );
}
