"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { ScanToast } from "@/components/scan-toast";
import { ArtistCards } from "@/components/artist-cards";
import { PrizeInfoCard } from "@/components/prize-info-card";
import { RedeemNotification } from "@/components/redeem-notification";
import { StampRealtimeRefresh } from "@/components/stamp-realtime-refresh";
import { SECRET_PAIRS } from "@/lib/secret-pairs";
import { ChevronDown, QrCode } from "lucide-react";

type ArtistData = {
  id: string;
  name: string;
  image_url?: string | null;
  prize_image_url?: string | null;
  active: boolean;
  display_id?: string | null;
  map_x?: number | null;
  map_y?: number | null;
  scanned: boolean;
  stampedAt?: string | null;
  instagram?: string | null;
};

type ArtistSort = "alpha" | "scanned" | "unscanned_first";

export function ProtectedDashboard() {
  const { t } = useI18n();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [userDisplayId, setUserDisplayId] = useState<string | null | undefined>(null);
  const [activeStampsCount, setActiveStampsCount] = useState(0);
  const [artists, setArtists] = useState<ArtistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrMode, setQrMode] = useState(false);
  const [stampTick, setStampTick] = useState(0); // incrementato per forzare re-fetch stamps
  const [artistSort, setArtistSort] = useState<ArtistSort>(() => {
    if (typeof window === "undefined") return "alpha";
    const saved = localStorage.getItem("stamp_rally_artist_sort");
    if (saved === "scanned" || saved === "unscanned_first") return saved;
    return "alpha";
  });
  const [sortOpen, setSortOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const userDisplayIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  // Chiudi la tendina al click fuori
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Memorizza la scelta di ordinamento
  useEffect(() => {
    try {
      localStorage.setItem("stamp_rally_artist_sort", artistSort);
    } catch {}
  }, [artistSort]);

  useEffect(() => {
    const handler = (e: CustomEvent) => setQrMode(e.detail);
    window.addEventListener("qrModeChange", handler as EventListener);
    setQrMode(localStorage.getItem("qrMode") === "true");
    return () => window.removeEventListener("qrModeChange", handler as EventListener);
  }, []);

  // Ascolta evento stampsUpdated per aggiornare il conteggio senza reload completo
  useEffect(() => {
    const handler = () => setStampTick((t) => t + 1);
    window.addEventListener("stampsUpdated", handler);
    return () => window.removeEventListener("stampsUpdated", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/sign-up");
        return;
      }

      let nick = user.email ?? "Utente";
      let profileDisplayId: string | null | undefined = null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, display_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.nickname) {
        nick = profile.nickname;
        profileDisplayId = profile.display_id;

        // Se il profilo esiste ma manca il display_id, rigeneralo
        if (!profile.display_id) {
          const { data: fixed } = await supabase.rpc("fix_missing_display_id", {
            p_user_id: user.id,
          });
          if (fixed) profileDisplayId = fixed as string;
        }
      } else {
        const metadataNickname = user.user_metadata?.nickname as string | undefined;
        if (metadataNickname) {
          await supabase
            .from("profiles")
            .upsert(
              { id: user.id, nickname: metadataNickname },
              { onConflict: "id" }
            );
          nick = metadataNickname;
          // Rileggi il profilo per ottenere il display_id assegnato dal trigger
          const { data: refetched } = await supabase
            .from("profiles")
            .select("display_id")
            .eq("id", user.id)
            .maybeSingle();
          profileDisplayId = refetched?.display_id ?? null;
        }
      }

      const userIdsToMatch = [user.id];
      if (profileDisplayId) {
        userIdsToMatch.push(profileDisplayId);
      }

      const [stampsResult, artistsResult] = await Promise.all([
        supabase
          .from("stamps")
          .select("artist_id, stamped_at")
          .in("user_id", userIdsToMatch),
        supabase
          .from("artists")
          .select("id, name, image_url, prize_image_url, active, display_id, map_x, map_y, instagram")
          .eq("active", true),
      ]);

      const scannedIdentifiers = new Set(
        stampsResult.data?.map((s) => s.artist_id) ?? []
      );

      // Prima data di timbratura per ogni artista (serve per l'ordine cronologico)
      const stampedAtById = new Map<string, string | null>();
      for (const s of stampsResult.data ?? []) {
        const key = s.artist_id;
        const cur = stampedAtById.get(key);
        if (!cur || (s.stamped_at && s.stamped_at < cur)) {
          stampedAtById.set(key, s.stamped_at ?? null);
        }
      }

      const artistList = (artistsResult.data ?? []).map((a) => ({
        ...a,
        scanned:
          scannedIdentifiers.has(a.id) ||
          (a.display_id ? scannedIdentifiers.has(a.display_id) : false),
        stampedAt: stampedAtById.get(a.id) ?? stampedAtById.get(a.display_id ?? "") ?? null,
      }));

      setUserId(user.id);
      userIdRef.current = user.id;
      setNickname(nick);
      setUserDisplayId(profileDisplayId);
      userDisplayIdRef.current = profileDisplayId ?? null;
      setActiveStampsCount(stampsResult.data?.length ?? 0);
      setArtists(artistList);
      setLoading(false);
    });
  }, [router]);

  // Re-fetch stamps count quando stampsUpdated viene emesso (artists non cambiano)
  useEffect(() => {
    if (stampTick === 0) return;
    const supabase = createClient();
    const fetchStamps = async () => {
      const uid = userIdRef.current;
      const did = userDisplayIdRef.current;
      if (!uid) return;

      const userIdsToMatch = [uid];
      if (did) userIdsToMatch.push(did);

      // Solo conteggio timbri, non tutti i dati — usa count con head:true
      const { count } = await supabase
        .from("stamps")
        .select("id", { count: "exact", head: true })
        .in("user_id", userIdsToMatch);

      setActiveStampsCount(count ?? 0);

      // Marca scanned sui nuovi artisti senza rifetchare l'intera lista
      if (artists.length > 0) {
        const { data: newStamps } = await supabase
          .from("stamps")
          .select("artist_id, stamped_at")
          .in("user_id", userIdsToMatch);

        const scannedIds = new Set(newStamps?.map((s) => s.artist_id) ?? []);
        const stampedAtById = new Map<string, string | null>();
        for (const s of newStamps ?? []) {
          const key = s.artist_id;
          const cur = stampedAtById.get(key);
          if (!cur || (s.stamped_at && s.stamped_at < cur)) {
            stampedAtById.set(key, s.stamped_at ?? null);
          }
        }
        setArtists((prev) =>
          prev.map((a) => ({
            ...a,
            scanned: scannedIds.has(a.id) || (a.display_id ? scannedIds.has(a.display_id) : false),
            stampedAt: stampedAtById.get(a.id) ?? stampedAtById.get(a.display_id ?? "") ?? a.stampedAt ?? null,
          }))
        );
      }
    };
    fetchStamps();
  }, [stampTick]);

  if (loading) return null;

  const sortedArtists = [...artists].sort((a, b) => {
    if (artistSort === "alpha") {
      return a.name.localeCompare(b.name, "it", { sensitivity: "base" });
    }
    // Ordine di timbratura: prima i timbrati (dal più vecchio), poi i non timbrati in ordine alfabetico
    if (artistSort === "scanned") {
      if (a.scanned !== b.scanned) return a.scanned ? -1 : 1;
      if (a.scanned && b.scanned) {
        return (a.stampedAt ?? "").localeCompare(b.stampedAt ?? "");
      }
      return a.name.localeCompare(b.name, "it", { sensitivity: "base" });
    }
    // Prima i mancanti in ordine alfabetico, poi i timbrati in ordine alfabetico
    if (a.scanned !== b.scanned) return a.scanned ? 1 : -1;
    return a.name.localeCompare(b.name, "it", { sensitivity: "base" });
  });

  const sortLabel =
    artistSort === "alpha" ? t("sort_alpha") : artistSort === "scanned" ? t("sort_scanned") : t("sort_unscanned_first");

  // Obiettivo segreto: tutti i membri di una coppia scansionati → corona + nome oro
  const kkLabel =
    SECRET_PAIRS.find((pair) =>
      pair.members.every((name) =>
        artists.some(
          (a) => a.name.toLowerCase() === name.toLowerCase() && a.scanned
        )
      )
    )?.label ?? false;

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6">
      <ScanToast />
      <RedeemNotification userId={userId!} />
      <StampRealtimeRefresh userId={userId!} userDisplayId={userDisplayId ?? null} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold leading-snug">
          {t("welcome_prefix")}
          <br />
          <span className="text-nowrap">{t("welcome_event_name")}</span>
        </h1>
      </div>

      <div className="mt-8">
        <PrizeInfoCard stampCount={activeStampsCount} nickname={nickname} userDisplayId={userDisplayId} kkUnlocked={kkLabel} />
      </div>

      <div className="mt-8 flex flex-col gap-3 items-center">
        {qrMode ? (
          <Link
            href="/scan"
            className="w-full min-h-12 rounded-md bg-foreground px-5 py-4 text-center text-sm font-medium text-background transition-opacity hover:opacity-90 flex items-center justify-start gap-3 sm:w-auto sm:min-w-[340px]"
            style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
          >
            <QrCode className="h-12 w-12 shrink-0" strokeWidth={1.2} />
            <span className="text-center leading-snug">
              {t("scan_stand_qr_line1")}
              <br />
              {t("scan_stand_qr_line2")}
            </span>
          </Link>
        ) : (
          <button
            aria-disabled="true"
            className="w-full min-h-12 rounded-md bg-[#996C9E] px-5 py-4 text-center text-sm font-medium text-white flex items-center justify-start gap-3 cursor-not-allowed select-none sm:w-auto sm:min-w-[340px]"
            style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
          >
            <img src="/nfc-icon.png" alt="" className="h-12 w-12 shrink-0 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
            <span className="text-center leading-snug">
              {t("scan_nfc_line1")}
              <br />
              {t("scan_nfc_line2")}
              <br />
              {t("scan_nfc_line3")}
            </span>
          </button>
        )}
        <Link
          href="/mappa"
          onClick={(e) => {
            e.preventDefault();
            setMapZoom(true);
            setTimeout(() => {
              router.push("/mappa");
            }, 260);
          }}
          className="w-full min-h-12 rounded-md bg-foreground px-5 py-4 text-center text-sm font-medium text-background transition-opacity hover:opacity-90 flex items-center justify-start gap-3 sm:w-auto sm:min-w-[340px]"
          style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
        >
          <img
            src="/map-icon.png"
            alt={t("map")}
            className={`h-[72px] w-[72px] shrink-0 rounded-md object-cover transition-all duration-300 ease-out ${
              mapZoom ? "scale-[3] opacity-0" : ""
            }`}
          />
          <span className="text-center leading-snug">
            Apri la Mappa
            <br />
            per conoscere la posizione
            <br />
            degli Artisti
          </span>
        </Link>
      </div>

      {artists.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{t("artists")}</h2>
              <p className="mt-1 text-sm text-foreground/80">
                {t("select_card")}
              </p>
            </div>
            <div className="relative shrink-0" ref={sortRef}>
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex h-10 items-center gap-2 rounded-md border border-foreground/15 bg-background px-3 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                <span className="text-foreground/80">{t("sort_by")}:</span>
                <span>{sortLabel}</span>
                <ChevronDown
                  className={`h-4 w-4 text-foreground/50 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>
              {sortOpen && (
                <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-md border border-foreground/15 bg-background shadow-lg">
                  <button
                    onClick={() => { setArtistSort("alpha"); setSortOpen(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-foreground/5 ${
                      artistSort === "alpha" ? "bg-foreground/5 font-medium" : ""
                    }`}
                  >
                    {t("sort_alpha")}
                  </button>
                  <button
                    onClick={() => { setArtistSort("scanned"); setSortOpen(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-foreground/5 ${
                      artistSort === "scanned" ? "bg-foreground/5 font-medium" : ""
                    }`}
                  >
                    {t("sort_scanned")}
                  </button>
                  <button
                    onClick={() => { setArtistSort("unscanned_first"); setSortOpen(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-foreground/5 ${
                      artistSort === "unscanned_first" ? "bg-foreground/5 font-medium" : ""
                    }`}
                  >
                    {t("sort_unscanned_first")}
                  </button>
                </div>
              )}
            </div>
          </div>
          <ArtistCards artists={sortedArtists} />
        </div>
      )}
    </section>
  );
}