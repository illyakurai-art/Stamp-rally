"use client";

import { useState } from "react";
import { Stamp, Gift, Star, ChevronDown, Crown } from "lucide-react";
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
  { stamps: 40, gacha: "20",  extra: "10" },
  { stamps: 45, gacha: "24",  extra: "12" },
  { stamps: 50, gacha: "Full collection", extra: "-", isAll: true },
];

const GRADIENTS = [
  "linear-gradient(to right, #5BC0EB 0%, #7BC67E 100%)", // 5  azzurro → verdino
  "linear-gradient(to right, #7BC67E 0%, #F9D342 100%)", // 10 verdino → giallino
  "linear-gradient(to right, #F9D342 0%, #F5A623 100%)", // 15 giallino → arancino
  "linear-gradient(to right, #F5A623 0%, #E85D5D 100%)", // 20 arancino → rosso chiaro
  "linear-gradient(to right, #E85D5D 0%, #D94A4A 100%)", // 25 rosso chiaro → rosso carminio
  "linear-gradient(to right, #D94A4A 0%, #E88CB5 100%)", // 30 rosso carminio → rosa
  "linear-gradient(to right, #E88CB5 0%, #C9A0DC 100%)", // 35 rosa → fucsia
  "linear-gradient(to right, #C9A0DC 0%, #E88CB5 100%)", // 40 fucsia → rosa
  "linear-gradient(to right, #E88CB5 0%, #9B72CF 100%)", // 45 rosa → violetto
  "linear-gradient(to right, #9B72CF 0%, #5BC0EB 100%)", // 50 violetto → bluetto
];

function getCurrentTier(count: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (count >= TIERS[i].stamps) return i;
  }
  return 0;
}

function tierBaseColor(gradient: string) {
  return gradient.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? "#000000";
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
  const [milestonesOpen, setMilestonesOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    // Sotto 5 timbri: mostra la tendina dei premi aperta di default
    if (stampCount < 5) return true;
    return localStorage.getItem("stamp_rally_milestones_open") !== "false";
  });

  const toggleMilestones = () => {
    setMilestonesOpen((o) => {
      const next = !o;
      try {
        localStorage.setItem("stamp_rally_milestones_open", String(next));
      } catch {}
      return next;
    });
  };
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
              <button
                type="button"
                onClick={toggleMilestones}
                className="w-full rounded-xl p-3.5 text-white text-left transition-transform active:scale-[0.99]"
                style={{ background: gradient, boxShadow: `6px 6px 0 ${tierBaseColor(gradient)}33` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stamp className="h-6 w-6 opacity-90" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold">{stampCount}</span>
                      <span className="text-sm font-medium opacity-80">{t("stamps")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1.5">
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
                        <div className="mt-1.5 flex items-center justify-end gap-1">
                          <Gift className="h-3 w-3 opacity-80" />
                          <span className="text-xs font-medium opacity-90">
                            +{current.extra} {t("extra_choice")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/25 border border-white/40 shadow-md transition-transform duration-300 ${
                        milestonesOpen ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div
                className={`grid transition-all duration-300 ease-in-out ${
                  milestonesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="pt-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50 mb-2">
                      {t("milestones_reached")}
                    </p>
                    <div className="flex flex-col gap-[8px] mx-1.5 pb-1.5">
                      {TIERS.slice(1).map((tier, i) => {
                        const tierGradient = GRADIENTS[Math.min(i, GRADIENTS.length - 1)];
                        const tierHasExtra = tier.extra !== "-" && tier.extra !== "0";
                        const isReached = i < currentTier;
                        const isCurrent = i === currentTier - 1 && hasPrize;
                        const totalTiers = TIERS.length - 2;
                        const totalFuture = totalTiers - currentTier + 1;
                        const futureIndex = isReached ? 0 : i - currentTier;
                        const tiersConquered = currentTier;
                        const maxOpacityReduction = Math.max(0.1, 0.9 - tiersConquered * 0.1);
                        const maxBlur = Math.max(0, 4 - tiersConquered * 0.4);
                        const rowOpacity = isReached ? 1 : Math.max(1 - maxOpacityReduction, 1 - (futureIndex / totalFuture) * maxOpacityReduction);
                        const rowBlur = isReached ? 0 : (futureIndex / totalFuture) * maxBlur;
                        return (
                          <div
                            key={tier.stamps}
                            className={`flex items-center justify-between rounded-lg ${isCurrent ? "px-5" : "px-3"} ${isReached ? "py-[9px]" : "py-2"} ${
                              isReached
                                ? "border border-[#A58CA9]/45"
                                : "border border-dashed border-[#A58CA9]/45"
                            }`}
                            style={{
                              background: isReached ? `${tierBaseColor(tierGradient)}4D` : `${tierBaseColor(tierGradient)}1A`,
                              boxShadow: isReached ? "6px 6px 0 rgba(0, 0, 0, 0.25)" : "3px 3px 0 rgba(0, 0, 0, 0.12)",
                              opacity: rowOpacity,
                              filter: `blur(${rowBlur}px)`,
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="h-2 w-2 rounded-full flex-shrink-0"
                                style={{ background: tierGradient }}
                              />
                              <span className={`text-sm font-medium ${isReached ? "text-foreground/80" : "text-foreground/50"}`}>
                                {tier.stamps} {t("stamps")}
                              </span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${isReached ? "text-foreground/80" : "text-foreground/50"}`}>
                              {tier.isAll ? (
                                <span className={`font-semibold ${isReached ? "text-foreground" : "text-foreground/60"}`}>{t("full_collection")}</span>
                              ) : (
                                <>
                                  <span className={`font-semibold ${isReached ? "text-foreground" : "text-foreground/60"}`}>{tier.gacha} {t("gacha")}</span>
                                  {tierHasExtra && (
                                    <span className={`text-xs font-semibold ${isReached ? "text-foreground" : "text-foreground/60"}`}>
                                      +{tier.extra} {t("extra_choice")}
                                    </span>
                                  )}
                                </>
                              )}
                              {isCurrent && (
                                <span className="ml-0.5 rounded-full bg-[#D9C1E0] px-1.5 py-0.5 text-xs font-semibold text-foreground/80">
                                  {t("current")}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center py-4 text-center">
              <div className="rounded-full bg-foreground/5 p-3 mb-3">
                <Stamp className="h-6 w-6 text-foreground/30" />
              </div>
              <p className="font-semibold text-foreground/80 text-sm">{t("no_prize_yet")}</p>
              <p className="mt-1 text-xs text-foreground/50">
                {t("scan_5_stands")}
              </p>
            </div>

            <button
              type="button"
              onClick={toggleMilestones}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-foreground/15 bg-foreground/[0.03] px-3 py-2.5 text-xs font-medium text-foreground/60 hover:bg-foreground/[0.06] transition-colors"
            >
              {t("show_future_prizes")}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${milestonesOpen ? "rotate-180" : ""}`} />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                milestonesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pt-3">
                  <div className="flex flex-col gap-[8px] mx-1.5 pb-1.5">
                    {TIERS.slice(1).map((tier, i) => {
                      const tierGradient = GRADIENTS[Math.min(i, GRADIENTS.length - 1)];
                      const tierHasExtra = tier.extra !== "-" && tier.extra !== "0";
                      const isReached = i < currentTier;
                      const totalTiers = TIERS.length - 2;
                      const totalFuture = totalTiers - currentTier + 1;
                      const futureIndex = isReached ? 0 : i - currentTier;
                      const tiersConquered = currentTier;
                      const maxOpacityReduction = Math.max(0.1, 0.9 - tiersConquered * 0.1);
                      const maxBlur = Math.max(0, 4 - tiersConquered * 0.4);
                      const rowOpacity = isReached ? 1 : Math.max(1 - maxOpacityReduction, 1 - (futureIndex / totalFuture) * maxOpacityReduction);
                      const rowBlur = isReached ? 0 : (futureIndex / totalFuture) * maxBlur;
                      return (
                        <div
                          key={tier.stamps}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                            isReached
                              ? "border border-[#A58CA9]/45"
                              : "border border-dashed border-[#A58CA9]/45"
                          }`}
                          style={{
                            background: isReached ? `${tierBaseColor(tierGradient)}4D` : `${tierBaseColor(tierGradient)}1A`,
                            boxShadow: isReached ? "6px 6px 0 rgba(0, 0, 0, 0.25)" : "3px 3px 0 rgba(0, 0, 0, 0.12)",
                            opacity: rowOpacity,
                            filter: `blur(${rowBlur}px)`,
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ background: tierGradient }}
                            />
                            <span className={`text-sm font-medium ${isReached ? "text-foreground/80" : "text-foreground/50"}`}>
                              {tier.stamps} {t("stamps")}
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 text-sm ${isReached ? "text-foreground/80" : "text-foreground/50"}`}>
                            {tier.isAll ? (
                              <span className={`font-semibold ${isReached ? "text-foreground" : "text-foreground/60"}`}>{t("full_collection")}</span>
                            ) : (
                              <>
                                <span className={`font-semibold ${isReached ? "text-foreground" : "text-foreground/60"}`}>{tier.gacha} {t("gacha")}</span>
                                {tierHasExtra && (
                                  <span className={`text-xs font-semibold ${isReached ? "text-foreground" : "text-foreground/60"}`}>
                                    +{tier.extra} {t("extra_choice")}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
