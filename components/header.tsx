"use client";

export default function Header({
  totalCount,
  search,
  onSearch,
}: {
  totalCount?: number;
  search?: string;
  onSearch?: (v: string) => void;
}) {
  return (
    <header
      className="flex items-center justify-between px-6 bg-white border-b border-[#E5E7EB]"
      style={{ height: 64, flexShrink: 0, gap: 16 }}
    >
      {/* Left: page title + count badge */}
      <div className="flex items-center gap-3 shrink-0">
        <h1 className="text-[18px] font-bold text-gray-900 leading-tight">Applications Board</h1>
        {totalCount !== undefined && (
          <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold" style={{ background: "#F3F4F6", color: "#374151" }}>
            {totalCount} total
          </span>
        )}
      </div>

      {/* Right: search + filter + avatar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search ?? ""}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search applications..."
            className="pl-9 pr-4 h-9 w-64 rounded-lg border border-gray-200 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] bg-white"
          />
        </div>

        {/* Filter button */}
        <button className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Filter
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center rounded-full text-white font-semibold text-[13px] select-none shrink-0"
            style={{ width: 34, height: 34, background: "#16A34A" }} aria-label="User avatar">
            DG
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-gray-900 leading-tight">Douglas Gockah</span>
            <span className="text-[11px] text-gray-400 leading-none">Gockanfo</span>
          </div>
        </div>
      </div>
    </header>
  );
}
