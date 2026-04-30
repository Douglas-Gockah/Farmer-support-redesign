"use client";

import { useState, useEffect } from "react";

export type AppScreen = "dashboard" | "kanban";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavChild {
  label:  string;
  screen: AppScreen;
}

interface NavItem {
  icon:      string;
  label:     string;
  children?: NavChild[];
}

// ─── Nav structure (matches expanded sidebar screenshot) ──────────────────────

const NAV_ITEMS: NavItem[] = [
  { icon: "edit_document",   label: "Forms"          },
  { icon: "group",           label: "Profiles",       children: [] },
  { icon: "forest",          label: "Green Tracker",  children: [] },
  { icon: "barcode_scanner", label: "Purchases",      children: [] },
  {
    icon: "handshake",
    label: "Farmer support",
    children: [
      { label: "Dashboard", screen: "dashboard" },
      { label: "Requests",  screen: "kanban"    },
    ],
  },
  { icon: "badge",           label: "Workshops",      children: [] },
  { icon: "travel_explore",  label: "Traceboard",     children: [] },
];

const SETTINGS_ITEM: NavItem = { icon: "settings", label: "Settings" };

// Primary collapsed-mode screen for items that have children
function primaryScreen(item: NavItem): AppScreen | null {
  if (!item.children?.length) return null;
  return item.children[0].screen;
}

// Which group key (icon) contains the given screen
function groupForScreen(screen: AppScreen): string | null {
  for (const item of NAV_ITEMS) {
    if (item.children?.some((c) => c.screen === screen)) return item.icon;
  }
  return null;
}

// ─── Inline SVG logo mark (approximation of treeSyt icon) ────────────────────

function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="9" fill="#1ab373" />
      {/* Circular arc — left / bottom sweep */}
      <path
        d="M18 8 C12.5 8 8 12.5 8 18 C8 23.5 12.5 28 18 28"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Circular arc — right / top sweep (loop) */}
      <path
        d="M18 28 C23.5 28 28 23.5 28 18 C28 13 24 9.5 20 8.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* t crossbar */}
      <line
        x1="13.5" y1="17" x2="22.5" y2="17"
        stroke="white" strokeWidth="2.4" strokeLinecap="round"
      />
      {/* t vertical stem */}
      <line
        x1="18" y1="17" x2="18" y2="27"
        stroke="white" strokeWidth="2.4" strokeLinecap="round"
      />
      {/* Leaf at top */}
      <path
        d="M18 8.5 C17 6.5 14.5 7 15 9 C15.5 11 18 11 18 8.5Z"
        fill="white"
      />
    </svg>
  );
}

// ─── Tooltip state ────────────────────────────────────────────────────────────

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
  const [expanded,   setExpanded]   = useState(false);
  const [openGroup,  setOpenGroup]  = useState<string | null>(null);
  const [tooltip,    setTooltip]    = useState<TooltipState | null>(null);

  // Auto-open the parent group when sidebar expands or active screen changes
  useEffect(() => {
    if (expanded) {
      const g = groupForScreen(activeScreen);
      if (g) setOpenGroup(g);
    }
  }, [expanded, activeScreen]);

  const W = expanded ? 240 : 64;

  function showTip(e: React.MouseEvent<HTMLButtonElement>, label: string) {
    if (expanded) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, top: r.top + r.height / 2 });
  }
  function hideTip() { setTooltip(null); }

  function toggleExpand() {
    setExpanded((v) => !v);
    hideTip();
  }

  function toggleGroup(icon: string) {
    setOpenGroup((prev) => (prev === icon ? null : icon));
  }

  function navigate(screen: AppScreen) {
    onNavigate(screen);
    onClose?.();
    hideTip();
  }

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
          width:         W,
          minWidth:      W,
          height:        "100vh",
          borderRight:   "1px solid #d4d4d4",
          paddingTop:    24,
          paddingBottom: 24,
          transition:    "width 0.2s ease, min-width 0.2s ease",
          overflow:      "hidden",
        }}
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <div
          className="flex items-center"
          style={{ paddingLeft: 14, marginBottom: 14, gap: 10, overflow: "hidden" }}
        >
          <LogoMark size={36} />
          {expanded && (
            <span
              style={{
                fontSize:   22,
                fontWeight: 700,
                color:      "#1ab373",
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}
            >
              treeSyt
            </span>
          )}
        </div>

        {/* ── Collapse / Expand button ── */}
        <div style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 6 }}>
          <button
            onClick={toggleExpand}
            onMouseEnter={(e) => showTip(e, "Expand sidebar")}
            onMouseLeave={hideTip}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            className="flex items-center w-full transition-colors"
            style={{
              height:        48,
              borderRadius:  6,
              paddingLeft:   10,
              paddingRight:  10,
              background:    "transparent",
              justifyContent: expanded ? "space-between" : "center",
            }}
          >
            {expanded && (
              <span style={{ fontSize: 13, color: "#525252", whiteSpace: "nowrap" }}>
                Collapse sidebar
              </span>
            )}
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, color: "#737373", lineHeight: 1, flexShrink: 0 }}
              aria-hidden="true"
            >
              {expanded ? "left_panel_close" : "left_panel_open"}
            </span>
          </button>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "#e5e5e5", margin: "0 14px 8px" }} />

        {/* ── Nav items ── */}
        <nav
          className="flex flex-col flex-1 overflow-y-auto"
          style={{ paddingLeft: 8, paddingRight: 8 }}
          aria-label="Site navigation"
        >
          {NAV_ITEMS.map((item) => {
            const { icon, label, children } = item;
            const hasChildren  = Array.isArray(children) && children.length > 0;
            const isGroupOpen  = openGroup === icon;
            const childActive  = children?.some((c) => c.screen === activeScreen) ?? false;

            // collapsed: item is "active" if it maps to the active screen directly
            // or its primary screen matches
            const directScreen = primaryScreen(item);
            const collapsedActive = !expanded && (
              directScreen === activeScreen || childActive
            );

            return (
              <div key={icon}>
                {/* ── Parent row ── */}
                <button
                  aria-label={label}
                  aria-expanded={hasChildren ? isGroupOpen : undefined}
                  onClick={() => {
                    if (expanded) {
                      if (hasChildren) {
                        toggleGroup(icon);
                      }
                      // Items without children in expanded mode do nothing yet
                    } else {
                      // Collapsed: navigate to primary screen if available
                      if (directScreen) navigate(directScreen);
                    }
                  }}
                  onMouseEnter={(e) => showTip(e, label)}
                  onMouseLeave={hideTip}
                  className="flex items-center w-full transition-colors"
                  style={{
                    height:       48,
                    borderRadius: 6,
                    paddingLeft:  10,
                    paddingRight: 10,
                    background:   collapsedActive ? "#f0fdf6" : "transparent",
                    gap:          expanded ? 10 : 0,
                    justifyContent: expanded ? "flex-start" : "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize:  22,
                      lineHeight: 1,
                      flexShrink: 0,
                      color:     (expanded ? childActive : collapsedActive)
                                   ? "#1ab373"
                                   : "#737373",
                    }}
                    aria-hidden="true"
                  >
                    {icon}
                  </span>

                  {expanded && (
                    <>
                      <span
                        style={{
                          flex:       1,
                          fontSize:   14,
                          fontWeight: childActive ? 600 : 400,
                          color:      childActive ? "#1ab373" : "#404040",
                          whiteSpace: "nowrap",
                          overflow:   "hidden",
                          textAlign:  "left",
                        }}
                      >
                        {label}
                      </span>

                      {/* Chevron — only for items that have children */}
                      {Array.isArray(children) && (
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize:   18,
                            color:      childActive ? "#1ab373" : "#a3a3a3",
                            flexShrink: 0,
                            transition: "transform 0.15s",
                            transform:  isGroupOpen ? "rotate(180deg)" : "none",
                          }}
                          aria-hidden="true"
                        >
                          keyboard_arrow_down
                        </span>
                      )}
                    </>
                  )}
                </button>

                {/* ── Children (expanded + open) ── */}
                {expanded && isGroupOpen && hasChildren && (
                  <div style={{ paddingLeft: 10, marginBottom: 4 }}>
                    {children!.map((child) => {
                      const active = child.screen === activeScreen;
                      return (
                        <button
                          key={child.screen}
                          onClick={() => navigate(child.screen)}
                          className="flex items-center w-full relative transition-colors"
                          style={{
                            height:       40,
                            paddingLeft:  22,
                            paddingRight: 10,
                            borderRadius: 6,
                            background:   "transparent",
                          }}
                        >
                          {/* Active left bar */}
                          {active && (
                            <span
                              aria-hidden="true"
                              style={{
                                position:     "absolute",
                                right:        0,
                                top:          "50%",
                                transform:    "translateY(-50%)",
                                width:        3,
                                height:       24,
                                borderRadius: "2px 0 0 2px",
                                background:   "#1ab373",
                              }}
                            />
                          )}
                          <span
                            style={{
                              fontSize:   14,
                              fontWeight: active ? 600 : 400,
                              color:      active ? "#1ab373" : "#525252",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {child.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Settings (pinned bottom) ── */}
        <div style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8, borderTop: "1px solid #e5e5e5" }}>
          <button
            aria-label="Settings"
            onMouseEnter={(e) => showTip(e, "Settings")}
            onMouseLeave={hideTip}
            className="flex items-center w-full transition-colors"
            style={{
              height:        48,
              borderRadius:  6,
              paddingLeft:   10,
              paddingRight:  10,
              background:    "transparent",
              gap:           expanded ? 10 : 0,
              justifyContent: expanded ? "flex-start" : "center",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, color: "#737373", lineHeight: 1, flexShrink: 0 }}
              aria-hidden="true"
            >
              settings
            </span>
            {expanded && (
              <span style={{ fontSize: 14, color: "#404040", whiteSpace: "nowrap" }}>
                Settings
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Tooltip (position:fixed, escapes overflow:hidden) ── */}
      {tooltip && !expanded && (
        <div
          role="tooltip"
          style={{
            position:      "fixed",
            left:          W + 10,
            top:           tooltip.top,
            transform:     "translateY(-50%)",
            background:    "#171717",
            color:         "#fff",
            padding:       "8px 14px",
            borderRadius:  8,
            fontSize:      13,
            fontWeight:    500,
            whiteSpace:    "nowrap",
            zIndex:        9999,
            pointerEvents: "none",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position:     "absolute",
              right:        "100%",
              top:          "50%",
              transform:    "translateY(-50%)",
              width:        0,
              height:       0,
              borderTop:    "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight:  "5px solid #171717",
            }}
          />
          {tooltip.label}
        </div>
      )}
    </>
  );
}
