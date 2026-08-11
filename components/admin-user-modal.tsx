"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Stamp, Trophy, Gift, Clock, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { adminRedeem, getUserStamps } from "@/app/actions/admin-redeem";
import type { RedeemResult } from "@/app/actions/admin-redeem";

const TIERS = [
  { stamps: 40, label: "Full collection", gacha: null, extra: null },
  { stamps: 35, gacha: 16, extra: 8, label: "16 gacha + 8 extra" },
  { stamps: 30, gacha: 12, extra: 6, label: "12 gacha + 6 extra" },
  { stamps: 25, gacha: 8,  extra: 4, label: "8 gacha + 4 extra"  },
  { stamps: 20, gacha: 6,  extra: 3, label: "6 gacha + 3 extra"  },
  { stamps: 15, gacha: 4,  extra: 2, label: "4 gacha + 2 extra"  },
  { stamps: 10, gacha: 2,  extra: 1, label: "2 gacha + 1 extra"  },
  { stamps: 5,  gacha: 1,  extra: 0, label: "1 gacha"            },
];

function getTier(n: number) {
  return TIERS.find((t) => n >= t.stamps) ?? null;
}

interface StampEntry {
  id: string;
  stamped_at: string;
  artist_name: string;
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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const tier = getTier(stampCount);

  const handleClose = () => {
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="overflow-hidden max-w-sm sm:max-w-md" aria-describedby={undefined}>
        <VisuallyHidden.Root>
          <DialogTitle>Gestione utente {nickname}</DialogTitle>
        </VisuallyHidden.Root>

        {/* ── MAIN VIEW ── */}
        {view === "main" && (
          <div>
            {/* Header */}
            <div className="bg-foreground/[0.04] px-6 pt-8 pb-6 border-b border-foreground/10">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50 mb-1">Utente</p>
              <h2 className="text-2xl font-bold">{nickname}</h2>
              <div className="mt-3 flex items-center gap-2">
                <Stamp className="h-4 w-4 text-foreground/50" />
                <span className="text-sm text-foreground/70">
                  <span className="font-bold text-foreground text-lg">{stampCount}</span> timbri attivi
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
                onClick={() => setView("confirm")}
                disabled={!tier}
                className={`flex items-center justify-between w-full rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors ${
                  tier
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-foreground"
                    : "border-foreground/10 bg-foreground/[0.02] text-foreground/30 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${tier ? "bg-emerald-500/10" : "bg-foreground/5"}`}>
                    <Trophy className={`h-4 w-4 ${tier ? "text-emerald-500" : "text-foreground/30"}`} />
                  </div>
                  <div className="text-left">
                    <span className="block">{tier ? "Scarica timbri e consegna premio" : "Nessun premio disponibile"}</span>
                    {tier && (
                      <span className="text-xs text-foreground/50">
                        {tier.label} — rimuove {tier.stamps} timbri
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 ${tier ? "text-foreground/30" : "text-foreground/20"}`} />
              </button>
            </div>
          </div>
        )}

        {/* ── STAMPS VIEW ── */}
        {view === "stamps" && (
          <div>
            <div className="bg-foreground/[0.04] px-6 pt-8 pb-4 border-b border-foreground/10">
              <button onClick={() => setView("main")} className="text-xs text-foreground/50 hover:text-foreground mb-3 flex items-center gap-1">
                ← Indietro
              </button>
              <h2 className="text-xl font-bold">{nickname}</h2>
              <p className="text-sm text-foreground/50 mt-0.5">{stamps?.length ?? 0} timbri raccolti</p>
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
            <div className="bg-foreground/[0.04] px-6 pt-8 pb-4 border-b border-foreground/10">
              <button onClick={() => setView("main")} className="text-xs text-foreground/50 hover:text-foreground mb-3 flex items-center gap-1">
                ← Indietro
              </button>
              <h2 className="text-xl font-bold">Conferma riscatto</h2>
              <p className="text-sm text-foreground/50 mt-0.5">{nickname}</p>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              {tier ? (
                <>
                  {/* Riepilogo premio */}
                  <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">Premio da consegnare</p>
                    {tier.gacha !== null ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-lg font-bold">
                          <Trophy className="h-5 w-5 text-emerald-500" />
                          {tier.gacha} Gacha
                        </div>
                        {tier.extra !== null && tier.extra > 0 && (
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <Gift className="h-4 w-4 text-emerald-500/70" />
                            + {tier.extra} extra a scelta
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <Trophy className="h-5 w-5 text-emerald-500" />
                        Full Collection
                      </div>
                    )}
                  </div>

                  {/* Info rimozione */}
                  <div className="rounded-lg bg-foreground/[0.03] border border-foreground/10 px-4 py-3 text-sm text-foreground/60">
                    <p>Verranno rimossi i <span className="font-semibold text-foreground">{tier.stamps} timbri più vecchi</span> di {nickname}.</p>
                    <p className="mt-1">Timbri rimanenti dopo il riscatto: <span className="font-semibold text-foreground">{stampCount - tier.stamps}</span></p>
                  </div>

                  <button
                    onClick={handleRedeem}
                    disabled={isPending}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 flex items-center justify-center gap-2 transition-colors"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
                    {isPending ? "Riscatto in corso…" : "Conferma e consegna premio"}
                  </button>
                </>
              ) : (
                <>
                  {/* Timbri collezionati */}
                  <div className="rounded-xl bg-red-500/8 border border-red-500/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-3">Timbri collezionati</p>
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <Stamp className="h-5 w-5 text-red-500" />
                      <span className="text-2xl font-extrabold">{stampCount}</span>
                      <span className="text-sm text-foreground/60">timbri</span>
                    </div>
                  </div>

                  {/* Messaggio insufficienza */}
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
                </>
              )}
            </div>
          </div>
        )}

        {/* ── RESULT VIEW ── */}
        {view === "result" && result && (
          <div>
            <div className={`px-6 pt-8 pb-6 ${result.success ? "bg-emerald-500/8" : "bg-red-500/8"}`}>
              <div className="flex items-center gap-3 mb-2">
                {result.success
                  ? <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  : <Trophy className="h-7 w-7 text-red-500" />}
                <h2 className="text-xl font-bold">
                  {result.success ? "Premio consegnato!" : "Errore"}
                </h2>
              </div>
              {result.success && (
                <p className="text-sm text-foreground/60">
                  Notifica inviata a <span className="font-semibold">{result.nickname}</span>
                </p>
              )}
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              {result.success ? (
                <>
                  <div className="rounded-xl border border-foreground/10 p-4 flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1">Premio consegnato</p>
                    {result.is_full_collection ? (
                      <p className="text-2xl font-extrabold">Full Collection 🎉</p>
                    ) : (
                      <>
                        <p className="text-2xl font-extrabold">{result.gacha_included} Gacha</p>
                        {result.extra_choice !== undefined && result.extra_choice > 0 && (
                          <p className="text-base text-foreground/70">+ {result.extra_choice} extra a scelta</p>
                        )}
                      </>
                    )}
                    <div className="mt-2 pt-2 border-t border-foreground/10 flex justify-between text-sm text-foreground/60">
                      <span>Timbri rimossi: <span className="font-semibold text-foreground">{result.stamps_removed}</span></span>
                      <span>Rimanenti: <span className="font-semibold text-foreground">{result.stamps_remaining}</span></span>
                    </div>
                  </div>
                  <button onClick={handleClose} className="w-full rounded-xl border border-foreground/15 py-3 text-sm font-medium hover:bg-foreground/5 transition-colors">
                    Chiudi
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-red-500">{result.error}</p>
                  <button onClick={() => setView("main")} className="w-full rounded-xl border border-foreground/15 py-3 text-sm font-medium hover:bg-foreground/5 transition-colors">
                    Torna indietro
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
