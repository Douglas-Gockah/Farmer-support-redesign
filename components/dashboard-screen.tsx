"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ChevronDown, Check, X } from "lucide-react";
import { DateFilterChip } from "./kanban/date-filter-chip";
import { presetDates } from "./kanban/helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

type DashTab  = "Cash" | "Agroforestry";
type AgroType = "Nursery" | "Tree Planting" | "Parkland";

interface DashRecord {
  date:      Date;
  region:    string;
  district:  string;
  community: string;
  agent:     string;
  tab:       DashTab;
  agroType?: AgroType;
  farmers:   number;
  amount:    number;   // GHS (0 for agro)
  fulfilled: boolean;
  recovered: number;   // GHS recovered
}

// ─── Static lookup data ───────────────────────────────────────────────────────

const REGIONS = ["North East", "Northern", "Savannah", "Upper East", "Upper West"];

const REGION_DISTRICTS: Record<string, string[]> = {
  "North East":  ["Chereponi", "Mamprugu-Moagduri", "Nalerigu", "Yunyoo-Nasuan", "Bunkpurugu"],
  "Northern":    ["Mion", "Tamale Metro", "Sagnerigu", "Kumbungu", "Nanton"],
  "Savannah":    ["Salaga", "Bole", "Sawla-Tuna-Kalba", "West Gonja", "East Gonja"],
  "Upper East":  ["Bolgatanga", "Builsa South", "Bawku", "Kassena-Nankana", "Talensi"],
  "Upper West":  ["Wa Municipal", "Daffiama-Bussie-Issa", "Lawra", "Nandom", "Jirapa"],
};

const DISTRICT_COMMUNITIES: Record<string, string[]> = {
  "Chereponi":            ["Chereponi Town", "Wenchiki", "Nakpayili", "Tali"],
  "Mamprugu-Moagduri":    ["Walewale", "Yagaba", "Kubori", "Bunkpurugu Town"],
  "Nalerigu":             ["Nalerigu Town", "Gambaga", "Kpasinkpe"],
  "Yunyoo-Nasuan":        ["Yunyoo", "Nasuan", "Bimbagu"],
  "Bunkpurugu":           ["Bunkpurugu", "Siniensi", "Tatale"],
  "Mion":                 ["Sang", "Demon", "Gbullung", "Mion Town"],
  "Tamale Metro":         ["Tamale", "Datoyili", "Vittin", "Lamashegu"],
  "Sagnerigu":            ["Sagnerigu", "Dungu", "Kalpohini"],
  "Kumbungu":             ["Kumbungu", "Dohiini", "Chanshegu"],
  "Nanton":               ["Nanton", "Zangbalung", "Wantugu"],
  "Salaga":               ["Salaga Town", "Kpembe", "Buipe"],
  "Bole":                 ["Bole Town", "Mandari", "Tinga"],
  "Sawla-Tuna-Kalba":     ["Sawla", "Tuna", "Kalba"],
  "West Gonja":           ["Damongo", "Larabanga", "Yapei"],
  "East Gonja":           ["Salaga East", "Kpandai", "Zabzugu"],
  "Bolgatanga":           ["Bolga Town", "Zuarungu", "Sumbrugu"],
  "Builsa South":         ["Sandema", "Wiesi", "Kanjaga"],
  "Bawku":                ["Bawku Town", "Pusiga", "Zebilla"],
  "Kassena-Nankana":      ["Navrongo", "Paga", "Kayoro"],
  "Talensi":              ["Tongo", "Pwalugu", "Tampaala"],
  "Wa Municipal":         ["Wa Town", "Kperisi", "Sing"],
  "Daffiama-Bussie-Issa": ["Daffiama", "Bussie", "Issa"],
  "Lawra":                ["Lawra Town", "Babile", "Ko"],
  "Nandom":               ["Nandom Town", "Hamile", "Lambussie"],
  "Jirapa":               ["Jirapa Town", "Nako", "Ullo"],
};

const AGENTS = [
  "Kofi Mensah", "Ama Owusu", "Kwame Asante", "Akosua Boateng", "Yaw Darko",
  "Abena Frimpong", "Kweku Boateng", "Adjoa Tetteh", "Kojo Annan", "Efua Asare",
];

// ─── Seeded RNG ───────────────────────────────────────────────────────────────

function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 13), 1_540_483_477);
    s ^= s >>> 15;
    s = Math.imul(s, 2_246_822_519);
    return (s >>> 0) / 0x1_0000_0000;
  };
}

// ─── Generate mock records ────────────────────────────────────────────────────

function generateRecords(): DashRecord[] {
  const rng = mkRng(42);
  const records: DashRecord[] = [];

  function pick<T>(arr: T[]): T { return arr[Math.floor(rng() * arr.length)]; }

  // Bell-curve weights: peak = month 28 (Sep 2025) within Jan 2023–Dec 2025
  const N = 36;
  const W = Array.from({ length: N }, (_, i) => Math.exp(-0.5 * ((i - 28) / 9) ** 2));
  const WS = W.reduce((a, b) => a + b, 0);

  function pickMonth(): number {
    let r = rng() * WS, i = 0;
    while (i < N - 1 && (r -= W[i]) > 0) i++;
    return i;
  }

  function makeRecord(tab: DashTab, agroType?: AgroType): DashRecord {
    const mi = pickMonth();
    const year = 2023 + Math.floor(mi / 12);
    const month = mi % 12;
    const date = new Date(year, month, 1 + Math.floor(rng() * 28));
    const region = pick(REGIONS);
    const district = pick(REGION_DISTRICTS[region]);
    const community = pick(DISTRICT_COMMUNITIES[district] ?? ["Unknown"]);
    const agent = pick(AGENTS);
    const farmers = 12 + Math.floor(rng() * 56);
    const amount = tab === "Cash" ? 8_500 + Math.floor(rng() * 12_500) : 0;
    const fulfilled = rng() < 0.555;
    const recovered = fulfilled && tab === "Cash" ? amount * (0.98 + rng() * 0.06) : 0;
    return { date, region, district, community, agent, tab, agroType, farmers, amount, fulfilled, recovered };
  }

  for (let i = 0; i < 482; i++) records.push(makeRecord("Cash"));
  for (let i = 0; i < 216; i++) {
    const agroType = pick(["Nursery", "Nursery", "Tree Planting", "Tree Planting", "Parkland", "Parkland", "Parkland"] as AgroType[]);
    records.push(makeRecord("Agroforestry", agroType));
  }
  return records;
}

const ALL_RECORDS       = generateRecords();
const ALL_AGENTS_LIST   = [...new Set(ALL_RECORDS.map((r) => r.agent))].sort();
const ALL_COMM_LIST     = [...new Set(ALL_RECORDS.map((r) => r.community))].sort();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtGHS(n: number) {
  return "GHS " + n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtN(n: number) { return n.toLocaleString("en-GH"); }

// ─── FilterDropdown ───────────────────────────────────────────────────────────

function FilterDropdown({ label, options, value, onChange, searchable = false }: {
  label: string; options: string[]; value: string | null;
  onChange: (v: string | null) => void;
  searchable?: boolean;
}) {
  const [open,  setOpen]  = useState(false);
  const [hover, setHover] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const active   = value !== null;
  const filtered = searchable
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  function handleOpen() { setOpen((v) => !v); setQuery(""); }

  return (
    <div ref={ref} className="relative">
      {/* Pill container */}
      <div
        className="flex items-center rounded-lg border overflow-hidden"
        style={{
          height:      34,
          background:  active ? "#e8f7f1" : hover ? "#f5f5f5" : "#fff",
          borderColor: active ? "#1ab373" : "#d4d4d4",
          transition:  "background 0.12s, border-color 0.12s",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Trigger */}
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 pl-3 pr-2.5 h-full text-[13px] font-medium whitespace-nowrap"
          style={{ color: active ? "#15803d" : "#525252" }}
        >
          {value ?? label}
          <ChevronDown
            size={12}
            strokeWidth={2.5}
            style={{
              transition: "transform 0.15s",
              transform:  open ? "rotate(180deg)" : "none",
              color:      active ? "#15803d" : "#9ca3af",
              flexShrink: 0,
            }}
          />
        </button>

        {/* Clear button — only when a value is selected */}
        {active && (
          <>
            <div aria-hidden="true" style={{ width: 1, alignSelf: "stretch", margin: "7px 0", background: "#86efac" }} />
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null); setOpen(false); setQuery(""); }}
              className="flex items-center justify-center px-2.5 h-full"
              style={{ color: "#15803d" }}
              aria-label={`Clear ${label}`}
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
          style={{ minWidth: 220, maxWidth: 280 }}
        >
          {/* Combobox search input */}
          {searchable && (
            <div style={{ position: "relative", borderBottom: "1px solid #f3f4f6" }}>
              <svg
                width="15" height="15" viewBox="0 0 16 16" fill="none"
                aria-hidden="true"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search for ${label.replace(/^All /, "").toLowerCase()}…`}
                style={{
                  width:       "100%",
                  height:      46,
                  paddingLeft: 38,
                  paddingRight: 14,
                  fontSize:    14,
                  color:       "#374151",
                  background:  "transparent",
                  border:      "none",
                  outline:     "none",
                }}
              />
            </div>
          )}

          {/* Default / clear row */}
          {!searchable && (
            <>
              <button
                onClick={() => { onChange(null); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 flex items-center justify-between transition-colors"
                style={{ color: !active ? "#15803d" : "#6b7280" }}
              >
                {label}
                {!active && <Check size={12} style={{ color: "#16a34a" }} />}
              </button>
              <div style={{ height: 1, background: "#f3f4f6" }} />
            </>
          )}

          {/* Options list */}
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-[12px]" style={{ color: "#9ca3af" }}>No results found.</p>
            )}
            {filtered.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); setQuery(""); }}
                className="w-full text-left px-4 py-2.5 text-[14px] hover:bg-gray-50 flex items-center justify-between transition-colors"
                style={{ color: value === opt ? "#15803d" : "#1f2937", fontWeight: value === opt ? 600 : 400 }}
              >
                {opt}
                {value === opt && <Check size={12} style={{ color: "#16a34a" }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── StatCard (used by Agroforestry tab) ─────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
      <p className="text-[12px] text-gray-400 mb-2">{label}</p>
      <p className="text-[22px] font-bold text-gray-900 leading-tight">
        {typeof value === "number" ? fmtN(value) : value}
      </p>
    </div>
  );
}

// ─── FulfillmentCard (used by Cash tab KPIs) ──────────────────────────────────

function FulfillmentCard({
  label, total, fulfilled, totalDisplay, fulfilledDisplay,
}: {
  label: string;
  total: number;
  fulfilled: number;
  totalDisplay: string;
  fulfilledDisplay: string;
}) {
  const pct = total > 0 ? Math.round((fulfilled / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-gray-400">{label}</p>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "var(--green-50)", color: "var(--green-700)" }}
        >
          {pct}%
        </span>
      </div>
      <p className="text-[22px] font-bold text-gray-900 leading-tight">{totalDisplay}</p>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--gray-100)" }}>
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${pct}%`, background: "var(--green-600)" }}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--green-500)" }} />
          <span className="text-[12px] text-gray-400">Fulfilled</span>
        </div>
        <span className="text-[12px] font-semibold text-gray-700">{fulfilledDisplay}</span>
      </div>
    </div>
  );
}

// ─── Dual-line Area Chart ─────────────────────────────────────────────────────

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function DualAreaChart({ records }: { records: DashRecord[] }) {
  // Aggregate by month: total requested amount vs fulfilled amount
  const byMonth: Record<string, { requested: number; fulfilled: number }> = {};
  records.forEach(({ date, amount, fulfilled }) => {
    const k = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[k]) byMonth[k] = { requested: 0, fulfilled: 0 };
    byMonth[k].requested += amount;
    if (fulfilled) byMonth[k].fulfilled += amount;
  });

  const data: { key: string; month: number; year: number; requested: number; fulfilled: number }[] = [];
  for (let y = 2023; y <= 2025; y++) {
    for (let m = 0; m < 12; m++) {
      const k = `${y}-${String(m + 1).padStart(2, "0")}`;
      const d = byMonth[k] ?? { requested: 0, fulfilled: 0 };
      data.push({ key: k, month: m, year: y, ...d });
    }
  }
  const last = byMonth["2026-01"] ?? { requested: 0, fulfilled: 0 };
  data.push({ key: "2026-01", month: 0, year: 2026, ...last });

  const yearTicks = data.filter((d) => d.month === 0).map((d) => d.key);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      {/* Header + inline legend */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[15px] font-bold text-gray-900">Support fulfillment</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Requested vs fulfilled cash support over time</p>
        </div>
        <div className="flex items-center gap-5 shrink-0 pt-0.5">
          <div className="flex items-center gap-2">
            <svg width="24" height="8" aria-hidden="true">
              <line x1="0" y1="4" x2="24" y2="4" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 2" />
            </svg>
            <span className="text-[12px] text-gray-500">Requested</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="8" aria-hidden="true">
              <line x1="0" y1="4" x2="24" y2="4" stroke="#16A34A" strokeWidth="2" />
            </svg>
            <span className="text-[12px] text-gray-500">Fulfilled</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#9CA3AF" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#9CA3AF" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="fulGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#16A34A" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#16A34A" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="4 4" />
          <XAxis
            dataKey="key"
            ticks={yearTicks}
            tickFormatter={(v) => v.split("-")[0]}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={62}
            tickFormatter={(v: number) =>
              v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` :
              v >= 1_000     ? `${Math.round(v / 1_000)}K` :
              String(v)
            }
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              fmtGHS(value),
              name === "requested" ? "Requested" : "Fulfilled",
            ]}
            labelFormatter={(key: string) => {
              const d = data.find((x) => x.key === key);
              return d ? `${MONTH_ABBR[d.month]} ${d.year}` : key;
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
          />
          {/* Requested: dashed grey line, light fill */}
          <Area
            type="monotone"
            dataKey="requested"
            stroke="#9CA3AF"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            fill="url(#reqGrad)"
            dot={false}
          />
          {/* Fulfilled: solid green line, green fill — drawn on top */}
          <Area
            type="monotone"
            dataKey="fulfilled"
            stroke="#16A34A"
            strokeWidth={2}
            fill="url(#fulGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ title, subtitle, total, totalLabel, segments }: {
  title: string; subtitle: string; total: string; totalLabel: string;
  segments: { label: string; pct: number; value: string; color: string }[];
}) {
  const R = 70; const CX = 90; const CY = 90; const SW = 24;
  const C = 2 * Math.PI * R;
  let cum = 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <p className="text-[15px] font-bold text-gray-900">{title}</p>
      <p className="text-[12px] text-gray-400 mt-0.5 mb-5">{subtitle}</p>
      <div className="flex justify-center mb-5">
        <svg width={180} height={180} aria-hidden="true">
          {/* Track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F3F4F6" strokeWidth={SW} />
          {segments.map((seg, i) => {
            const pct = Math.min(Math.max(seg.pct, 0), 1);
            if (pct < 0.005) return null;
            const arc = C * pct;
            const dashoffset = C * 0.25 - cum;
            cum += arc;
            return (
              <circle
                key={i}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={SW}
                strokeDasharray={`${arc} ${C - arc}`}
                strokeDashoffset={dashoffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[12px] pb-2 mb-1" style={{ borderBottom: "1px solid var(--gray-100)" }}>
          <span className="text-gray-400">Total</span>
          <span className="font-bold text-gray-900">{total}{totalLabel ? ` ${totalLabel}` : ""}</span>
        </div>
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
              <span className="text-gray-500">{seg.label}</span>
            </div>
            <span className="text-gray-700 font-medium">
              {(Math.min(seg.pct, 1) * 100).toFixed(2)}% · {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal Bar Chart ─────────────────────────────────────────────────────

function DistrictBars({ records }: { records: DashRecord[] }) {
  const counts: Record<string, number> = {};
  records.forEach(({ district, farmers }) => {
    counts[district] = (counts[district] ?? 0) + farmers;
  });
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = rows[0]?.[1] ?? 1;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <p className="text-[15px] font-bold text-gray-900">District level interest</p>
      <p className="text-[12px] text-gray-400 mt-0.5 mb-5">
        Breakdown of district level farmer interest in cash support
      </p>
      <div className="space-y-4">
        {rows.map(([name, count]) => (
          <div key={name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] text-gray-800">{name}</span>
              <span className="text-[13px] text-gray-400 font-medium">{fmtN(count)} Farmers</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--gray-100)" }}>
              <div
                className="h-2.5 rounded-full"
                style={{ width: `${(count / max) * 100}%`, background: "var(--green-600)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Agroforestry Bar Chart ───────────────────────────────────────────────────

function AgroBarChart({ records }: { records: DashRecord[] }) {
  const counts: Record<string, number> = { Nursery: 0, "Tree Planting": 0, Parkland: 0 };
  records.forEach(({ agroType }) => { if (agroType) counts[agroType]++; });
  const data = Object.entries(counts).map(([type, count]) => ({ type, count }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <p className="text-[15px] font-bold text-gray-900">Interest in Agroforestry</p>
      <p className="text-[12px] text-gray-400 mt-0.5 mb-6">
        Breakdown of farmer groups interest in agroforestry
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 24, left: -8, bottom: 0 }} barSize={96}>
          <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="4 4" />
          <XAxis
            dataKey="type"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v: number) => [v, "Groups"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
          />
          <Bar dataKey="count" fill="#16A34A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Reference date for preset calculations — end of mock data range
const DASH_TODAY = new Date(2025, 11, 31);

// ─── DashboardScreen ──────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const [tab,        setTab]        = useState<DashTab>("Cash");
  const [datePreset, setDatePreset] = useState<string | null>(null);
  const [region,     setRegion]     = useState<string | null>(null);
  const [district,   setDistrict]   = useState<string | null>(null);
  const [agent,      setAgent]      = useState<string | null>(null);
  const [community,  setCommunity]  = useState<string | null>(null);

  function handleRegion(v: string | null)   { setRegion(v); setDistrict(null); setCommunity(null); }
  function handleDistrict(v: string | null) { setDistrict(v); setCommunity(null); }
  function handleTab(t: DashTab) {
    setTab(t); setDatePreset(null); setRegion(null); setDistrict(null); setAgent(null); setCommunity(null);
  }

  const filtered = useMemo(() => {
    const [ds, de] = datePreset ? presetDates(datePreset, DASH_TODAY) : [null, null];
    return ALL_RECORDS.filter((r) => {
      if (r.tab !== tab)                                     return false;
      if (ds && de && (r.date < ds || r.date > de))         return false;
      if (region    && r.region    !== region)               return false;
      if (district  && r.district  !== district)             return false;
      if (agent     && r.agent     !== agent)                return false;
      if (community && r.community !== community)            return false;
      return true;
    });
  }, [tab, datePreset, region, district, agent, community]);

  // Cascaded dropdown options
  const districtOptions = useMemo(
    () => region
      ? REGION_DISTRICTS[region]
      : Object.values(REGION_DISTRICTS).flat().sort(),
    [region],
  );

  const communityOptions = useMemo(() => {
    if (district) return DISTRICT_COMMUNITIES[district] ?? [];
    if (region)   return [...new Set(REGION_DISTRICTS[region].flatMap((d) => DISTRICT_COMMUNITIES[d] ?? []))].sort();
    return ALL_COMM_LIST;
  }, [region, district]);

  // Aggregate stats
  const stats = useMemo(() => {
    const ful         = filtered.filter((r) => r.fulfilled);
    const communities = new Set(filtered.map((r) => r.community)).size;
    const groups      = filtered.length;
    const farmers     = filtered.reduce((s, r) => s + r.farmers, 0);
    const value       = filtered.reduce((s, r) => s + r.amount,  0);
    const fulComm     = new Set(ful.map((r) => r.community)).size;
    const fulGroups   = ful.length;
    const fulFarmers  = ful.reduce((s, r) => s + r.farmers, 0);
    const fulValue    = ful.reduce((s, r) => s + r.amount,  0);
    const amtRec      = ful.reduce((s, r) => s + r.recovered, 0);
    const pctRec      = fulValue > 0 ? amtRec / fulValue : 0;
    const outAmt      = Math.max(0, fulValue - amtRec);
    const pctOut      = Math.max(0, 1 - pctRec);
    const farmRec     = ful.filter((r) => r.recovered > 0).reduce((s, r) => s + r.farmers, 0);
    const pctFarmRec  = fulFarmers > 0 ? farmRec / fulFarmers : 0;
    const farmOut     = fulFarmers - farmRec;
    return {
      communities, groups, farmers, value,
      fulComm, fulGroups, fulFarmers, fulValue,
      amtRec, pctRec, outAmt, pctOut,
      farmRec, pctFarmRec, farmOut, pctFarmOut: Math.max(0, 1 - pctFarmRec),
    };
  }, [filtered]);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--gray-50)" }}>
      <div style={{ maxWidth: 1200 }} className="mx-auto px-6 py-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-gray-400">
          <span>Farmer support</span>
          <span className="text-gray-300">›</span>
          <span className="font-semibold text-gray-800">Dashboard</span>
        </div>

        {/* Tabs */}
        <div
          className="flex w-fit gap-0.5 p-1 rounded-xl border border-gray-200 bg-white"
        >
          {(["Cash", "Agroforestry"] as DashTab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTab(t)}
              className="px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors"
              style={tab === t
                ? { background: "#111827", color: "#fff" }
                : { color: "var(--gray-500)" }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <DateFilterChip value={datePreset} onSelect={setDatePreset} />
          <FilterDropdown label="All Regions"     options={REGIONS}           value={region}    onChange={handleRegion}   searchable />
          <FilterDropdown label="All Districts"   options={districtOptions}   value={district}  onChange={handleDistrict} searchable />
          <FilterDropdown label="All Agents"      options={ALL_AGENTS_LIST}   value={agent}     onChange={setAgent}       searchable />
          <FilterDropdown label="All Communities" options={communityOptions}  value={community} onChange={setCommunity}   searchable />
        </div>

        {/* ── CASH ── */}
        {tab === "Cash" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FulfillmentCard
                label="Communities"
                total={stats.communities}  fulfilled={stats.fulComm}
                totalDisplay={fmtN(stats.communities)} fulfilledDisplay={fmtN(stats.fulComm)}
              />
              <FulfillmentCard
                label="Groups"
                total={stats.groups}       fulfilled={stats.fulGroups}
                totalDisplay={fmtN(stats.groups)}      fulfilledDisplay={fmtN(stats.fulGroups)}
              />
              <FulfillmentCard
                label="Farmers"
                total={stats.farmers}      fulfilled={stats.fulFarmers}
                totalDisplay={fmtN(stats.farmers)}     fulfilledDisplay={fmtN(stats.fulFarmers)}
              />
              <FulfillmentCard
                label="Value of requests"
                total={stats.value}        fulfilled={stats.fulValue}
                totalDisplay={fmtGHS(stats.value)}     fulfilledDisplay={fmtGHS(stats.fulValue)}
              />
            </div>

            <DualAreaChart records={filtered} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DonutChart
                title="Cash support recovery"
                subtitle="Breakdown of completed and outstanding recoveries"
                total={fmtGHS(stats.fulValue)}
                totalLabel=""
                segments={[
                  { label: "Amount recovered",   pct: stats.pctRec, value: fmtGHS(stats.amtRec),  color: "#16A34A" },
                  { label: "Outstanding amount",  pct: stats.pctOut, value: fmtGHS(stats.outAmt),  color: "#D1D5DB" },
                ]}
              />
              <DonutChart
                title="Farmers supported with cash"
                subtitle="Breakdown of completed and outstanding recoveries"
                total={fmtN(stats.fulFarmers)}
                totalLabel="Farmers"
                segments={[
                  { label: "Farmer recoveries",     pct: stats.pctFarmRec, value: `${fmtN(stats.farmRec)} Farmers`, color: "#16A34A" },
                  { label: "Outstanding recoveries", pct: stats.pctFarmOut, value: `${fmtN(stats.farmOut)} Farmers`, color: "#D1D5DB" },
                ]}
              />
            </div>

            <DistrictBars records={filtered} />
          </>
        )}

        {/* ── AGROFORESTRY ── */}
        {tab === "Agroforestry" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="No of community requests" value={stats.communities} />
              <StatCard label="No of group requests"     value={stats.groups} />
              <StatCard label="No of farmer requests"    value={stats.farmers} />
            </div>

            <AgroBarChart records={filtered} />
          </>
        )}

      </div>
    </div>
  );
}
