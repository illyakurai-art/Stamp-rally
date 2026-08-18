"use client"

import { ArtistHoverCard, type Artist } from "@/components/artist-hover-card"
import { useI18n } from "@/lib/i18n/context"

export function ArtistCard({ artist }: { artist: Artist }) {
  const { t } = useI18n();
  return (
    <ArtistHoverCard artist={artist} side="top">
      <div
        className={`group relative aspect-square w-full rounded-2xl content-visibility-auto transition-[transform,box-shadow] hover:scale-105 hover:shadow-lg cursor-pointer ${
          artist.scanned
            ? "scanned-ring shadow-green-500/20"
            : ""
        }`}
        style={{ containIntrinsicSize: "auto 220px" }}
      >
        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl border-2 ${
            artist.scanned
              ? "border-transparent"
              : "border-foreground/10 group-hover:border-foreground/30"
          }`}
        >
          {artist.image_url ? (
            <img
              src={artist.image_url}
              alt={artist.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-bold text-foreground/30">
              {artist.name.charAt(0)}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
            <p className={`text-sm font-semibold text-white truncate ${artist.scanned ? "pr-10" : ""}`}>{artist.name}</p>
            <p className="mt-0.5 text-xs text-white/70">
              {artist.scanned ? t("scanned") : t("not_visited")}
            </p>
          </div>

          {artist.scanned && (
            <div className="absolute bottom-2 right-2 w-11 h-11 sm:w-[50px] sm:h-[50px]">
              <img
                src="/stamp-badge.png"
                alt="✓"
                className="h-full w-full object-contain drop-shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </ArtistHoverCard>
  )
}