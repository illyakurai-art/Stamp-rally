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

  for (const artist of artists) {
    if (used.has(artist.id)) continue

    // Artista appartenente a una coppia → raggruppa i membri presenti
    const pair = PAIRS.find((p) =>
      p.some((name) => artist.name.toLowerCase() === name.toLowerCase())
    )

    if (pair) {
      const members = pair
        .map((name) => artists.find((a) => a.name.toLowerCase() === name.toLowerCase()))
        .filter((a): a is Artist => !!a)
      if (members.length === pair.length) {
        // Entrambi presenti → tile unica nella posizione del primo membro
        tiles.push({
          id: `pair-${pair.map((n) => n.toLowerCase()).join("-")}`,
          artists: members,
          isPair: true,
        })
        for (const m of members) used.add(m.id)
        continue
      }
      // Solo un membro presente → tile normale
      tiles.push({ id: artist.id, artists: [artist], isPair: false })
      used.add(artist.id)
      continue
    }

    tiles.push({ id: artist.id, artists: [artist], isPair: false })
    used.add(artist.id)
  }

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
  const pairKey = `stamp_rally_pair_${artists.map((a) => a.id).sort().join("-")}`
  // All'avvio: se uno solo è scansionato mostra l'altro (per suggerire cosa manca);
  // se entrambi o nessuno, mantiene l'ultimo visualizzato
  const [current, setCurrent] = useState(() => {
    const unscanned = artists.findIndex((a) => !a.scanned)
    if (unscanned !== -1 && artists.some((a) => a.scanned)) {
      return unscanned
    }
    try {
      const saved = Number(localStorage.getItem(pairKey))
      return Number.isInteger(saved) && saved >= 0 && saved < artists.length ? saved : 0
    } catch {
      return 0
    }
  })
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

  const select = (i: number) => {
    const next = (i + artists.length) % artists.length
    setCurrent(next)
    try {
      localStorage.setItem(pairKey, String(next))
    } catch {}
  }

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
        className={`group relative aspect-square w-full rounded-2xl content-visibility-auto transition-[transform,box-shadow] hover:scale-105 hover:shadow-lg cursor-pointer [touch-action:pan-y] ${
          merged.scanned
            ? "gold-ring border-transparent shadow-amber-500/20"
            : scannedCount > 0
              ? "scanned-ring border-transparent shadow-green-500/20"
              : ""
        }`}
        style={{ containIntrinsicSize: "auto 220px" }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl border-2 bg-white ${
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
              loading="lazy"
              decoding="async"
              className="tile-fade h-full w-full bg-white object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-bold text-foreground/30">
              {name.charAt(0)}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
            <p className={`text-sm font-semibold text-white truncate ${artists[current].scanned ? "pr-10" : ""}`}>{name}</p>
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

          {artists[current].scanned && (
            <div className="absolute bottom-2 right-2 w-11 h-11 sm:w-[50px] sm:h-[50px]">
              <img
                src="/stamp-badge.png"
                alt="✓"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain drop-shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </ArtistHoverCard>
  )
}