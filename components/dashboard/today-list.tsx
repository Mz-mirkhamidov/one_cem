"use client";

import { Phone, Package, CheckCircle2 } from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";
import type { FollowUp, Order } from "@/types";
import { getProductColor } from "@/lib/utils";

export function TodayFollowUps({ followUps }: { followUps: FollowUp[] }) {
  if (followUps.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-red-400" />
          Bugungi qo'ng'iroqlar
        </h3>
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Bugun uchun qo'ng'iroq yo'q
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Phone className="w-4 h-4 text-red-400" />
        Bugungi qo'ng'iroqlar
        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
          {followUps.length}
        </span>
      </h3>
      <div className="space-y-2">
        {followUps.map((fu) => (
          <div
            key={fu.id}
            className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{fu.source_name}</p>
              <p className="text-xs text-muted-foreground">{fu.source_phone}</p>
              {fu.note && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {fu.note}
                </p>
              )}
            </div>
            <span className="text-xs text-red-400 font-mono">
              {formatTime(fu.scheduled_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TodayOrders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-400" />
          Bugungi topshirishlar
        </h3>
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Bugun topshirishlar yo'q
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Package className="w-4 h-4 text-orange-400" />
        Bugungi topshirishlar
        <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
          {orders.length}
        </span>
      </h3>
      <div className="space-y-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between bg-orange-500/5 border border-orange-500/15 rounded-lg px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {order.source_name}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${getProductColor(order.product)}`}
              >
                {order.product}
              </span>
            </div>
            {order.scheduled_at && (
              <span className="text-xs text-orange-400 font-mono">
                {formatTime(order.scheduled_at)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
