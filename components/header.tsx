"use client";

// ---------------------------------------------------------------------------
// Top App Bar — full-width, no sidebar
// ---------------------------------------------------------------------------
export default function Header() {
  return (
    <header
      className="flex items-center justify-between bg-white border-b border-gray-200 px-6"
      style={{ height: 64, flexShrink: 0 }}
    >
      {/* Left: module title */}
      <h1 className="text-[22px] font-bold text-gray-900 tracking-tight select-none">
        Farmer support
      </h1>

      {/* Right: language selector + profile */}
      <div className="flex items-center gap-5">
        {/* Language selector */}
        <button
          className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
          disabled
          aria-label="Language selector"
        >
          {/* Globe icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
            <ellipse cx="8" cy="8" rx="2.5" ry="6.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M1.5 6h13M1.5 10h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span>English</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-gray-200" aria-hidden="true" />

        {/* User profile */}
        <button
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          disabled
          aria-label="User profile"
        >
          <div
            className="flex items-center justify-center rounded-full text-white font-bold text-[13px] select-none shrink-0"
            style={{ width: 36, height: 36, background: "#16A34A" }}
          >
            DG
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[14px] font-bold text-gray-900 leading-tight">Douglas Gockah</span>
            <span className="text-[12px] text-gray-400 leading-tight">Sommalife</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 4.5l3 3 3-3" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
