import { OrdersTable } from "@/components/orders/orders-table";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Zakazlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Barcha buyurtmalar bir joyda
        </p>
      </div>
      <OrdersTable />
    </div>
  );
}
