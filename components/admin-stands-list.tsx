"use client";

import { useState } from "react";
import { Search, Stamp, ArrowDownAZ, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StandEntry {
  id: string;
  name: string;
  display_id: string | null;
  stamps: number;
  remaining?: number | null;
  total?: number | null;
}

type SortMode = "alpha" | "stamps";

export function AdminStandsList({ stands }: { stands: StandEntry[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("alpha");

  const filtered = query.trim()
    ? stands.filter((s) =>
        s.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : stands;

  const sorted = [...filtered].sort((a, b) =>
    sort === "alpha"
      ? a.name.localeCompare(b.name, "it", { sensitivity: "base" })
      : b.stamps - a.stamps
  );

  const maxStamps = Math.max(...stands.map((s) => s.stamps), 1);

  const SORT_OPTIONS: { mode: SortMode; label: string; icon: typeof ArrowDownAZ }[] = [
    { mode: "alpha", label: "Alfabetico", icon: ArrowDownAZ },
    { mode: "stamps", label: "Numero timbri", icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Barra ricerca + totale */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca stand…"
            className="h-10 w-full rounded-lg border border-foreground/15 bg-background pl-9 pr-4 text-sm outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/20 transition-all"
          />
        </div>
        {query && (
          <span className="text-xs text-foreground/40">
            {filtered.length} risultat{filtered.length === 1 ? "o" : "i"}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-foreground/15 bg-background p-0.5">
            {SORT_OPTIONS.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setSort(mode)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  sort === mode
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/50 hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Griglia card */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {sorted.map((stand) => (
            <div
              key={stand.id}
              className="rounded-xl border border-foreground/10 p-2 flex flex-col items-center justify-center gap-1 transition-colors hover:border-foreground/25 hover:shadow-sm aspect-square bg-gradient-to-br"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(153,108,158,0.35) 0%, rgba(153,108,158,0.15) 55%, rgba(153,108,158,0.03) 100%)`,
              }}
            >
              <p className="font-semibold truncate text-xs text-center w-full">{stand.name}</p>
              <p className="text-[9px] text-foreground/50">{stand.display_id ?? "—"}</p>
              <div
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold"
                style={{
                  background: `rgba(168, 85, 247, ${0.10 + (stand.stamps / maxStamps) * 0.35})`,
                  color: `rgba(255, 255, 255, ${0.5 + (stand.stamps / maxStamps) * 0.5})`,
                }}
              >
                <Stamp className="h-3.5 w-3.5" />
                {stand.stamps}
              </div>
              {stand.remaining != null && stand.total != null && (
                <p
                  className={`text-[10px] font-bold ${
                    stand.remaining <= 3
                      ? "text-red-400"
                      : stand.remaining <= 8
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                >
                  {stand.remaining}/{stand.total}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-foreground/40 gap-2">
          <Search className="h-8 w-8" />
          <p className="text-sm">
            {query ? `Nessuno stand trovato per "${query}"` : "Nessuno stand disponibile."}
          </p>
        </div>
      )}
    </div>
  );
}
