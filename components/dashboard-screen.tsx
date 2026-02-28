"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// ─── Stat Cards ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
}

function StatCard({ icon, iconBg, value, label }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-[18px]">
        <div
          className="flex items-center justify-center shrink-0 text-white text-lg"
          style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: iconBg }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[22px] font-bold leading-tight text-foreground">{value}</span>
          <span className="text-[12px] text-muted-foreground leading-tight">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Bar Chart ─────────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULFILLMENT = [42, 58, 65, 55, 70, 80, 75, 68, 85, 78, 90, 72];

function FulfillmentChart() {
  const max = Math.max(...FULFILLMENT);
  return (
    <Card>
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-[14px] font-semibold">Support Fulfillment Over Time</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex items-end gap-2 h-40">
          {FULFILLMENT.map((val, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-1">
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${(val / max) * 100}%`,
                  backgroundColor: "#16A34A",
                  minHeight: 4,
                }}
                role="img"
                aria-label={`${MONTHS[i]}: ${val}%`}
              />
              <span className="text-[10px] text-muted-foreground">{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Donut Chart ───────────────────────────────────────────────────────────────

function DonutChart() {
  const radius = 60;
  const cx = 80;
  const cy = 80;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const recovered = 0.7;
  const recoveredArc = circumference * recovered;
  const outstandingArc = circumference * (1 - recovered);

  return (
    <Card>
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-[14px] font-semibold">Cash Support Recovery</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <svg width="160" height="160" aria-label="Donut chart: 70% recovered, 30% outstanding">
              <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
              <circle
                cx={cx} cy={cy} r={radius} fill="none"
                stroke="#16A34A" strokeWidth={strokeWidth}
                strokeDasharray={`${recoveredArc} ${circumference - recoveredArc}`}
                strokeDashoffset={circumference * 0.25}
                strokeLinecap="round"
              />
              <circle
                cx={cx} cy={cy} r={radius} fill="none"
                stroke="#D1D5DB" strokeWidth={strokeWidth}
                strokeDasharray={`${outstandingArc - 4} ${circumference - outstandingArc + 4}`}
                strokeDashoffset={circumference * 0.25 - recoveredArc - 2}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[22px] font-bold text-foreground">70%</span>
              <span className="text-[10px] text-muted-foreground">Recovered</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#16A34A" }} />
              <div>
                <p className="text-[12px] font-semibold text-foreground">70% Recovered</p>
                <p className="text-[11px] text-muted-foreground">GHS 2,240</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#D1D5DB" }} />
              <div>
                <p className="text-[12px] font-semibold text-foreground">30% Outstanding</p>
                <p className="text-[11px] text-muted-foreground">GHS 960</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── District Bars ─────────────────────────────────────────────────────────────

const DISTRICTS = [
  { name: "Tamale Metro", count: 28 },
  { name: "Sawla-Tuna-Kalba", count: 19 },
  { name: "Bole", count: 15 },
  { name: "Wa East", count: 10 },
];

function DistrictBars() {
  const max = Math.max(...DISTRICTS.map((d) => d.count));
  return (
    <Card>
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-[14px] font-semibold">Requests by District</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex flex-col gap-4">
          {DISTRICTS.map(({ name, count }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-foreground">{name}</span>
                <span className="text-[12px] font-semibold text-foreground">{count}</span>
              </div>
              {/* shadcn Progress — override fill color via CSS var */}
              <Progress
                value={(count / max) * 100}
                className="h-2 [&>div]:bg-[#16A34A]"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard Screen ──────────────────────────────────────────────────────────

const STAT_CARDS: StatCardProps[] = [
  { icon: "📋", iconBg: "#3B82F6", value: 8,           label: "Total Requests"  },
  { icon: "⏳", iconBg: "#F59E0B", value: 4,           label: "Pending Action"  },
  { icon: "✅", iconBg: "#16A34A", value: 2,           label: "Approved"        },
  { icon: "💸", iconBg: "#8B5CF6", value: 1,           label: "Disbursed"       },
  { icon: "👥", iconBg: "#3B82F6", value: 109,         label: "Total Farmers"   },
  { icon: "🏦", iconBg: "#16A34A", value: "GHS 3,200", label: "Cash Disbursed"  },
  { icon: "⏸️", iconBg: "#F59E0B", value: 1,           label: "On Hold"         },
  { icon: "🚜", iconBg: "#EC4899", value: 2,           label: "Ploughing"       },
];

export default function DashboardScreen() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
      <FulfillmentChart />
      <div className="grid grid-cols-2 gap-4">
        <DonutChart />
        <DistrictBars />
      </div>
    </div>
  );
}
