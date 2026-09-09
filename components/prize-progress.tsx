import { STAMP_GRADIENTS } from "@/lib/stamp-gradient";

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

const GRADIENTS = STAMP_GRADIENTS;

function getCurrentTier(count: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (count >= TIERS[i].stamps) {
      return i;
    }
  }
  return 0;
}

export function StampProgress({
  stampCount,
  className = "",
}: {
  stampCount: number;
  className?: string;
}) {
  const currentTier = getCurrentTier(stampCount);
  const isMax = currentTier >= TIERS.length - 1;

  const current = TIERS[currentTier];
  const next = isMax ? null : TIERS[currentTier + 1];

  const progress = isMax
    ? 100
    : Math.min(
        ((stampCount - current.stamps) / (next!.stamps - current.stamps)) * 100,
        100
      );

  const displayTiers = TIERS.slice(1);

  return (
    <div
      className={`rounded-lg border border-foreground/10 p-5 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground/60">Timbri collezionati</p>
          {!isMax && (
            <p className="text-xs text-foreground/40">
              {next!.stamps - stampCount} timbr{next!.stamps - stampCount === 1 ? "o" : "i"} mancant{next!.stamps - stampCount === 1 ? "e" : "i"}
            </p>
          )}
        </div>
        <p className="mt-2 text-3xl font-bold">{stampCount}</p>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background:
                GRADIENTS[Math.max(0, currentTier - 1)] || GRADIENTS[0],
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-foreground/40">
          <span>{current.stamps} timbri</span>
          {!isMax && <span>{next!.stamps} timbri</span>}
          {isMax && <span>MAX ✓</span>}
        </div>
      </div>

      {/* Griglia step */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {displayTiers.map((tier, i) => {
          const reached = i + 1 <= currentTier;
          const isCurrent = i + 1 === currentTier;
          const gradientIndex = i;

          return (
            <div
              key={tier.stamps}
              className="rounded-md px-2 py-1.5 text-xs transition-all flex items-center justify-center font-semibold"
              style={
                reached
                  ? {
                      background:
                        GRADIENTS[Math.min(gradientIndex, GRADIENTS.length - 1)],
                      color: "#fff",
                      boxShadow: isCurrent
                        ? "0 0 0 2px rgba(255,255,255,0.3)"
                        : "none",
                    }
                  : {
                      background: "hsl(var(--foreground) / 0.05)",
                      color: "hsl(var(--foreground) / 0.3)",
                    }
              }
            >
              {tier.stamps}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PrizeProgress({
  stampCount,
  className = "",
}: {
  stampCount: number;
  className?: string;
}) {
  const currentTier = getCurrentTier(stampCount);
  const isMax = currentTier >= TIERS.length - 1;

  const current = TIERS[currentTier];
  const next = isMax ? null : TIERS[currentTier + 1];

  const hasExtra = current.extra !== "-" && current.extra !== "0";

  return (
    <div
      className={`rounded-lg border border-foreground/10 bg-foreground/[0.02] p-6 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground/60 uppercase tracking-wider">
            Premi accumulati
          </p>
          {isMax ? (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Completato
            </span>
          ) : (
            <span className="text-xs text-foreground/40">
              Livello {currentTier} di {TIERS.length - 1}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div>
            {current.isAll ? (
              <p className="text-3xl font-extrabold sm:text-4xl tracking-tight">
                Full collection
              </p>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold sm:text-5xl tracking-tight">
                  {current.gacha}
                </span>
                <span className="text-xl font-medium text-foreground/70">
                  gacha
                </span>
              </div>
            )}
          </div>

          {hasExtra && (
            <div className="inline-flex items-center gap-1.5 self-start rounded-md bg-foreground/10 px-3 py-1.5 text-sm font-semibold text-foreground">
              <span>+{current.extra} extra a scelta</span>
            </div>
          )}
        </div>
      </div>

      {!isMax && next && (
        <div className="mt-6 border-t border-foreground/10 pt-4 flex items-center justify-between text-xs text-foreground/60">
          <span>Prossimo traguardo ({next.stamps} timbri):</span>
          <span className="font-semibold text-foreground/80">
            {next.isAll
              ? "Full collection"
              : `${next.gacha} gacha${
                  next.extra !== "-" && next.extra !== "0"
                    ? ` + ${next.extra} extra`
                    : ""
                }`}
          </span>
        </div>
      )}
    </div>
  );
}
