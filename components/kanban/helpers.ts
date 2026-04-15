// ---------------------------------------------------------------------------
// Utility / helper functions for the Kanban module
// ---------------------------------------------------------------------------
import { AVATAR_COLORS, DATE_PRESETS } from "./constants";

export function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ---------------------------------------------------------------------------
// Reference code: PF-YYMM-NNNNN-AGT
// PF = pre-financing prefix
// YYMM = 2-digit year + 2-digit month from record date ("12 Jan 2024" → "2401")
// NNNNN = 5-digit zero-padded trailing number from the record ID
// AGT = all-word initials of agent name uppercased
// ---------------------------------------------------------------------------
const MONTH_NUM: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

export function makeRefCode(date: string, id: string, agent: string): string {
  const parts = date.split(" ");                              // ["12", "Jan", "2024"]
  const year  = (parts[2] ?? "").slice(-2);                  // "24"
  const month = MONTH_NUM[parts[1] ?? ""] ?? "00";           // "01"
  const yymm  = year + month;                                // "2401"
  const idParts = id.split("-");
  const num   = parseInt(idParts[idParts.length - 1] ?? "0", 10);
  const numStr = isNaN(num) ? "00000" : num.toString().padStart(5, "0");
  const agt   = agent.split(" ").map((w) => w[0] ?? "").join("").toUpperCase();
  return `PF-${yymm}-${numStr}-${agt}`;
}

export function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function presetDates(preset: string, today: Date): [Date, Date] {
  const d = new Date(today);
  d.setHours(0, 0, 0, 0);
  if (preset === "Today")      return [d, d];
  if (preset === "Yesterday")  { const y = new Date(d); y.setDate(d.getDate() - 1); return [y, y]; }
  if (preset === "This Week")  { const s = new Date(d); s.setDate(d.getDate() - d.getDay()); return [s, d]; }
  if (preset === "Last Week")  { const s = new Date(d); s.setDate(d.getDate() - d.getDay() - 7); const e = new Date(s); e.setDate(s.getDate() + 6); return [s, e]; }
  if (preset === "This Month") { const s = new Date(d.getFullYear(), d.getMonth(), 1); return [s, d]; }
  if (preset === "Last Month") { const s = new Date(d.getFullYear(), d.getMonth() - 1, 1); const e = new Date(d.getFullYear(), d.getMonth(), 0); return [s, e]; }
  if (preset === "This Year")  { return [new Date(d.getFullYear(), 0, 1), d]; }
  if (preset === "Last Year")  { return [new Date(d.getFullYear() - 1, 0, 1), new Date(d.getFullYear() - 1, 11, 31)]; }
  return [d, d];
}

export function calDays(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  return cells;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function inRange(d: Date, dateStart: Date | null, dateEnd: Date | null): boolean {
  if (!dateStart || !dateEnd) return false;
  return d >= dateStart && d <= dateEnd;
}
