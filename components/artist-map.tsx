"use client"

import { useMemo } from "react"
import { ArtistHoverCard, type Artist as BaseArtist } from "@/components/artist-hover-card"
import { useI18n } from "@/lib/i18n/context"

export interface MapArtist extends BaseArtist {
  qr_token?: string | null
  map_x?: number | null
  map_y?: number | null
}

export function ArtistMap({ artists }: { artists: MapArtist[] }) {
  const { t } = useI18n();
  const positioned = useMemo(
    () => artists.filter((a) => a.map_x != null && a.map_y != null),
    [artists]
  )

  const scannedCount = artists.filter((a) => a.scanned).length

  return (
    <div className="mt-8 space-y-6">
      <div className="relative w-full overflow-hidden rounded-xl border border-foreground/10 bg-muted">
        <div className="aspect-[4/3] w-full relative">
          {positioned.map((a) => (
            <div
              key={a.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${a.map_x}%`, top: `${a.map_y}%` }}
            >
              <ArtistHoverCard artist={a} side="top">
                <div className="transition-transform hover:scale-110">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shadow-lg transition-all ${
                      a.scanned
                        ? "bg-green-500 text-white shadow-green-500/40 border-[3px] border-green-300 ring-2 ring-green-500/30"
                        : "bg-secondary text-foreground/80 border-2 border-border"
                    }`}
                  >
                    {a.name.charAt(0)}
                  </div>
                </div>
              </ArtistHoverCard>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-foreground/10 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t("artist_stands")}</h2>
          <span className="text-xs text-foreground/60">
            {scannedCount}/{artists.length} {t("scanned_counter")}
          </span>
        </div>
        <div className="mt-3 space-y-1.5">
          {artists.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg p-2 text-sm"
            >
              <div
                className={`h-3 w-3 rounded-full shrink-0 ${
                  a.scanned ? "bg-green-500" : "bg-foreground/20"
                }`}
              />
              <span className={`font-medium ${a.scanned ? "text-foreground" : "text-foreground/70"}`}>
                {a.name}
              </span>
              {a.display_id && (
                <span className="ml-auto text-xs text-foreground/40 font-mono">
                  {a.display_id}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}