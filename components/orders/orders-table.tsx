"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useOperator } from "@/lib/useOperator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PersonDetailModal } from "@/components/shared/detail-modal";
import { Trash2, Loader2, Search, Clock, CheckCheck, ChevronRight } from "lucide-react";
import { cn, formatDate, formatPrice, getProductColor, isTodayDate } from "@/lib/utils";
import type { Order, Lead, Client } from "@/types";
import { PRODUCTS } from "@/types";

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProduct, setFilterProduct] = useState("all");
  const [search, setSearch] = useState("");
  const [detailPerson, setDetailPerson] = useState<Lead | Client | null>(null);
  const [detailType, setDetailType] = useState<"lead" | "client">("lead");

  const operator = useOperator();
  const operatorId = operator?.id || "";
  const supabase = createClient();

  useEffect(() => { loadOrders(); }, []);

  useEffect(() => {
    let f = orders;
    if (search) { const q = search.toLowerCase(); f = f.filter((o) => o.source_name?.toLowerCase().includes(q)); }
    if (filterProduct !== "all") f = f.filter((o) => o.product === filterProduct);
    setFiltered(f);
  }, [orders, search, filterProduct]);

  async function loadOrders() {
    try {
      const { data } = await supabase.from("orders").select("*").eq("user_id", operatorId).order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function deleteOrder(id: string) {
    await supabase.from("orders").delete().eq("id", id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  // Keyinroqi → Hozirgi tasdiqlash
  async function confirmOrder(id: string) {
    const { error } = await supabase.from("orders").update({ order_type: "Hozirgi", scheduled_at: null }).eq("id", id);
    if (error) { alert("Xato: " + error.message); return; }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, order_type: "Hozirgi", scheduled_at: null } : o));
  }

  // Mijoz profili ochish
  async function openPersonDetail(order: Order) {
    const table = order.source_type === "lead" ? "leads" : "clients";
    const { data } = await supabase.from(table).select("*").eq("id", order.source_id).single();
    if (data) {
      setDetailPerson(data as Lead | Client);
      setDetailType(order.source_type as "lead" | "client");
    }
  }

  const upcoming = filtered.filter((o) => o.order_type === "Keyinroqi");
  const confirmed = filtered.filter((o) => o.order_type === "Hozirgi");

  const totalAmount = confirmed.reduce((s, o) => s + Number(o.price), 0);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Mijoz ismi..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterProduct} onValueChange={setFilterProduct}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Mahsulot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha mahsulotlar</SelectItem>
            {PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Yuklanmoqda...
        </div>
      ) : (
        <>
          {/* ---- KEYINROQI ZAKAZLAR ---- */}
          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-semibold text-foreground">Keyinroqi zakazlar</h2>
                <span className="bg-orange-500/20 text-orange-400 text-xs rounded-full px-2 py-0.5 border border-orange-500/30">
                  {upcoming.length} ta
                </span>
                <p className="text-xs text-muted-foreground ml-1">— tasdiqlangandan keyin asosiy ro'yxatga o'tadi</p>
              </div>
              <div className="rounded-xl border border-orange-500/20 overflow-hidden bg-orange-500/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-orange-500/20 bg-orange-500/10">
                      <th className="text-left px-4 py-3 text-orange-300 font-medium">Mijoz</th>
                      <th className="text-left px-4 py-3 text-orange-300 font-medium">Mahsulot</th>
                      <th className="text-left px-4 py-3 text-orange-300 font-medium">Narx</th>
                      <th className="text-left px-4 py-3 text-orange-300 font-medium">Rejalashtirilgan</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map((order) => {
                      const today = order.scheduled_at ? isTodayDate(order.scheduled_at) : false;
                      return (
                        <tr key={order.id} className="border-b border-orange-500/10 hover:bg-orange-500/10 transition-colors">
                          <td className="px-4 py-3">
                            <button className="font-medium text-foreground hover:text-primary flex items-center gap-1 text-left"
                              onClick={() => openPersonDetail(order)}>
                              {order.source_name}
                              <ChevronRight className="w-3 h-3 opacity-50" />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", getProductColor(order.product))}>
                              {order.product}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">{formatPrice(order.price)}</td>
                          <td className="px-4 py-3">
                            {order.scheduled_at && (
                              <span className={cn("text-xs font-mono", today ? "text-red-400 font-bold" : "text-orange-300")}>
                                {formatDate(order.scheduled_at)}
                                {today && " 🔴 Bugun!"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 justify-end">
                              <Button size="sm" variant="outline"
                                className="h-7 text-xs gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                onClick={() => confirmOrder(order.id)}>
                                <CheckCheck className="w-3.5 h-3.5" /> Tasdiqlash
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:bg-red-500/10">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Zakazni o'chirish</AlertDialogTitle>
                                    <AlertDialogDescription>Bu zakazni o'chirmoqchimisiz?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Bekor</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteOrder(order.id)}>O'chirish</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- TASDIQLANGAN ZAKAZLAR ---- */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-foreground">Zakazlar</h2>
              {confirmed.length > 0 && (
                <span className="text-xs bg-secondary border border-border rounded-full px-2 py-0.5 text-muted-foreground">
                  {confirmed.length} ta • {formatPrice(totalAmount)}
                </span>
              )}
            </div>
            {confirmed.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Zakazlar topilmadi</div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Mijoz</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Mahsulot</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Narx</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Manba</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Sana</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmed.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <button className="font-medium text-foreground hover:text-primary flex items-center gap-1 text-left"
                            onClick={() => openPersonDetail(order)}>
                            {order.source_name}
                            <ChevronRight className="w-3 h-3 opacity-50" />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", getProductColor(order.product))}>
                            {order.product}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{formatPrice(order.price)}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs bg-secondary border border-border rounded-full px-2 py-0.5 text-muted-foreground capitalize">
                            {order.source_type === "lead" ? "Lid" : "Mijoz"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:bg-red-500/10">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Zakazni o'chirish</AlertDialogTitle>
                                <AlertDialogDescription>Bu zakazni o'chirmoqchimisiz?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Bekor</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteOrder(order.id)}>O'chirish</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Detail Modal */}
      <PersonDetailModal
        open={!!detailPerson}
        onClose={() => setDetailPerson(null)}
        person={detailPerson}
        sourceType={detailType}
        onRefresh={loadOrders}
      />
    </div>
  );
}
