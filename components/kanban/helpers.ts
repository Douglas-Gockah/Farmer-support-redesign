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
