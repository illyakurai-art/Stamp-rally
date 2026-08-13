"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { ArtistHoverCard } from "@/components/artist-hover-card";

interface MapArtist {
  id: string;
  name: string;
  display_id?: string | null;
  image_url?: string | null;
  prize_image_url?: string | null;
  map_x?: number | null;
  map_y?: number | null;
  scanned: boolean;
}

export default function MappaPage() {
  const { t } = useI18n();
  const [artists, setArtists] = useState<MapArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      let displayId: string | null = null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_id")
        .eq("id", user.id)
        .maybeSingle();
      displayId = profile?.display_id ?? null;

      const userIdsToMatch = [user.id];
      if (displayId) userIdsToMatch.push(displayId);

      const [artistsRes, stampsRes] = await Promise.all([
        supabase
          .from("artists")
          .select("id, name, display_id, image_url, prize_image_url, map_x, map_y")
          .eq("active", true),
        supabase
          .from("stamps")
          .select("artist_id")
          .in("user_id", userIdsToMatch),
      ]);

      const scanned = new Set(stampsRes.data?.map((s) => s.artist_id) ?? []);
      setArtists(
        (artistsRes.data ?? []).map((a) => ({
          ...a,
          scanned: scanned.has(a.id) || (a.display_id ? scanned.has(a.display_id) : false),
        }))
      );
      setLoading(false);
    });
  }, []);

  const positioned = artists.filter((a) => a.map_x != null && a.map_y != null);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <Link href="/protected" className="text-sm font-medium text-foreground/70 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> {t("back_to_my_area")}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-4">{t("map")}</h1>
      </div>
      <div className="mt-6 mx-auto w-full max-w-5xl">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          limitToBounds
          centerOnInit
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="mb-3 flex items-center gap-2">
                <button
                  onClick={() => zoomIn()}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-foreground/20 transition-colors hover:bg-foreground/5"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-foreground/20 transition-colors hover:bg-foreground/5"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-foreground/20 transition-colors hover:bg-foreground/5"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                <TransformComponent wrapperClass="!w-full">
                  <div className="relative" style={{ width: 1200 }}>
                    <img
                      src="/mappa.jpg"
                      alt="Mappa"
                      className="max-w-none block"
                      style={{ width: 1200, height: "auto" }}
                      draggable={false}
                    />
                    {!loading &&
                      positioned.map((a) => (
                        <div
                          key={a.id}
                          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${a.map_x}%`,
                            top: `${a.map_y}%`,
                          }}
                        >
                          <ArtistHoverCard artist={a} side="top">
                            <div className="transition-transform hover:scale-110">
                              <div
                              className={`overflow-hidden rounded-full flex items-center justify-center ${
                                a.scanned
                                  ? "ring-[3px] ring-green-500 border-2 border-green-300 shadow-[0_0_0_2px_rgba(0,0,0,0.75),0_0_6px_4px_rgba(0,0,0,0.35)]"
                                  : "border-2 border-white/90 shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                              }`}
                              style={{ width: 28, height: 28 }}
                              >
                                {a.image_url ? (
                                  <img
                                    src={a.image_url}
                                    alt={a.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className={`flex h-full w-full items-center justify-center text-[10px] font-bold ${
                                    a.scanned ? "bg-green-600 text-white" : "bg-[#27272a] text-white/80"
                                  }`}>
                                    {a.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </ArtistHoverCard>
                        </div>
                      ))}
                  </div>
                </TransformComponent>
                {/* Legenda */}
                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-3 rounded-lg border border-foreground/10 bg-background/80 backdrop-blur-sm px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-green-500 border border-white" />
                    <span className="text-foreground/70">{t("scanned")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-[#27272a] border border-white" />
                    <span className="text-foreground/70">{t("to_visit")}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>
    </main>
  );
}
