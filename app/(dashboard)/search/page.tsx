"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, UserCheck, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SearchResult {
  source_type: string;
  source_id: string;
  source_name: string;
  phone: string;
  operator_name: string;
  created_at: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const supabase = createClient();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase.rpc("search_phone_global", { p_phone: query.trim() });
    setResults(data || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Global qidiruv</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Barcha operatorlar bazasida telefon raqami bo'yicha qidirish
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9 text-base" placeholder="+998901234567" value={query}
            onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Qidirish"}
        </Button>
      </form>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p>Bu raqam hech kimning bazasida topilmadi</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{results.length} ta natija topildi</p>
          {results.map((r, i) => (
            <div key={i} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${r.source_type === "lid" ? "bg-blue-500/20" : "bg-emerald-500/20"}`}>
                {r.source_type === "lid"
                  ? <Users className="w-4 h-4 text-blue-400" />
                  : <UserCheck className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{r.source_name}</p>
                <p className="text-sm text-muted-foreground font-mono">{r.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-primary">{r.operator_name}</span>
                  {" "}ning{" "}
                  <span className={r.source_type === "lid" ? "text-blue-400" : "text-emerald-400"}>
                    {r.source_type}i
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
