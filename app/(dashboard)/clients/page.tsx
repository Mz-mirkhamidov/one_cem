export const dynamic = "force-dynamic";

import { ClientsTable } from "@/components/clients/clients-table";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mijozlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Qayta murojaat qiluvchi doimiy mijozlar
        </p>
      </div>
      <ClientsTable />
    </div>
  );
}
