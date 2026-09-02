"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ChevronDown, Trophy } from "lucide-react";
import type { RecentRedeem, RecentStamp } from "@/lib/admin-recent";

const REDEEM_TIER_GRADIENTS: { threshold: number; gradient: string; badge: string }[] = [
  { threshold: 50, gradient: "from-purple-600/20 to-indigo-500/15", badge: "bg-purple-600/20 text-purple-700 dark:text-purple-300" },
  { threshold: 45, gradient: "from-indigo-500/20 to-blue-500/15", badge: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" },
  { threshold: 40, gradient: "from-blue-500/20 to-cyan-500/15", badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
  { threshold: 35, gradient: "from-cyan-500/20 to-teal-500/15", badge: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300" },
  { threshold: 30, gradient: "from-teal-500/20 to-emerald-500/15", badge: "bg-teal-500/20 text-teal-700 dark:text-teal-300" },
  { threshold: 25, gradient: "from-green-500/20 to-lime-500/15", badge: "bg-green-500/20 text-green-700 dark:text-green-300" },
  { threshold: 20, gradient: "from-yellow-500/20 to-orange-400/15", badge: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" },
  { threshold: 15, gradient: "from-orange-500/20 to-red-400/15", badge: "bg-orange-500/20 text-orange-700 dark:text-orange-300" },
  { threshold: 10, gradient: "from-red-500/20 to-pink-500/15", badge: "bg-red-500/20 text-red-700 dark:text-red-300" },
  { threshold: 5, gradient: "from-pink-500/20 to-rose-500/15", badge: "bg-pink-500/20 text-pink-700 dark:text-pink-300" },
];

function getRedeemTier(stamps: number) {
  return REDEEM_TIER_GRADIENTS.find((t) => stamps >= t.threshold) ?? null;
}

function useInfiniteScroll<T extends { id: string }>(type: "stamps" | "redeems", initial: T[]) {
  const [items, setItems] = useState<T[]>(initial);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(initial.length);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    setItems(initial);
    offsetRef.current = initial.length;
    setHasMore(initial.length > 0);
    hasMoreRef.current = initial.length > 0;
  }, [initial]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/recent?type=${type}&offset=${offsetRef.current}&limit=10`
      );
      if (!res.ok) return;
      const json = (await res.json()) as { data: T[]; hasMore: boolean };
      if (json.data.length > 0) {
        setItems((prev) => [...prev, ...json.data]);
        offsetRef.current += json.data.length;
      }
      setHasMore(json.hasMore);
      hasMoreRef.current = json.hasMore;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    if (!hasMoreRef.current) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "150px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, items.length, hasMore]);

  return { items, loading, hasMore, sentinelRef };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export function RecentStampsList({ initial }: { initial: RecentStamp[] }) {
  const { items, loading, hasMore, sentinelRef } = useInfiniteScroll<RecentStamp>("stamps", initial);

  return (
    <div className="max-h-[360px] overflow-y-auto flex flex-col gap-2 pr-1">
      {items.length > 0 ? (
        <>
          {items.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg bg-white/40 dark:bg-white/5 px-3 py-2 text-sm shrink-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{s.userLabel}</span>
                <span className="text-foreground/30 shrink-0">→</span>
                <span className="text-foreground/70 truncate">{s.artistLabel}</span>
              </div>
              <span className="text-xs text-foreground/40 shrink-0 ml-2">
                {formatDate(s.stamped_at)}
              </span>
            </div>
          ))}
          {hasMore ? (
            <div ref={sentinelRef} className="flex justify-center py-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin text-foreground/40" />}
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="text-xs text-foreground/30">Fine dei timbri</span>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-foreground/40">Nessun timbro ancora.</p>
      )}
    </div>
  );
}

export function RecentRedeemsList({ initial }: { initial: RecentRedeem[] }) {
  const { items, loading, hasMore, sentinelRef } = useInfiniteScroll<RecentRedeem>("redeems", initial);
  const [tiersOpen, setTiersOpen] = useState(false);

  const TIERS = [50, 45, 40, 35, 30, 25, 20, 15, 10, 5];
  const tierCounts = TIERS.map((t) => ({
    stamps: t,
    count: items.filter((r) => r.tier_threshold === t).length,
  }));
  const totalCount = items.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Tendina tier riscatti */}
      <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03]">
        <button
          onClick={() => setTiersOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-foreground/[0.03] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-500" />
            <span>Riepilogo tier riscattati</span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {totalCount}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-foreground/40 transition-transform ${tiersOpen ? "rotate-180" : ""}`} />
        </button>
        {tiersOpen && (
          <div className="border-t border-foreground/10 px-3 py-2 flex flex-col gap-1">
            {tierCounts.map((tc) => (
              <div
                key={tc.stamps}
                className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      background: `rgba(16, 185, 129, ${tc.count > 0 ? 0.4 + (tc.count / Math.max(...tierCounts.map((t) => t.count), 1)) * 0.6 : 0.15})`,
                    }}
                  />
                  <span className={tc.count > 0 ? "text-foreground/80" : "text-foreground/40"}>
                    {tc.stamps} timbri
                  </span>
                </div>
                <span
                  className="font-semibold tabular-nums"
                  style={{
                    color: `rgba(16, 185, 129, ${tc.count > 0 ? 0.5 + (tc.count / Math.max(...tierCounts.map((t) => t.count), 1)) * 0.5 : 0.25})`,
                  }}
                >
                  {tc.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista riscatti */}
      <div className="max-h-[360px] overflow-y-auto flex flex-col gap-2 pr-1">
      {items.length > 0 ? (
        <>
          {items.map((r) => {
            const tier = getRedeemTier(r.tier_threshold);
            return (
              <div
                key={r.id}
                className={`flex items-center justify-between rounded-lg bg-gradient-to-r px-3 py-2 text-sm shrink-0 ${
                  tier ? tier.gradient : "bg-foreground/5"
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium truncate">{r.userLabel}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold shrink-0 ${
                      tier ? tier.badge : "bg-foreground/10 text-foreground/70"
                    }`}>
                      -{r.tier_threshold} timbri
                    </span>
                  </div>
                  <span className="text-xs text-foreground/50">
                    Staff: <span className="text-foreground/70">{r.staffLabel}</span>
                  </span>
                </div>
                <span className="text-xs text-foreground/50 shrink-0 ml-2">
                  {formatDate(r.created_at)}
                </span>
              </div>
            );
          })}
          {hasMore ? (
            <div ref={sentinelRef} className="flex justify-center py-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin text-foreground/40" />}
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="text-xs text-foreground/30">Fine dei riscatti</span>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-foreground/40">Nessun riscatto ancora.</p>
      )}
    </div>
    </div>
  );
}