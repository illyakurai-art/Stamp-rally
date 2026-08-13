"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trophy, Gift, Stamp, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface RedeemPayload {
  gacha_included: number;
  extra_choice: number;
  is_full_collection: boolean;
  stamps_removed: number;
  stamps_remaining: number;
}

interface StampPayload {
  artist_name: string | null;
}

export function RedeemNotification({ userId }: { userId: string }) {
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // ── Canale 1: broadcast redeem da admin ──
    const redeemChannel = supabase
      .channel(`user-notify-${userId}`)
      .on(
        "broadcast",
        { event: "redeem" },
        ({ payload }: { payload: RedeemPayload }) => {
          const p = payload;
          const prizeText = p.is_full_collection
            ? t("full_collection")
            : `${p.gacha_included} Gacha${p.extra_choice > 0 ? ` + ${p.extra_choice} ${t("extra_choice")}` : ""}`;

          toast.custom((id) => (
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30"
              style={{ fontFamily: "inherit" }}>
              {/* Header gradiente ambra/oro */}
              <div style={{ background: "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #eab308 100%)" }}
                className="px-4 pt-4 pb-3 relative">
                <button
                  onClick={() => toast.dismiss(id)}
                  className="absolute top-2 right-2 rounded-full bg-black/20 p-1 hover:bg-black/30 transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-5 w-5 text-white shrink-0" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }} />
                  <span className="text-white font-black text-base tracking-wide"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                    {t("prize_redeemed")}
                  </span>
                </div>
                <p className="text-white font-extrabold text-xl leading-tight"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                  {prizeText}
                </p>
              </div>
              {/* Body scuro */}
              <div className="bg-zinc-900 px-4 pb-3 pt-2.5 flex flex-col gap-1.5">
                {p.extra_choice > 0 && !p.is_full_collection && (
                  <div className="flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-semibold">{t("ask_staff_extra")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs border-t border-zinc-700 pt-1.5">
                  <span className="text-zinc-400">{t("stamps_removed")}</span>
                  <strong className="text-rose-400">{p.stamps_removed}</strong>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400">{t("remaining")}</span>
                  <strong className="text-emerald-400">{p.stamps_remaining}</strong>
                </div>
              </div>
            </div>
          ), { duration: 12000 });

          router.refresh();
          window.dispatchEvent(new CustomEvent("stampsUpdated"));
        }
      )
      .subscribe();

    // ── Canale 2: postgres_changes su notifications per stamp aggiunti ──
    const stampChannel = supabase
      .channel(`stamp-notify-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (event) => {
          const row = event.new as { type: string; payload: StampPayload };
          if (row.type !== "stamp") return;

          const p = row.payload;

          toast.custom((id) => (
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/30"
              style={{ fontFamily: "inherit" }}>
              <div style={{ background: "linear-gradient(135deg, #10b981 0%, #0d9488 50%, #06b6d4 100%)" }}
                className="px-4 pt-4 pb-3 relative">
                <button
                  onClick={() => toast.dismiss(id)}
                  className="absolute top-2 right-2 rounded-full bg-black/20 p-1 hover:bg-black/30 transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <Stamp className="h-5 w-5 text-white shrink-0" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }} />
                  <span className="text-white font-black text-base tracking-wide"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                    {t("stamp_added")}
                  </span>
                </div>
                {p.artist_name && (
                  <p className="text-white/90 text-sm font-semibold"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                    {t("stand_of")} <strong className="text-white">{p.artist_name}</strong>
                  </p>
                )}
              </div>
            </div>
          ), { duration: 5000 });

          window.dispatchEvent(new CustomEvent("stampsUpdated"));
        }
      )
      .subscribe();

    // ── Canale 3: postgres_changes per obiettivo segreto sbloccato ──
    const secretChannel = supabase
      .channel(`secret-notify-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (event) => {
          const row = event.new as { type: string; payload: { label?: string } };
          if (row.type !== "kk_unlock") return;

          const label = row.payload?.label ?? "K&K";

          toast.custom((id) => (
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-yellow-400/50"
              style={{ fontFamily: "inherit" }}>
              {/* Header oro */}
              <div style={{ background: "linear-gradient(135deg, #a16207 0%, #facc15 50%, #f59e0b 100%)" }}
                className="px-4 pt-4 pb-3 relative">
                <button
                  onClick={() => toast.dismiss(id)}
                  className="absolute top-2 right-2 rounded-full bg-black/20 p-1 hover:bg-black/30 transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-5 w-5 text-white shrink-0" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }} />
                  <span className="text-white font-black text-base tracking-wide"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                    {t("secret_objective_unlocked")}
                  </span>
                </div>
                <p className="text-yellow-950 font-extrabold text-2xl font-black tracking-tight leading-tight">
                  {label}
                </p>
              </div>
              {/* Body scuro */}
              <div className="bg-zinc-900 px-4 pb-3 pt-2.5">
                <p className="text-yellow-300 text-xs font-semibold">✨ {t("secret_kk_unlocked")}</p>
              </div>
            </div>
          ), { duration: 10000 });

          window.dispatchEvent(new CustomEvent("stampsUpdated"));
          window.dispatchEvent(new CustomEvent("kkUnlocked"));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(redeemChannel);
      supabase.removeChannel(stampChannel);
      supabase.removeChannel(secretChannel);
    };
  }, [userId, router]);

  return null;
}
