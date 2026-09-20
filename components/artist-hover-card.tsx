"use client"

import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { MapPin, Link2, Check, HelpCircle, Gift, ChevronDown } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

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
  instagram?: string | null
}

interface ArtistHoverCardProps {
  artist: Artist
  children: React.ReactNode
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  counterScale?: number
  fixed?: boolean
  onLocate?: () => void
}

export function ArtistHoverCard({
  artist,
  children,
  align = "center",
  side = "bottom",
  counterScale,
  fixed,
  onLocate,
}: ArtistHoverCardProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [prizeOpen, setPrizeOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const [fixedPos, setFixedPos] = useState<{ x: number; y: number } | null>(null)
  const [absStyle, setAbsStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!open || fixed || !ref.current) return
    const updatePosition = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const elW = Math.min(320, window.innerWidth - 32)
      const elH = 400
      const gap = 8
      let x = rect.left + rect.width / 2 - elW / 2
      if (x < 8) x = 8
      if (x + elW > window.innerWidth - 8) x = window.innerWidth - elW - 8
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      let above: boolean
      if (spaceBelow >= elH + gap) {
        above = false
      } else if (spaceAbove >= elH + gap) {
        above = true
      } else {
        above = spaceAbove > spaceBelow
      }
      setAbsStyle({
        position: "fixed" as const,
        left: x,
        ...(above ? { bottom: window.innerHeight - rect.top + gap } : { top: rect.bottom + gap }),
      })
    }
    updatePosition()
    window.addEventListener("scroll", updatePosition, { passive: true })
    window.addEventListener("resize", updatePosition, { passive: true })
    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, fixed])

  useEffect(() => {
    if (!open || !fixed || !ref.current) return
    const updatePosition = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const elW = 320
      const elH = 400
      const gap = 8
      let x = rect.left + rect.width / 2 - elW / 2
      if (x < 8) x = 8
      if (x + elW > window.innerWidth - 8) x = window.innerWidth - elW - 8
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      let y: number
      if (spaceBelow >= elH + gap) {
        y = rect.bottom + gap
      } else if (spaceAbove >= elH + gap) {
        y = rect.top - elH - gap
      } else {
        y = spaceBelow >= spaceAbove ? rect.bottom + gap : rect.top - elH - gap
      }
      setFixedPos({ x, y })
    }
    updatePosition()
    window.addEventListener("scroll", updatePosition, { passive: true })
    window.addEventListener("resize", updatePosition, { passive: true })
    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, fixed])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const inTrigger = ref.current?.contains(e.target as Node)
      const inPortal = portalRef.current?.contains(e.target as Node)
      if (!inTrigger && !inPortal) {
        setOpen(false)
        setPrizeOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const initials = artist.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  const bio = artist.bio || t("visit_stand_bio").replace("{name}", artist.name)
  const website = artist.website_url
  const instagram = artist.instagram

  const popupContent = (
    <>
      <div className="flex space-x-4">
        <div className="h-12 w-12 border border-white/15 shrink-0 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
          {artist.image_url ? (
                  <img
                    src={artist.image_url}
                    alt={artist.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
          ) : (
            <span className="text-sm font-semibold text-background">{initials}</span>
          )}
        </div>

        <div className="space-y-3 flex-1 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold leading-tight truncate">
                {artist.name}
              </h4>
            </div>
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

          <p className="text-xs text-background/70 leading-relaxed line-clamp-3">
            {bio}
          </p>

          <div className="space-y-1.5 pt-1 text-xs text-background/70">
            <div className="flex items-center">
              <MapPin className="mr-2 h-3.5 w-3.5 shrink-0 stroke-[1.5] text-background/60" />
              {onLocate ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onLocate()
                    setOpen(false)
                  }}
                  className="underline decoration-[#7EB8FF] decoration-2 underline-offset-2 text-[#7EB8FF] hover:text-[#9CC9FF] font-medium truncate"
                >
                  {t("take_me_to_stand")}
                </button>
              ) : (
                <Link
                  href={`/mappa?artist=${encodeURIComponent(artist.display_id ?? artist.id)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="underline decoration-[#7EB8FF] decoration-2 underline-offset-2 text-[#7EB8FF] hover:text-[#9CC9FF] font-medium truncate"
                >
                  {t("take_me_to_stand")}
                </Link>
              )}
            </div>
            {instagram && instagram.split(",").map((handle) => {
                const h = handle.trim().replace(/^@/, "")
                if (!h) return null
                return (
                  <div key={h} className="flex items-center">
                    <svg className="mr-2 h-3.5 w-3.5 shrink-0 stroke-current fill-none text-green-400" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    <a
                      href={h.startsWith("http") ? h : `https://www.instagram.com/${h}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline text-green-400 hover:text-green-300 font-medium truncate"
                    >
                      @{h}
                    </a>
                  </div>
                )
              })}
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

          {prizeOpen && (
            <div className="mt-1 overflow-hidden rounded-lg border border-white/15 bg-white/5 animate-in slide-in-from-top-1 fade-in duration-150">
              {artist.prize_image_url ? (
                  <img
                    src={artist.prize_image_url}
                    alt={`${artist.name} prize`}
                    width={320}
                    height={200}
                    className="w-full object-cover"
                    loading="lazy"
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
    </>
  )

  return (
    <div ref={ref} className="relative">
      <div
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        className="cursor-pointer"
      >
        {children}
      </div>

      {open && fixed && fixedPos && typeof window !== "undefined" && createPortal(
        <div
          ref={portalRef}
          className="z-[9999] w-[calc(100vw-32px)] max-w-80 comic-pop comic-bubble bg-foreground text-background border-2 border-white/60 p-4 rounded-2xl shadow-2xl"
          style={{ position: "fixed", left: fixedPos.x, top: fixedPos.y }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {popupContent}
        </div>,
        document.body
      )}

      {open && !fixed && absStyle && typeof window !== "undefined" && createPortal(
        <div
          ref={portalRef}
          className="z-[9999] w-[calc(100vw-32px)] max-w-80 comic-pop comic-bubble bg-foreground text-background border-2 border-white/60 p-4 rounded-2xl shadow-2xl"
          style={absStyle}
          onContextMenu={(e) => e.preventDefault()}
        >
          {popupContent}
        </div>,
        document.body
      )}
    </div>
  )
}
