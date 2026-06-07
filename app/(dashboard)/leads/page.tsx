export const dynamic = "force-dynamic";
import { LeadsTable } from "@/components/leads/leads-table";

export default function LeadsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lidlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Yangi so'rovlar va potensial mijozlar</p>
      </div>
      <LeadsTable />
    </div>
  );
}
