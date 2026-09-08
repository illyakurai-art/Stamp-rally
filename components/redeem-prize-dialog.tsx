"use client";

import { useState } from "react";
import { Trophy, Stamp, Gift, Star, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useI18n } from "@/lib/i18n/context";

interface PrizeTier {
  stamps: number;
  gacha: string;
  extra: string;
  isAll?: boolean;
}

const TIERS: PrizeTier[] = [
  { stamps: 0,  gacha: "0",   extra: "0" },
  { stamps: 5,  gacha: "1",   extra: "0" },
  { stamps: 10, gacha: "2",   extra: "1" },
  { stamps: 15, gacha: "4",   extra: "2" },
  { stamps: 20, gacha: "6",   extra: "3" },
  { stamps: 25, gacha: "8",   extra: "4" },
  { stamps: 30, gacha: "12",  extra: "6" },
  { stamps: 35, gacha: "16",  extra: "8" },
  { stamps: 40, gacha: "20",  extra: "10" },
  { stamps: 45, gacha: "24",  extra: "12" },
  { stamps: 50, gacha: "Full collection", extra: "-", isAll: true },
];

const GRADIENTS = [
  "linear-gradient(to right, #5BC0EB 0%, #7BC67E 100%)", // 5
  "linear-gradient(to right, #7BC67E 0%, #F9D342 100%)", // 10
  "linear-gradient(to right, #F9D342 0%, #F5A623 100%)", // 15
  "linear-gradient(to right, #F5A623 0%, #F08C7A 100%)", // 20
  "linear-gradient(to right, #F08C7A 0%, #E85D5D 100%)", // 25
  "linear-gradient(to right, #E85D5D 0%, #E88CB5 100%)", // 30
  "linear-gradient(to right, #E88CB5 0%, #C9A0DC 100%)", // 35
  "linear-gradient(to right, #C9A0DC 0%, #9B72CF 100%)", // 40
  "linear-gradient(to right, #9B72CF 0%, #C5A3C9 100%)", // 45
  "linear-gradient(to right, #C5A3C9 0%, #9B72CF 100%)", // 50
];

function getCurrentTier(count: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (count >= TIERS[i].stamps) return i;
  }
  return 0;
}

interface RedeemPrizeDialogProps {
  nickname: string;
  stampCount: number;
  children: React.ReactNode;
}

export function RedeemPrizeDialog({
  nickname,
  stampCount,
  children,
}: RedeemPrizeDialogProps) {
  const [open, setOpen] = useState(false);
  const [allTiersOpen, setAllTiersOpen] = useState(false);
  const { t } = useI18n();

  const currentTier = getCurrentTier(stampCount);
  const isMax = currentTier >= TIERS.length - 1;
  const current = TIERS[currentTier];
  const next = isMax ? null : TIERS[currentTier + 1];
  const hasPrize = currentTier > 0;
  const hasExtra = current.extra !== "-" && current.extra !== "0";

  const gradient = GRADIENTS[Math.max(0, currentTier - 1)] || GRADIENTS[0];

  const progress = isMax
    ? 100
    : Math.min(
        ((stampCount - current.stamps) / (next!.stamps - current.stamps)) * 100,
        100
      );

  // All earned tiers (excluding tier 0)
  const earnedTiers = TIERS.slice(1, currentTier + 1);

  // All remaining tiers up to the end (excluding tier 0)
  const futureTiers = isMax ? [] : TIERS.slice(currentTier + 1);

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setAllTiersOpen(false); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="overflow-hidden max-w-sm sm:max-w-md" aria-describedby={undefined}>
        <VisuallyHidden.Root>
          <DialogTitle>{t("redeem_prize")} — {nickname}</DialogTitle>
        </VisuallyHidden.Root>
        {/* Header colorato */}
        <div
          className="px-6 pt-8 pb-6 text-white"
          style={{ background: hasPrize ? gradient : "hsl(var(--foreground) / 0.08)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-white/20 p-2.5">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest opacity-80">
                {t("redeem_prize")}
              </p>
              <p className="text-lg font-bold leading-tight">{nickname}</p>
            </div>
          </div>

          {/* Contatore timbri */}
          <div className="rounded-xl bg-white/15 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stamp className="h-5 w-5 opacity-90" />
              <span className="text-sm font-medium opacity-90">{t("stamps_collected")}</span>
            </div>
            <span className="text-3xl font-extrabold tracking-tight">{stampCount}</span>
          </div>

          {/* Barra progresso */}
          {!isMax && next && (
            <div className="mt-4">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-xs opacity-70">
                <span>{current.stamps} {t("stamps")}</span>
                <span>{next.stamps - stampCount} {t("stamps_missing")}</span>
              </div>
            </div>
          )}
          {isMax && (
            <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold opacity-90">
              <Star className="h-4 w-4 fill-white" />
              {t("max_level")}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {hasPrize ? (
            <>
              {/* Premio attuale */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50 mb-3">
                  {t("current_prize")}
                </p>
                <div
                  className="rounded-xl p-4 text-white"
                  style={{ background: gradient }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        {current.isAll ? (
                          <span className="text-2xl font-extrabold">{t("full_collection")}</span>
                        ) : (
                          <>
                            <span className="text-4xl font-extrabold">{current.gacha}</span>
                            <span className="text-lg font-medium opacity-80">{t("gacha")}</span>
                          </>
                        )}
                      </div>
                      {hasExtra && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <Gift className="h-3.5 w-3.5 opacity-80" />
                          <span className="text-sm font-medium opacity-90">
                            +{current.extra} {t("extra_choice")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                      <Trophy className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Traguardi raggiunti */}
              {earnedTiers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50 mb-3">
                    {t("milestones_reached")}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {earnedTiers.map((tier, i) => {
                      const isCurrent = tier.stamps === current.stamps;
                      const tierGradient = GRADIENTS[Math.min(i, GRADIENTS.length - 1)];
                      const tierHasExtra = tier.extra !== "-" && tier.extra !== "0";
                      return (
                        <div
                          key={tier.stamps}
                          className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 transition-all ${
                            isCurrent ? "ring-1 ring-foreground/20" : ""
                          }`}
                          style={{
                            background: isCurrent
                              ? "hsl(var(--foreground) / 0.05)"
                              : "hsl(var(--foreground) / 0.03)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ background: tierGradient }}
                            />
                            <span className="text-sm font-medium">
                              {tier.stamps} {t("stamps")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            {tier.isAll ? (
                              <span className="font-semibold text-foreground">{t("full_collection")}</span>
                            ) : (
                              <>
                                <span className="font-semibold text-foreground">{tier.gacha} {t("gacha")}</span>
                                {tierHasExtra && (
                                  <span className="text-xs text-foreground/50">
                                    +{tier.extra} extra
                                  </span>
                                )}
                              </>
                            )}
                            {isCurrent && (
                              <span className="ml-1 rounded-full bg-foreground/10 px-1.5 py-0.5 text-xs font-medium text-foreground/60">
                                {t("current")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Prossimo traguardo */}
              {!isMax && next && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setAllTiersOpen((o) => !o)}
                    className="flex w-full items-center justify-between rounded-lg border border-dashed border-foreground/15 px-4 py-3 text-sm text-foreground/60 transition-colors hover:bg-foreground/5"
                  >
                    <span>{t("next_milestone")} {next.stamps} {t("stamps")}</span>
                    <div className="flex items-center gap-1 font-medium text-foreground/80">
                      <span>
                        {next.isAll
                          ? t("full_collection")
                          : `${next.gacha} ${t("gacha")}${
                              next.extra !== "-" && next.extra !== "0"
                                ? ` + ${next.extra} extra`
                                : ""
                            }`}
                      </span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform ${
                          allTiersOpen ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {allTiersOpen && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {futureTiers.map((tier, i) => {
                        const tierGradient = GRADIENTS[Math.min(currentTier + i, GRADIENTS.length - 1)];
                        const tierHasExtra = tier.extra !== "-" && tier.extra !== "0";
                        return (
                          <div
                            key={tier.stamps}
                            className="flex items-center justify-between rounded-lg bg-foreground/[0.03] px-3.5 py-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="h-2 w-2 rounded-full flex-shrink-0"
                                style={{ background: tierGradient }}
                              />
                              <span className="text-sm font-medium text-foreground/70">
                                {tier.stamps} {t("stamps")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              {tier.isAll ? (
                                <span className="font-semibold text-foreground">{t("full_collection")}</span>
                              ) : (
                                <>
                                  <span className="font-semibold text-foreground">{tier.gacha} {t("gacha")}</span>
                                  {tierHasExtra && (
                                    <span className="text-xs text-foreground/50">
                                      +{tier.extra} extra
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Nessun premio ancora */
            <div className="flex flex-col items-center py-6 text-center">
              <div className="rounded-full bg-foreground/5 p-4 mb-4">
                <Stamp className="h-8 w-8 text-foreground/30" />
              </div>
              <p className="font-semibold text-foreground/80">{t("no_prize_yet")}</p>
              <p className="mt-1.5 text-sm text-foreground/50">
                {t("scan_5_stands")}
              </p>
              {next && (
                <p className="mt-3 text-xs text-foreground/40">
                  {next.stamps - stampCount} {t("stamps")} {t("stamps_missing")}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
