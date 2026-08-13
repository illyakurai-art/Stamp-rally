"use client";

import { useState } from "react";
import { Trophy, Stamp, Gift, Star, ChevronRight, Crown } from "lucide-react";
import { UserQrCode } from "@/components/user-qr-code";
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
  { stamps: 40, gacha: "Full collection", extra: "-", isAll: true },
];

const GRADIENTS = [
  "linear-gradient(135deg, #3ABF0A 0%, #C4B239 100%)",
  "linear-gradient(135deg, #C4B239 0%, #E8963E 100%)",
  "linear-gradient(135deg, #E8963E 0%, #E85D3E 100%)",
  "linear-gradient(135deg, #E85D3E 0%, #D93D3D 100%)",
  "linear-gradient(135deg, #D93D3D 0%, #C44DB8 100%)",
  "linear-gradient(135deg, #C44DB8 0%, #8B4DB8 100%)",
  "linear-gradient(135deg, #8B4DB8 0%, #4D7DB8 100%)",
  "linear-gradient(135deg, #4D7DB8 0%, #4DB8A0 100%)",
];

const OPPOSITE_GRADIENTS = [
  "linear-gradient(135deg, #C4B239 0%, #3ABF0A 100%)",
  "linear-gradient(135deg, #E8963E 0%, #C4B239 100%)",
  "linear-gradient(135deg, #E85D3E 0%, #E8963E 100%)",
  "linear-gradient(135deg, #D93D3D 0%, #E85D3E 100%)",
  "linear-gradient(135deg, #C44DB8 0%, #D93D3D 100%)",
  "linear-gradient(135deg, #8B4DB8 0%, #C44DB8 100%)",
  "linear-gradient(135deg, #4D7DB8 0%, #8B4DB8 100%)",
  "linear-gradient(135deg, #4DB8A0 0%, #4D7DB8 100%)",
];

function getCurrentTier(count: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (count >= TIERS[i].stamps) return i;
  }
  return 0;
}

export function PrizeInfoCard({
  stampCount,
  nickname,
  userDisplayId,
  kkUnlocked = false,
}: {
  stampCount: number;
  nickname: string;
  userDisplayId?: string | null;
  kkUnlocked?: string | boolean;
}) {
  const { t } = useI18n();
  const [allTiersOpen, setAllTiersOpen] = useState(false);
  const currentTier = getCurrentTier(stampCount);
  const isMax = currentTier >= TIERS.length - 1;
  const current = TIERS[currentTier];
  const next = isMax ? null : TIERS[currentTier + 1];
  const hasPrize = currentTier > 0;
  const hasExtra = current.extra !== "-" && current.extra !== "0";
  const earnedTiers = TIERS.slice(1, currentTier + 1);

  // All remaining tiers up to the end (excluding tier 0)
  const futureTiers = isMax ? [] : TIERS.slice(currentTier + 1);

  const gradient = GRADIENTS[Math.max(0, currentTier - 1)] || GRADIENTS[0];

  const progress = isMax
    ? 100
    : Math.min(
        ((stampCount - current.stamps) / (next!.stamps - current.stamps)) * 100,
        100
      );

  return (
    <div className="overflow-hidden rounded-lg border border-foreground/10 flex flex-col" style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}>
      <div
        className="px-5 pt-6 pb-5 text-white"
        style={{ background: hasPrize ? gradient : "hsl(var(--foreground) / 0.08)" }}
      >
        <div className="flex items-center justify-between mb-4 min-h-12">
          <div>
            {kkUnlocked && (
              <div className="mb-1 flex justify-center">
                <Crown
                  className="gold-crown h-6 w-6 fill-current"
                />
              </div>
            )}
            <p
              className={`inline-block text-3xl font-bold leading-tight ${
                kkUnlocked ? "gold-text" : ""
              }`}
            >
              {nickname}
            </p>
          </div>
          {userDisplayId && (
            <UserQrCode displayId={userDisplayId} nickname={nickname} />
          )}
        </div>

        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ background: hasPrize ? OPPOSITE_GRADIENTS[Math.max(0, currentTier - 1)] : "hsl(var(--foreground) / 0.08)" }}
        >
          <div className="flex items-center gap-2">
            <Stamp className="h-4 w-4 opacity-90" />
            <span className="text-xs font-medium opacity-90">{t("stamps_collected")}</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight">{stampCount}</span>
        </div>

        {!isMax && next && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/80 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-right text-xs opacity-70">
              <strong>{next.stamps - stampCount}</strong> {t("stamps")} {t("stamps_missing")} {t("missing_to_next_prefix")}
            </div>
          </div>
        )}
        {isMax && (
          <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold opacity-90">
            <Star className="h-4 w-4 fill-white" />
            {t("max_level")}
          </div>
        )}
      </div>

      <div className="px-5 py-4">
        {hasPrize ? (
          <>
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50 mb-2">
                {t("current_prize")}
              </p>
              <div
                className="rounded-xl p-3.5 text-white"
                style={{ background: gradient }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      {current.isAll ? (
                        <span className="text-xl font-extrabold">{t("full_collection")}</span>
                      ) : (
                        <>
                          <span className="text-3xl font-extrabold">{current.gacha}</span>
                          <span className="text-sm font-medium opacity-80">{t("gacha")}</span>
                        </>
                      )}
                    </div>
                    {hasExtra && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Gift className="h-3 w-3 opacity-80" />
                        <span className="text-xs font-medium opacity-90">
                          +{current.extra} {t("extra_choice")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="rounded-full bg-white/20 p-2">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {earnedTiers.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50 mb-2">
                  {t("milestones_reached")}
                </p>
                <div className="flex flex-col gap-1">
                  {earnedTiers.map((tier, i) => {
                    const isCurrentTier = tier.stamps === current.stamps;
                    const tierGradient = GRADIENTS[Math.min(i, GRADIENTS.length - 1)];
                    const tierHasExtra = tier.extra !== "-" && tier.extra !== "0";
                    return (
                      <div
                        key={tier.stamps}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                          isCurrentTier ? "ring-1 ring-foreground/20" : ""
                        }`}
                        style={{
                          background: isCurrentTier
                            ? "hsl(var(--foreground) / 0.05)"
                            : "hsl(var(--foreground) / 0.03)",
                        }}
                      >
                        <div className="flex items-center gap-2.5">
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
                          {isCurrentTier && (
                            <span className="ml-0.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-xs font-medium text-foreground/60">
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

            {!isMax && next && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setAllTiersOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded-lg border border-dashed border-foreground/15 px-3.5 py-2.5 text-sm text-foreground/60 transition-colors hover:bg-foreground/5"
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
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${allTiersOpen ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {allTiersOpen && (
                  <div className="mt-2 flex flex-col gap-1">
                    {futureTiers.map((tier, i) => {
                      const tierGradient = GRADIENTS[Math.min(currentTier + i, GRADIENTS.length - 1)];
                      const tierHasExtra = tier.extra !== "-" && tier.extra !== "0";
                      return (
                        <div
                          key={tier.stamps}
                          className="flex items-center justify-between rounded-lg bg-foreground/[0.03] px-3 py-2"
                        >
                          <div className="flex items-center gap-2.5">
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
          <div className="flex flex-col items-center py-4 text-center">
            <div className="rounded-full bg-foreground/5 p-3 mb-3">
              <Stamp className="h-6 w-6 text-foreground/30" />
            </div>
            <p className="font-semibold text-foreground/80 text-sm">{t("no_prize_yet")}</p>
            <p className="mt-1 text-xs text-foreground/50">
              {t("scan_5_stands")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
