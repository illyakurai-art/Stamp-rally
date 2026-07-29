"use client"

import { ArtistHoverCard, type Artist } from "@/components/artist-hover-card"
import { useI18n } from "@/lib/i18n/context"

export function ArtistCard({ artist }: { artist: Artist }) {
  const { t } = useI18n();
  return (
    <ArtistHoverCard artist={artist} side="top">
      <div
        className={`group relative aspect-square w-full overflow-hidden rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${
          artist.scanned
            ? "border-green-500 shadow-green-500/20"
            : "border-foreground/10 hover:border-foreground/30"
        }`}
      >
        {artist.image_url ? (
          <img
            src={artist.image_url}
            alt={artist.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-bold text-foreground/30">
            {artist.name.charAt(0)}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
          <p className="text-sm font-semibold text-white truncate">{artist.name}</p>
          <p className="mt-0.5 text-xs text-white/70">
            {artist.scanned ? t("scanned") : t("not_visited")}
          </p>
        </div>

        {artist.scanned && (
          <div className="absolute top-2 right-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white shadow-md">
              ✓
            </div>
          </div>
        )}
      </div>
    </ArtistHoverCard>
  )
}