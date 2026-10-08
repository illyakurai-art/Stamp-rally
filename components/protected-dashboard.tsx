"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { ScanToast } from "@/components/scan-toast";
import { PrizeInfoCard } from "@/components/prize-info-card";
import { RedeemNotification } from "@/components/redeem-notification";
import { StampRealtimeRefresh } from "@/components/stamp-realtime-refresh";
import { SECRET_PAIRS, getEffectiveStampCount } from "@/lib/secret-pairs";
import { QrCode } from "lucide-react";
import { AnimatedGroup } from "@/components/motion/animated-group";

export function ProtectedDashboard() {
  const { t } = useI18n();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [userDisplayId, setUserDisplayId] = useState<string | null | undefined>(null);
  const [activeStampsCount, setActiveStampsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [qrMode, setQrMode] = useState(false);
  const [rallyTerminated, setRallyTerminated] = useState(false);
  const [stampTick, setStampTick] = useState(0);
  const [kkUnlocked, setKkUnlocked] = useState<string | false>(false);
  const userDisplayIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const artistNamesRef = useRef<string[]>([]);

  useEffect(() => {
    const handler = (e: CustomEvent) => setQrMode(e.detail);
    window.addEventListener("qrModeChange", handler as EventListener);
    setQrMode(localStorage.getItem("qrMode") === "true");
    return () => window.removeEventListener("qrModeChange", handler as EventListener);
  }, []);

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

      const [stampsResult, artistsResult, configResult] = await Promise.all([
        supabase
          .from("stamps")
          .select("artist_id, stamped_at")
          .in("user_id", userIdsToMatch)
          .eq("redeemed", false),
        supabase
          .from("artists")
          .select("display_id, name")
          .eq("active", true),
        supabase
          .from("app_config")
          .select("value")
          .eq("key", "rally_terminated")
          .maybeSingle(),
      ]);

      const scannedIds = new Set(stampsResult.data?.map((s) => s.artist_id) ?? []);
      const artistNames = (artistsResult.data ?? []).map((a) => a.name);
      // Nomi degli artisti timbrati (per deduzione K&K)
      const scannedNames = (artistsResult.data ?? [])
        .filter((a) => a.display_id && scannedIds.has(a.display_id))
        .map((a) => a.name);
      artistNamesRef.current = artistNames;

      setUserId(user.id);
      userIdRef.current = user.id;
      setNickname(nick);
      setUserDisplayId(profileDisplayId);
      userDisplayIdRef.current = profileDisplayId ?? null;

      const rawCount = stampsResult.data?.length ?? 0;
      setActiveStampsCount(getEffectiveStampCount(rawCount, scannedNames));

      setRallyTerminated(configResult?.data?.value === "true");
      setLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (stampTick === 0) return;
    const supabase = createClient();
    const fetchStamps = async () => {
      const uid = userIdRef.current;
      const did = userDisplayIdRef.current;
      if (!uid) return;

      const userIdsToMatch = [uid];
      if (did) userIdsToMatch.push(did);

      const [stampsRes, artistsRes] = await Promise.all([
        supabase
          .from("stamps")
          .select("artist_id")
          .in("user_id", userIdsToMatch)
          .eq("redeemed", false),
        supabase
          .from("artists")
          .select("display_id, name")
          .eq("active", true),
      ]);

      const scannedIds = new Set(stampsRes.data?.map((s) => s.artist_id) ?? []);
      const scannedNames = (artistsRes.data ?? [])
        .filter((a) => a.display_id && scannedIds.has(a.display_id))
        .map((a) => a.name);

      setActiveStampsCount(getEffectiveStampCount(stampsRes.data?.length ?? 0, scannedNames));
    };
    fetchStamps();
  }, [stampTick]);

  if (loading) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6 select-none">
      <ScanToast />
      <RedeemNotification userId={userId!} />
      <StampRealtimeRefresh userId={userId!} userDisplayId={userDisplayId ?? null} />

      <div className="flex items-center justify-center">
        <h1 className="text-2xl font-bold leading-snug text-center bg-gradient-to-b from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent animate-gradient-flow">
          {rallyTerminated ? (
            <>
              {t("rally_terminated")}
              <br />
              <span className="text-sm font-medium px-4">{t("rally_terminated_desc")}</span>
            </>
          ) : (
            <>
              {t("welcome_prefix")}
              <br />
              <span className="text-nowrap">{t("welcome_event_name")}</span>
            </>
          )}
        </h1>
      </div>

      <div className="mt-8">
        <AnimatedGroup preset="blur-sm">
          <PrizeInfoCard stampCount={activeStampsCount} nickname={nickname} userDisplayId={userDisplayId} kkUnlocked={kkUnlocked} />
        </AnimatedGroup>
      </div>

      <div className="mt-8 flex flex-col gap-3 items-center">
        {qrMode ? (
          <Link
            href="/scan"
            className="relative w-full min-h-12 rounded-md bg-foreground px-5 py-4 text-sm font-medium text-background transition-opacity hover:opacity-90 flex items-center justify-center gap-3 sm:w-auto sm:min-w-[340px]"
            style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
          >
            <span className="text-center leading-snug">
              {t("scan_stand_qr_line1")}
              <br />
              {t("scan_stand_qr_line2")}
            </span>
            <QrCode className="absolute right-4 h-12 w-12 shrink-0" strokeWidth={1.2} />
          </Link>
        ) : (
          <button
            aria-disabled="true"
            className="relative w-full min-h-12 rounded-md bg-[#996C9E] px-5 py-4 text-sm font-medium text-white flex items-center justify-center gap-3 cursor-not-allowed select-none sm:w-auto sm:min-w-[340px] overflow-hidden"
            style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
          >
            <span className="nfc-pulse-ring" />
            <span className="nfc-pulse-ring" />
            <span className="nfc-pulse-ring" />
            <span className="text-center leading-snug z-10">
              {t("scan_nfc_line1")}
              <br />
              {t("scan_nfc_line2")}
              <br />
              {t("scan_nfc_line3")}
            </span>
            <img
              src="/nfc-icon.png"
              alt=""
              className="absolute right-6 h-12 w-12 shrink-0 object-contain z-10"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </button>
        )}
      </div>
    </section>
  );
}
