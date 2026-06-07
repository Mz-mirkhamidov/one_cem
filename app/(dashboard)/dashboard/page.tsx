"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LeadsChart } from "@/components/dashboard/leads-chart";
import { TodayFollowUps, TodayOrders } from "@/components/dashboard/today-list";
import type { FollowUp, Order } from "@/types";
import { format, startOfDay, endOfDay } from "date-fns";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [todayLeads, setTodayLeads] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [todayFollowUps, setTodayFollowUps] = useState<FollowUp[]>([]);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const todayStart = startOfDay(new Date()).toISOString();
    const todayEnd = endOfDay(new Date()).toISOString();
    const today = format(new Date(), "yyyy-MM-dd");

    // Today's leads
    const { count: leadsCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd);
    setTodayLeads(leadsCount || 0);

    // Total orders + amount
    const { data: ordersData } = await supabase
      .from("orders")
      .select("price")
      .eq("user_id", user.id);
    setTotalOrders(ordersData?.length || 0);
    setTotalAmount(ordersData?.reduce((sum, o) => sum + Number(o.price), 0) || 0);

    // Today's pending follow-ups
    const { data: fuData } = await supabase
      .from("follow_ups")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "Kutilmoqda")
      .gte("scheduled_at", todayStart)
      .lte("scheduled_at", todayEnd)
      .order("scheduled_at");
    setTodayFollowUps((fuData as FollowUp[]) || []);

    // Today's deadline orders (Keyinroqi with today's date)
    const { data: todayOrdersData } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .eq("order_type", "Keyinroqi")
      .gte("scheduled_at", todayStart)
      .lte("scheduled_at", todayEnd)
      .order("scheduled_at");
    setTodayOrders((todayOrdersData as Order[]) || []);

    // Last 7 days chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const { data: chartLeads } = await supabase
      .from("leads")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo.toISOString());

    const counts: Record<string, number> = {};
    chartLeads?.forEach((l) => {
      const day = format(new Date(l.created_at), "yyyy-MM-dd");
      counts[day] = (counts[day] || 0) + 1;
    });
    const chart = Object.entries(counts).map(([date, count]) => ({
      date,
      count,
    }));
    setChartData(chart);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-secondary rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-56 bg-secondary rounded-xl" />
          <div className="h-56 bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {format(new Date(), "dd.MM.yyyy, EEEE")} — Bugungi ish holati
        </p>
      </div>

      {/* Stats */}
      <StatsCards
        todayLeads={todayLeads}
        totalOrders={totalOrders}
        totalAmount={totalAmount}
        todayCalls={todayFollowUps.length}
        todayDeadlines={todayOrders.length}
      />

      {/* Chart + Today lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LeadsChart data={chartData} />
        </div>
        <TodayFollowUps followUps={todayFollowUps} />
      </div>

      {todayOrders.length > 0 && (
        <TodayOrders orders={todayOrders} />
      )}
    </div>
  );
}
