"use client";

import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";
import type { StandInfo } from "@/app/actions/stand-inventory";

interface PrizeSelectionScreenProps {
  stands: StandInfo[];
  requiredCount: number;
  onConfirm: (selectedIds: string[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PrizeSelectionScreen({
  stands,
  requiredCount,
  onConfirm,
  onCancel,
  isLoading,
}: PrizeSelectionScreenProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return stands;
    const q = query.toLowerCase();
    return stands.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.artist_id.toLowerCase().includes(q) ||
        s.display_id.toLowerCase().includes(q)
    );
  }, [stands, query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < requiredCount) {
        next.add(id);
      }
      return next;
    });
  };

  const isComplete = selected.size === requiredCount;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-white">
          Seleziona {requiredCount} stand per gli extra
        </h3>
        <p className="text-sm text-white/60">
          Seleziona esattamente {requiredCount} stand{" "}
          {requiredCount === 1 ? "(1 card ciascuno)" : `(${requiredCount} card totali)`}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Cerca stand..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-white/15 bg-white/5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
        />
      </div>

      <div className="max-h-[40vh] overflow-y-auto rounded-lg border border-white/10">
        {filtered.length === 0 && (
          <p className="p-4 text-center text-sm text-white/40">
            Nessuno stand trovato
          </p>
        )}
        {filtered.map((stand) => {
          const isSelected = selected.has(stand.artist_id);
          const isDisabled = !isSelected && selected.size >= requiredCount;

          return (
            <button
              key={stand.artist_id}
              type="button"
              disabled={isDisabled || isLoading}
              onClick={() => toggle(stand.artist_id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 last:border-b-0 ${
                isSelected
                  ? "bg-[#996C9E]/30"
                  : isDisabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-white/5"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  isSelected
                    ? "border-[#996C9E] bg-[#996C9E]"
                    : "border-white/30"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {stand.name}
                </p>
                <p className="text-xs text-white/50">{stand.artist_id}</p>
              </div>
              <span
                className={`text-xs font-mono shrink-0 ${
                  stand.remaining <= 5
                    ? "text-red-400"
                    : stand.remaining <= 10
                      ? "text-amber-400"
                      : "text-emerald-400"
                }`}
              >
                {stand.remaining}/{stand.total}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">
          {selected.size}/{requiredCount} selezionati
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={!isComplete || isLoading}
            onClick={() => onConfirm(Array.from(selected))}
            className="rounded-lg bg-[#996C9E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#8a5f8e] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Elaborazione..." : "Conferma selezione"}
          </button>
        </div>
      </div>
    </div>
  );
}
