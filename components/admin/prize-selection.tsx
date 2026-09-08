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
        <h3 className="text-lg font-bold text-[#2D1B33]">
          Seleziona {requiredCount} stand per gli extra
        </h3>
        <p className="text-sm text-[#5a3d60]">
          Seleziona esattamente {requiredCount} stand{" "}
          {requiredCount === 1 ? "(1 card ciascuno)" : `(${requiredCount} card totali)`}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d4d7f]/60" />
        <input
          type="text"
          placeholder="Cerca stand..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-[#7d4d7f]/20 bg-[#f3e8f5] pl-9 pr-4 text-sm text-[#2D1B33] outline-none placeholder:text-[#7d4d7f]/50 focus:border-[#996C9E] focus:ring-2 focus:ring-[#996C9E]/20"
        />
      </div>

      <div className="max-h-[40vh] overflow-y-auto rounded-lg border border-[#7d4d7f]/20 bg-[#faf5fb]">
        {filtered.length === 0 && (
          <p className="p-4 text-center text-sm text-[#7d4d7f]/60">
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
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#7d4d7f]/10 last:border-b-0 ${
                isSelected
                  ? "bg-[#996C9E]/20"
                  : isDisabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-[#996C9E]/10"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  isSelected
                    ? "border-[#996C9E] bg-[#996C9E]"
                    : "border-[#7d4d7f]/30"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2D1B33] truncate">
                  {stand.name}
                </p>
                <p className="text-xs text-[#5a3d60]">{stand.artist_id}</p>
              </div>
              <span
                className={`text-xs font-mono shrink-0 font-semibold ${
                  stand.remaining <= 5
                    ? "text-red-600"
                    : stand.remaining <= 10
                      ? "text-amber-600"
                      : "text-emerald-600"
                }`}
              >
                {stand.remaining}/{stand.total}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#5a3d60]">
          {selected.size}/{requiredCount} selezionati
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-[#7d4d7f]/30 px-4 py-2 text-sm font-medium text-[#5a3d60] transition-colors hover:bg-[#7d4d7f]/10"
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
