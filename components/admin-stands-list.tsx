"use client";

import { useState } from "react";
import { Search, Stamp, ArrowDownAZ, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StandEntry {
  id: string;
  name: string;
  display_id: string | null;
  active: boolean;
  stamps: number;
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

  const totalStamps = stands.reduce((acc, s) => acc + s.stamps, 0);

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
          <div className="shrink-0 rounded-full border border-foreground/15 bg-background px-3 py-1.5 text-xs text-foreground/60">
            <span className="font-semibold text-foreground/80">{totalStamps}</span> timbri elargiti
          </div>
        </div>
      </div>

      {/* Griglia card */}
      {sorted.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((stand) => (
            <div
              key={stand.id}
              className="rounded-2xl border border-foreground/10 p-5 flex flex-col gap-4 transition-colors hover:border-foreground/25 hover:shadow-sm bg-gradient-to-br"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(153,108,158,0.35) 0%, rgba(153,108,158,0.15) 55%, rgba(153,108,158,0.03) 100%)`,
              }}
            >
              {/* Nome + badge contatore */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate text-base">{stand.name}</p>
                  <p className="text-xs text-foreground/60 mt-0.5 flex items-center gap-1.5">
                    <span>{stand.display_id ?? "—"}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        stand.active
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/10 text-red-500 dark:text-red-400"
                      }`}
                    >
                      {stand.active ? "Attivo" : "Inattivo"}
                    </span>
                  </p>
                </div>
                <span className={`shrink-0 inline-flex items-baseline gap-1 rounded-full px-2.5 py-1 text-sm font-bold ${
                  stand.stamps >= 30
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                    : stand.stamps >= 15
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : stand.stamps >= 5
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : "bg-foreground/10 text-foreground/70"
                }`}>
                  {stand.stamps}
                </span>
              </div>

              {/* Barra proporzione sul totale */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                  style={{
                    width: `${totalStamps > 0 ? Math.min((stand.stamps / totalStamps) * 100, 100) : 0}%`,
                  }}
                />
              </div>

              {/* Timbri elargiti */}
              <div className="rounded-lg bg-foreground/[0.05] px-3 py-2 text-xs text-foreground/80 text-center flex items-center justify-center gap-1.5">
                <Stamp className="h-3.5 w-3.5 text-foreground/50" />
                {stand.stamps === 1 ? "1 timbro elargito" : `${stand.stamps} timbri elargiti`}
              </div>
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
