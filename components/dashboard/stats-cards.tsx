"use client";

import { Users, ShoppingCart, Phone, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StatsCardsProps {
  todayLeads: number;
  totalOrders: number;
  totalAmount: number;
  todayCalls: number;
  todayDeadlines: number;
}

export function StatsCards({
  todayLeads,
  totalOrders,
  totalAmount,
  todayCalls,
  todayDeadlines,
}: StatsCardsProps) {
  const cards = [
    {
      label: "Bugungi yangi lidlar",
      value: todayLeads,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      iconBg: "bg-blue-500/20",
    },
    {
      label: "Umumiy zakazlar",
      value: totalOrders,
      sub: formatPrice(totalAmount),
      icon: ShoppingCart,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
      iconBg: "bg-violet-500/20",
    },
    {
      label: "Bugun qo'ng'iroq",
      value: todayCalls,
      icon: Phone,
      color: todayCalls > 0 ? "text-red-400" : "text-emerald-400",
      bg: todayCalls > 0
        ? "bg-red-500/10 border-red-500/20"
        : "bg-emerald-500/10 border-emerald-500/20",
      iconBg: todayCalls > 0 ? "bg-red-500/20" : "bg-emerald-500/20",
      badge: todayCalls > 0,
    },
    {
      label: "Bugun topshirish",
      value: todayDeadlines,
      icon: Clock,
      color: todayDeadlines > 0 ? "text-orange-400" : "text-emerald-400",
      bg: todayDeadlines > 0
        ? "bg-orange-500/10 border-orange-500/20"
        : "bg-emerald-500/10 border-emerald-500/20",
      iconBg: todayDeadlines > 0 ? "bg-orange-500/20" : "bg-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`relative bg-card border rounded-xl p-5 ${card.bg}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  {card.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${card.color}`}>
                    {card.value}
                  </span>
                  {card.badge && card.value > 0 && (
                    <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 animate-pulse">
                      !
                    </span>
                  )}
                </div>
                {card.sub && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.sub}
                  </p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
