"use client"

import React, { useState } from "react"
import Link from "next/link"
import { CalendarDays, MapPin, Link2, Check, HelpCircle, Gift, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useI18n } from "@/lib/i18n/context"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export interface Artist {
  id: string
  name: string
  image_url?: string | null
  prize_image_url?: string | null
  scanned: boolean
  active?: boolean
  bio?: string | null
  location?: string | null
  website_url?: string | null
  joined_date?: string | null
  followers_count?: number
  following_count?: number
  display_id?: string | null
  map_x?: number | null
  map_y?: number | null
}

interface ArtistHoverCardProps {
  artist: Artist
  children: React.ReactNode
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
}

export function ArtistHoverCard({
  artist,
  children,
  align = "center",
  side = "bottom",
}: ArtistHoverCardProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [prizeOpen, setPrizeOpen] = useState(false)

  // Genera le iniziali dall'artista
  const initials = artist.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  // Default o dati reali
  const joinedDate = artist.joined_date || `${t("edition")} 2026`
  const bio = artist.bio || t("visit_stand_bio").replace("{name}", artist.name)
  const website = artist.website_url

  return (
    <HoverCard
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setPrizeOpen(false)
      }}
      openDelay={0}
      closeDelay={150}
    >
      <HoverCardTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
      >
        {children}
      </HoverCardTrigger>

      <HoverCardContent
        align={align}
        side={side}
        className="comic-pop comic-bubble w-80 bg-foreground text-background border-2 border-white/60 p-4 rounded-2xl shadow-2xl z-50"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="flex space-x-4">
          {/* Avatar dell'artista */}
          <Avatar className="h-12 w-12 border border-white/15 shrink-0">
            {artist.image_url ? (
              <AvatarImage src={artist.image_url} alt={artist.name} />
            ) : null}
            <AvatarFallback className="bg-white/10 text-background font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-3 flex-1 overflow-hidden">
            {/* Intestazione: Nome e Badge di Stato */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold leading-tight truncate">
                  {artist.name}
                </h4>
              </div>

              {/* Badge Scansionato/Non visitato */}
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${
                  artist.scanned
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {artist.scanned ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>{t("scanned")}</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="h-3 w-3" />
                    <span>{t("to_visit")}</span>
                  </>
                )}
              </div>
            </div>

            {/* Descrizione / Bio */}
            <p className="text-xs text-background/70 leading-relaxed line-clamp-3">
              {bio}
            </p>

            {/* Informazioni aggiuntive (Data, Luogo, Sito) */}
            <div className="space-y-1.5 pt-1 text-xs text-background/70">
              <div className="flex items-center">
                <MapPin className="mr-2 h-3.5 w-3.5 shrink-0 stroke-[1.5] text-background/60" />
                <Link
                  href={`/mappa?artist=${encodeURIComponent(artist.display_id ?? artist.id)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="underline decoration-[#7EB8FF] decoration-2 underline-offset-2 text-[#7EB8FF] hover:text-[#9CC9FF] font-medium truncate"
                >
                  {t("take_me_to_stand")}
                </Link>
              </div>
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-3.5 w-3.5 shrink-0 stroke-[1.5] text-background/60" />
                <span>{joinedDate}</span>
              </div>
              {website && (
                <div className="flex items-center">
                  <Link2 className="mr-2 h-3.5 w-3.5 shrink-0 stroke-[1.5] text-background/60" />
                  <a
                    href={website.startsWith("http") ? website : `https://${website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-background/60 truncate"
                  >
                    {website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>

            {/* Stato Timbro Footer */}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/15 text-xs">
              <span className="text-background/70">{t("stamp_status")}</span>
              <span
                className={`font-semibold ${
                  artist.scanned ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {artist.scanned ? t("stamp_collected") : t("awaiting_scan")}
              </span>
            </div>

            {/* Bottone premio dell'artista */}
            <button
              onClick={() => setPrizeOpen((prev) => !prev)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium text-background transition-colors hover:bg-white/20"
            >
              <Gift className="h-3.5 w-3.5 text-white/80" />
              <span>{t("show_artist_prize")}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-background/60 transition-transform ${
                  prizeOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Tendina premio */}
            {prizeOpen && (
              <div className="mt-1 overflow-hidden rounded-lg border border-white/15 bg-white/5 animate-in slide-in-from-top-1 fade-in duration-150">
                {artist.prize_image_url ? (
                  <img
                    src={artist.prize_image_url}
                    alt={`${artist.name} prize`}
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
                    <Gift className="h-6 w-6 text-background/60" />
                    <p className="text-xs text-background/70">{t("prize_not_available")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
