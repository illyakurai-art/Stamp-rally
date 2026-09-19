"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Stamp, Trophy, Clock, ChevronRight, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { adminRedeem, getUserStamps } from "@/app/actions/admin-redeem";
import type { RedeemResult } from "@/app/actions/admin-redeem";
import { resetUserPassword } from "@/app/actions/reset-password";
import { getStampsGradient } from "@/lib/stamp-gradient";
import { RedeemFlow } from "@/components/admin/redeem-flow";
import { Confetti } from "@/components/ui/confetti";

const TIERS = [
  { stamps: 50, label: "Full collection", gacha: null, extra: null, is_full_collection: true },
  { stamps: 45, gacha: 24, extra: 12, label: "24 gacha + 12 extra", is_full_collection: false },
  { stamps: 40, gacha: 20, extra: 10, label: "20 gacha + 10 extra", is_full_collection: false },
  { stamps: 35, gacha: 16, extra: 8,  label: "16 gacha + 8 extra", is_full_collection: false },
  { stamps: 30, gacha: 12, extra: 6,  label: "12 gacha + 6 extra", is_full_collection: false },
  { stamps: 25, gacha: 8,  extra: 4,  label: "8 gacha + 4 extra", is_full_collection: false },
  { stamps: 20, gacha: 6,  extra: 3,  label: "6 gacha + 3 extra", is_full_collection: false },
  { stamps: 15, gacha: 4,  extra: 2,  label: "4 gacha + 2 extra", is_full_collection: false },
  { stamps: 10, gacha: 2,  extra: 1,  label: "2 gacha + 1 extra", is_full_collection: false },
  { stamps: 5,  gacha: 1,  extra: 0,  label: "1 gacha", is_full_collection: false },
];

function getTier(n: number) {
  return TIERS.find((t) => n >= t.stamps) ?? null;
}

interface StampEntry {
  id: string;
  stamped_at: string;
  artist_name: string;
}

function FullCollectionCard({
  stampCount,
}: {
  stampCount: number;
}) {
  const [cards, setCards] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Query stand_inventory per artisti con card disponibili
        const { data: inventory } = await supabase
          .from("stand_inventory")
          .select("artist_id, remaining")
          .gt("remaining", 0)
          .order("artist_id");


        if (inventory && inventory.length > 0) {
          const imageUrls = inventory.slice(0, 9).map(
            (s) => `https://qoniejhhzixwzgtzlngo.supabase.co/storage/v1/render/image/public/artists-cards/Premi%20artisti/${s.artist_id}.webp?width=150&height=220`
          );

          // Preload images
          await Promise.all(
            imageUrls.map(
              (url) =>
                new Promise<void>((resolve) => {
                  const img = new window.Image();
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                  img.src = url;
                })
            )
          );

          setCards(imageUrls);
        }
      } catch (err) {
        console.error("[FullCollectionCard] fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailable();
  }, []);

  const cardCount = Math.max(cards.length, 1);
  const fanAngle = 100;
  const startAngle = -fanAngle / 2;

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center p-6 overflow-hidden"
        style={{
          background: getStampsGradient(stampCount),
          aspectRatio: "1 / 1",
        }}
      >
        <div className="text-white/80 text-sm animate-pulse">Caricamento...</div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-between p-6 overflow-hidden"
      style={{
        background: getStampsGradient(stampCount),
        aspectRatio: "1 / 1",
      }}
    >
      <h2 className="text-3xl font-extrabold text-center drop-shadow-lg z-10"
          style={{ color: "#F0E6F6" }}>
        Complimenti
      </h2>

      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
        {/* Shadow under the fan */}
        {cards.length > 0 && (
          <div
            className="absolute left-1/2"
            style={{
              transform: "translateX(-50%) translateY(60%)",
              width: "240px",
              height: "26px",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
              zIndex: 0,
            }}
          />
        )}

        {/* Card backs - same fan shape, behind front cards */}
        {cards.length > 0 && (
          <div className="absolute left-1/2" style={{ transform: "translateX(-50%) translateY(25%)" }}>
            {[...Array(cardCount)].map((_, i) => {
              const angle = startAngle + (fanAngle / Math.max(cardCount - 1, 1)) * i;
              const rad = (angle * Math.PI) / 180;
              const offsetX = Math.sin(rad) * 68;
              const offsetY = (1 - Math.cos(rad)) * 34 + 16;

              return (
                <div
                  key={`back-${i}`}
                  className="absolute rounded-xl border-2 border-white/30"
                  style={{
                    width: "clamp(50px, 12vw, 72px)",
                    height: "clamp(75px, 18vw, 108px)",
                    background: "linear-gradient(135deg, #996C9E 0%, #7d4d7f 100%)",
                    transform: `translateX(${offsetX}px) translateY(-${offsetY}px) rotate(${angle}deg)`,
                    transformOrigin: "bottom center",
                    bottom: 0,
                    left: "calc(-1 * clamp(25px, 6vw, 36px))",
                    zIndex: i,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Fan of 9 prize cards */}
        {cards.length > 0 && (
          <div className="absolute left-1/2" style={{ transform: "translateX(-50%) translateY(25%)" }}>
            {cards.map((card, i) => {
              const angle = startAngle + (fanAngle / Math.max(cardCount - 1, 1)) * i;
              const rad = (angle * Math.PI) / 180;
              const offsetX = Math.sin(rad) * 68;
              const offsetY = (1 - Math.cos(rad)) * 34;

              return (
                <div
                  key={card}
                  className="absolute rounded-xl overflow-hidden border-2 border-white/70"
                  style={{
                    width: "clamp(50px, 12vw, 72px)",
                    height: "clamp(75px, 18vw, 108px)",
                    transform: `translateX(${offsetX}px) translateY(-${offsetY}px) rotate(${angle}deg)`,
                    transformOrigin: "bottom center",
                    bottom: 0,
                    left: "calc(-1 * clamp(25px, 6vw, 36px))",
                    zIndex: 10 + i,
                  }}
                >
                  <Image
                    src={card}
                    alt="Card premio"
                    fill
                    className="object-cover"
                    sizes="clamp(50px, 12vw, 72px)"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <h3 className="text-3xl font-extrabold text-center drop-shadow-md z-10"
          style={{ color: "#F0E6F6" }}>
        Full Collection
      </h3>
    </div>
  );
}

function ResultView({
  result,
  stampCount,
  onClose,
}: {
  result: RedeemResult;
  stampCount: number;
  onClose: () => void;
}) {
  const isFullCollection = result.success && result.is_full_collection;

  if (isFullCollection) {
    return (
      <>
        <Confetti />
        <FullCollectionCard stampCount={stampCount} />
      </>
    );
  }

  useEffect(() => {
    if (result.success) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [result.success, onClose]);

  return (
    <div>
      <div
        className="px-6 pt-8 pb-6 border-b border-foreground/10"
        style={{ background: result.success ? getStampsGradient(stampCount) : undefined }}
      >
        <div className="flex items-center gap-3 mb-2">
          {result.success
            ? <CheckCircle2 className="h-7 w-7 text-white" />
            : <Trophy className="h-7 w-7 text-red-500" />}
          <h2 className={`text-xl font-bold ${result.success ? "text-white" : ""}`}>
            {result.success ? "Premio consegnato!" : "Errore"}
          </h2>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        {result.success ? (
          <>
            <div className="rounded-xl p-4 flex flex-col gap-2 text-white" style={{ background: getStampsGradient(stampCount) }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">Premio consegnato</p>
              <>
                <p className="text-3xl font-extrabold">{result.gacha_included} Gacha</p>
                {result.extra_choice !== undefined && result.extra_choice > 0 && (
                  <p className="text-xl font-bold">+ {result.extra_choice} extra a scelta</p>
                )}
              </>
              <div className="mt-2 pt-2 border-t border-white/30 flex justify-between text-sm text-white/80">
                <span>Timbri rimossi: <span className="font-bold text-white">{result.stamps_removed}</span></span>
                <span>Rimanenti: <span className="font-bold text-white">{result.stamps_remaining}</span></span>
              </div>
            </div>
            <p className="text-xs text-foreground/40 text-center">Si chiude automaticamente...</p>
          </>
        ) : (
          <>
            <p className="text-sm text-red-500">{result.error}</p>
            <button onClick={onClose} className="w-full rounded-xl border border-foreground/15 py-3 text-sm font-medium hover:bg-foreground/5 transition-colors">
              Torna indietro
            </button>
          </>
        )}
      </div>
    </div>
  );
}

interface Props {
  userId: string;
  nickname: string;
  stampCount: number;
  open: boolean;
  initialView?: "main" | "confirm";
  onClose: () => void;
}

type View = "main" | "stamps" | "confirm" | "result";

export function AdminUserModal({ userId, nickname, stampCount, open, initialView = "main", onClose }: Props) {
  const [view, setView] = useState<View>(initialView);
  const [stamps, setStamps] = useState<StampEntry[] | null>(null);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [resetPwdResult, setResetPwdResult] = useState<{ password?: string; error?: string } | null>(null);
  const flowSubtractedIdsRef = useRef<string[]>([]);
  const flowCompletedRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const tier = getTier(stampCount);

  const handleClose = () => {
    if (!flowCompletedRef.current && flowSubtractedIdsRef.current.length > 0) {
      const ids = [...flowSubtractedIdsRef.current];
      flowSubtractedIdsRef.current = [];
      fetch("/api/restore-stand-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist_ids: ids }),
        keepalive: true,
      });
    }
    onClose();
    setTimeout(() => { setView("main"); setStamps(null); setResult(null); }, 300);
    if (result?.success) router.refresh();
  };

  const loadStamps = () => {
    startTransition(async () => {
      const data = await getUserStamps(userId);
      setStamps(data?.stamps ?? []);
      setView("stamps");
    });
  };

  const handleResetPassword = async () => {
    const res = await resetUserPassword(userId);
    setResetPwdResult(res);
  };

  const handleRedeem = () => {
    startTransition(async () => {
      const res = await adminRedeem(userId);
      setResult(res);
      setView("result");
      if (res.success) {
        router.refresh();
        // Delay broadcast per permettere alla pagina /scan/result dell'utente
        // di chiudersi/redirigere prima che arrivi la notifica su /protected
        setTimeout(async () => {
          const supabase = (await import("@/lib/supabase/client")).createClient();
          await supabase.channel(`user-notify-${userId}`).send({
            type: "broadcast",
            event: "redeem",
            payload: {
              gacha_included: res.gacha_included,
              extra_choice: res.extra_choice,
              is_full_collection: res.is_full_collection,
              stamps_removed: res.stamps_removed,
              stamps_remaining: res.stamps_remaining,
            },
          });
        }, 4000);
      }
    });
  };

  const handleRedeemFlowSuccess = () => {
    // Dopo che il flusso premi è completato, esegui il redeem per rimuovere i timbri
    handleRedeem();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className={`overflow-hidden ${view === "result" && result?.is_full_collection ? "max-w-sm sm:max-w-lg" : "max-w-sm sm:max-w-md"}`} aria-describedby={undefined}>
        <VisuallyHidden.Root>
          <DialogTitle>Gestione utente {nickname}</DialogTitle>
        </VisuallyHidden.Root>

        {/* ── MAIN VIEW ── */}
        {view === "main" && (
          <div>
            {/* Header */}
            <div
              className="px-6 pt-8 pb-6 border-b border-foreground/10"
              style={{ background: getStampsGradient(stampCount) }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Utente</p>
              <h2 className="text-2xl font-bold text-white drop-shadow-sm">{nickname}</h2>
              <div className="mt-3 flex items-center gap-2">
                <Stamp className="h-4 w-4 text-white/80" />
                <span className="text-sm text-white/90">
                  <span className="font-bold text-white text-lg">{stampCount}</span> timbri attivi
                </span>
              </div>
            </div>

            {/* Azioni */}
            <div className="px-6 py-5 flex flex-col gap-3">
              {/* Vedi timbri */}
              <button
                onClick={loadStamps}
                disabled={isPending}
                className="flex items-center justify-between w-full rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3.5 text-sm font-medium hover:bg-foreground/[0.05] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-500/10 p-2">
                    <Stamp className="h-4 w-4 text-blue-500" />
                  </div>
                  <span>Vedi timbri in possesso</span>
                </div>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin text-foreground/40" /> : <ChevronRight className="h-4 w-4 text-foreground/30" />}
              </button>

              {/* Scarica timbri */}
              <button
                onClick={() => {
                  if (tier?.is_full_collection) {
                    handleRedeem();
                  } else {
                    setView("confirm");
                  }
                }}
                disabled={!tier}
                className={`flex items-center justify-between w-full rounded-xl px-4 py-3.5 text-sm font-medium transition-all ${
                  tier
                    ? "bg-emerald-500/20 text-emerald-950 shadow-[0_5px_0_rgba(6,95,70,0.35)] hover:bg-emerald-500/30 active:translate-y-[5px] active:shadow-[0_0_0_rgba(6,95,70,0.35)]"
                    : "border border-foreground/10 bg-foreground/[0.02] text-foreground/30 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${tier ? "bg-emerald-500/20" : "bg-foreground/5"}`}>
                    <Trophy className={`h-4 w-4 ${tier ? "text-emerald-600" : "text-foreground/30"}`} />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold">{tier ? "Scarica timbri e consegna premio" : "Nessun premio disponibile"}</span>
                    {tier && (
                      <span className="text-xs text-emerald-900">
                        {tier.label} — rimuove {tier.stamps} timbri
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 ${tier ? "text-emerald-800/60" : "text-foreground/20"}`} />
              </button>

              {/* Reset password */}
              <button
                onClick={handleResetPassword}
                disabled={!!resetPwdResult?.password}
                className="flex items-center justify-between w-full rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3.5 text-sm font-medium hover:bg-foreground/[0.05] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-500/10 p-2">
                    <KeyRound className="h-4 w-4 text-amber-500" />
                  </div>
                  <span>Reset password</span>
                </div>
                <ChevronRight className="h-4 w-4 text-foreground/30" />
              </button>
              {resetPwdResult?.password && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                  Nuova password: <span className="font-mono font-bold">{resetPwdResult.password}</span>
                </div>
              )}
              {resetPwdResult?.error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {resetPwdResult.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STAMPS VIEW ── */}
        {view === "stamps" && (
          <div>
            <div
              className="px-6 pt-8 pb-4 border-b border-foreground/10"
              style={{ background: getStampsGradient(stampCount) }}
            >
              <h2 className="text-xl font-bold text-white drop-shadow-sm">{nickname}</h2>
              <p className="text-sm text-white/80 mt-0.5">{stamps?.length ?? 0} timbri raccolti</p>
            </div>
            <div className="px-6 py-4 max-h-80 overflow-y-auto flex flex-col gap-2">
              {stamps && stamps.length > 0 ? stamps.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg bg-foreground/[0.03] px-3 py-2.5 text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-foreground/30 w-5 text-right">{i + 1}</span>
                    <span className="font-medium">{s.artist_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground/40">
                    <Clock className="h-3 w-3" />
                    {new Date(s.stamped_at).toLocaleString("it-IT", {
                      day: "2-digit", month: "2-digit",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-foreground/40 text-center py-8">Nessun timbro.</p>
              )}
            </div>
          </div>
        )}

        {/* ── CONFIRM VIEW ── */}
        {view === "confirm" && (
          <div>
            <div
              className="px-6 pt-8 pb-4 border-b border-foreground/10"
              style={{ background: getStampsGradient(stampCount) }}
            >
              <h2 className="text-2xl text-white">
                Estrazione Gacha di <span className="font-extrabold">{nickname}</span>
              </h2>
            </div>
            <div className="px-6 py-5">
              {isPending ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#996C9E] border-t-transparent" />
                  <p className="text-sm text-foreground/60">Elaborazione in corso...</p>
                </div>
              ) : tier ? (
                <RedeemFlow
                  extraCount={tier.extra ?? 0}
                  gatchaCount={tier.gacha ?? 0}
                  nickname={nickname}
                  onSuccess={handleRedeemFlowSuccess}
                  onCancel={() => setView("main")}
                  subtractedIdsRef={flowSubtractedIdsRef}
                  completedRef={flowCompletedRef}
                />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl bg-red-500/8 border border-red-500/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-3">Timbri collezionati</p>
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <Stamp className="h-5 w-5 text-red-500" />
                      <span className="text-2xl font-extrabold">{stampCount}</span>
                      <span className="text-sm text-foreground/60">timbri</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3.5 text-center">
                    <p className="font-bold text-red-600 dark:text-red-400 text-base">Non hai abbastanza timbri</p>
                    <p className="mt-1 text-sm text-foreground/60">Il primo premio è disponibile con almeno {TIERS[TIERS.length - 1].stamps} timbri.</p>
                  </div>
                  <button
                    onClick={() => setView("main")}
                    className="w-full rounded-xl border border-foreground/15 py-3 text-sm font-medium hover:bg-foreground/5 transition-colors"
                  >
                    Torna indietro
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RESULT VIEW ── */}
        {view === "result" && result && (
          <ResultView
            result={result}
            stampCount={stampCount}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
