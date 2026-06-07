"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { OWNER_ID } from "@/lib/auth";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadFunnel } from "@/components/leads/lead-funnel";
import type { Lead } from "@/types";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("leads").select("*").eq("user_id", OWNER_ID)
      .then(({ data }) => setLeads((data as Lead[]) || []));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lidlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Yangi so'rovlar va potensial mijozlar</p>
      </div>
      <LeadFunnel leads={leads} />
      <LeadsTable />
    </div>
  );
}
