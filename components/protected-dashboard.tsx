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

type ArtistData = {
  id: string;
  name: string;
  image_url?: string | null;
  active: boolean;
  display_id?: string | null;
  scanned: boolean;
};

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
  const userDisplayIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);

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
          .select("artist_id")
          .in("user_id", userIdsToMatch),
        supabase
          .from("artists")
          .select("id, name, image_url, active, display_id")
          .eq("active", true),
      ]);

      const scannedIdentifiers = new Set(
        stampsResult.data?.map((s) => s.artist_id) ?? []
      );

      const artistList = (artistsResult.data ?? []).map((a) => ({
        ...a,
        scanned:
          scannedIdentifiers.has(a.id) ||
          (a.display_id ? scannedIdentifiers.has(a.display_id) : false),
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

  // Re-fetch stamps quando stampsUpdated viene emesso
  useEffect(() => {
    if (stampTick === 0) return;
    const supabase = createClient();
    const fetchStamps = async () => {
      const uid = userIdRef.current;
      const did = userDisplayIdRef.current;
      if (!uid) return;

      const userIdsToMatch = [uid];
      if (did) userIdsToMatch.push(did);

      const [stampsResult, artistsResult] = await Promise.all([
        supabase.from("stamps").select("artist_id").in("user_id", userIdsToMatch),
        supabase.from("artists").select("id, name, image_url, active, display_id").eq("active", true),
      ]);

      const scannedIdentifiers = new Set(stampsResult.data?.map((s) => s.artist_id) ?? []);
      const artistList = (artistsResult.data ?? []).map((a) => ({
        ...a,
        scanned: scannedIdentifiers.has(a.id) || (a.display_id ? scannedIdentifiers.has(a.display_id) : false),
      }));

      setActiveStampsCount(stampsResult.data?.length ?? 0);
      setArtists(artistList);
    };
    fetchStamps();
  }, [stampTick]);

  if (loading) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6">
      <ScanToast />
      <RedeemNotification userId={userId!} />
      <StampRealtimeRefresh userId={userId!} userDisplayId={userDisplayId ?? null} />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold leading-snug">
          {t("welcome_prefix")}
          <br />
          <span className="text-nowrap">{t("welcome_event_name")}</span>
        </h1>
        <Link
          href="/mappa"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border-2 border-green-500 bg-green-700 transition-colors hover:bg-green-600"
        >
          <img src="/map-icon.png" alt={t("map")} className="h-6 w-6" />
        </Link>
      </div>

      <div className="mt-8">
        <PrizeInfoCard stampCount={activeStampsCount} nickname={nickname} userDisplayId={userDisplayId} />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {qrMode && (
          <Link
            href="/scan"
            className="min-h-12 rounded-md bg-foreground px-5 py-3 text-center text-sm font-medium text-background transition-opacity hover:opacity-90 flex items-center justify-center"
          >
            {t("scan_stand")}
          </Link>
        )}
      </div>

      {artists.length > 0 && (
        <div className="mt-10 text-center">
          <h2 className="text-lg font-semibold">{t("artists")}</h2>
          <p className="mt-1 text-sm text-foreground/60">
            {t("select_card")}
          </p>
          <ArtistCards artists={artists} />
        </div>
      )}
    </section>
  );
}