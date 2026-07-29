"use client"

import { ArtistCard } from "@/components/artist-card"
import type { Artist } from "@/components/artist-hover-card"

export function ArtistCards({ artists }: { artists: Artist[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {artists.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
    </div>
  )
}