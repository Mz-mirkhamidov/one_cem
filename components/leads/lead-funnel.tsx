"use client";

import type { Lead } from "@/types";
import { LEAD_STATUSES } from "@/types";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

const STATUS_CONFIG = [
  { status: "Yangi", short: "Yangi", color: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  { status: "Ko'rib chiqilmoqda", short: "Ko'rib", color: "bg-yellow-500", text: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
  { status: "Kelishildi", short: "Kelishildi", color: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  { status: "Rad etildi", short: "Rad", color: "bg-red-500", text: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
  { status: "Buyurtma berilgan", short: "Buyurtma", color: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
];

export function LeadFunnel({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  if (total === 0) return null;

  const counts = STATUS_CONFIG.map((s) => ({
    ...s,
    count: leads.filter((l) => l.status === s.status).length,
  }));

  const yangi = counts[0].count;
  const buyurtma = counts[4].count;
  const conversionRate = yangi > 0 ? Math.round((buyurtma / yangi) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Savdo voronkasi
        </h3>
        <div className="text-xs text-muted-foreground">
          Konversiya:{" "}
          <span className={cn("font-bold", conversionRate >= 30 ? "text-emerald-400" : conversionRate >= 10 ? "text-yellow-400" : "text-red-400")}>
            {conversionRate}%
          </span>
        </div>
      </div>

      {/* Funnel bars */}
      <div className="flex items-end gap-2 mb-3">
        {counts.map((s) => {
          const pct = total > 0 ? (s.count / total) * 100 : 0;
          return (
            <div key={s.status} className="flex-1 flex flex-col items-center gap-1">
              <span className={cn("text-sm font-bold", s.text)}>{s.count}</span>
              <div className="w-full bg-secondary rounded-full overflow-hidden h-2">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", s.color)}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground text-center leading-tight">{s.short}</span>
            </div>
          );
        })}
      </div>

      {/* Arrow flow */}
      <div className="flex items-center gap-1 mt-2">
        {counts.map((s, i) => (
          <div key={s.status} className="flex items-center gap-1 flex-1">
            <div className={cn("flex-1 flex items-center justify-center rounded-lg border py-1.5 text-xs font-semibold", s.bg, s.border, s.text)}>
              {s.count}
            </div>
            {i < counts.length - 1 && (
              <span className="text-muted-foreground text-xs flex-shrink-0">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
