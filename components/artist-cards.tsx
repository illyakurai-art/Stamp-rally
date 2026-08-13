"use client"

import { useRef, useState } from "react"
import { ArtistCard } from "@/components/artist-card"
import { ArtistHoverCard, type Artist } from "@/components/artist-hover-card"
import { useI18n } from "@/lib/i18n/context"

const PAIRS: string[][] = [["Kaimy", "Kiyo"]]

interface GroupedTile {
  id: string
  artists: Artist[]
  isPair: boolean
}

export function ArtistCards({ artists }: { artists: Artist[] }) {
  const tiles: GroupedTile[] = []

  const used = new Set<string>()
  for (const pair of PAIRS) {
    const members = pair
      .map((name) => artists.find((a) => a.name.toLowerCase() === name.toLowerCase()))
      .filter((a): a is Artist => !!a)
    if (members.length === pair.length) {
      tiles.push({
        id: `pair-${pair.map((n) => n.toLowerCase()).join("-")}`,
        artists: members,
        isPair: true,
      })
      for (const m of members) used.add(m.id)
    }
  }

  for (const artist of artists) {
    if (!used.has(artist.id)) {
      tiles.push({ id: artist.id, artists: [artist], isPair: false })
    }
  }

  const tileName = (tile: GroupedTile) =>
    tile.isPair
      ? `${tile.artists[0].name}&${tile.artists[1].name}`
      : tile.artists[0].name
  tiles.sort((a, b) => tileName(a).localeCompare(tileName(b)))

  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {tiles.map((tile) =>
        tile.isPair ? (
          <PairArtistCard key={tile.id} artists={tile.artists} />
        ) : (
          <ArtistCard key={tile.id} artist={tile.artists[0]} />
        )
      )}
    </div>
  )
}

function PairArtistCard({ artists }: { artists: Artist[] }) {
  const { t } = useI18n()
  const [current, setCurrent] = useState(0)
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  const name = `${artists[0].name}&${artists[1].name}`
  const activeArtist = artists[current]
  const scannedCount = artists.filter((a) => a.scanned).length
  const merged: Artist = {
    ...activeArtist,
    id: `pair-${artists.map((a) => a.id).join("-")}`,
    name,
    scanned: scannedCount === artists.length,
  }

  const select = (i: number) => setCurrent((i + artists.length) % artists.length)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    dragStart.current = null
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
      select(current + (dx > 0 ? -1 : 1))
    }
  }

  return (
    <ArtistHoverCard artist={merged} side="top">
      <div
        className={`group relative aspect-square w-full rounded-2xl transition-all hover:scale-105 hover:shadow-lg cursor-pointer [touch-action:pan-y] ${
          merged.scanned
            ? "gold-ring border-transparent shadow-amber-500/20"
            : scannedCount > 0
              ? "scanned-ring border-transparent shadow-green-500/20"
              : ""
        }`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl border-2 ${
            scannedCount === artists.length
              ? "border-transparent"
              : scannedCount > 0
                ? "border-transparent"
                : "border-foreground/10 group-hover:border-foreground/30"
          }`}
        >
          {artists[current].image_url ? (
            <img
              key={`${merged.id}-${current}`}
              src={artists[current].image_url}
              alt={artists[current].name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-bold text-foreground/30">
              {name.charAt(0)}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <p className="mt-0.5 text-xs text-white/70">
              {merged.scanned ? t("secret_kk_unlocked") : scannedCount > 0 ? t("scanned") : t("not_visited")}
            </p>
          </div>

          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
            {artists.map((a, i) => (
              <button
                key={a.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  select(i)
                }}
                aria-label={a.name}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </ArtistHoverCard>
  )
}