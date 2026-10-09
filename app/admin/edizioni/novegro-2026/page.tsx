"use client";

import { useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { createClient } from "@/lib/supabase/client";
import { AdminUsersList, type UserEntry } from "@/components/admin-users-list";
import { AdminStandsList, type StandEntry } from "@/components/admin-stands-list";
import { AdminQrGrid } from "@/components/admin/admin-qr-grid";
import { TierBreakdown } from "@/components/admin-tier-breakdown";
import { ArtistCards } from "@/components/artist-cards";
import { ArtistHoverCard, type Artist } from "@/components/artist-hover-card";
import { InView } from "@/components/motion/in-view";
import { getEffectiveStampCount, SECRET_PAIRS } from "@/lib/secret-pairs";
import { cn } from "@/lib/utils";
import { Users, Stamp, Trophy, Hash, LayoutDashboard, Store, QrCode, BarChart3, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

type Tab = "dashboard" | "utenti" | "stand" | "qr" | "stampapp";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "utenti", label: "Utenti", icon: Users },
  { id: "stand", label: "Stand", icon: Store },
  { id: "qr", label: "QR Code", icon: QrCode },
  { id: "stampapp", label: "StampApp", icon: Stamp },
];

function safeFilename(name: string): string {
  return name.replace(/[^\w\-]+/g, "_").replace(/^_+|_+$/g, "") || "artista";
}

type EditionInfo = { name: string; start: string; end: string; isActive: boolean; mapPath: string };

async function fetchEdition(): Promise<EditionInfo> {
  const supabase = createClient();
  const { data } = await supabase
    .from("app_config")
    .select("key, value")
    .in("key", ["edition_novegro_2026_name", "edition_novegro_2026_start", "edition_novegro_2026_end", "edition_novegro_2026_map"]);
  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  const start = map.get("edition_novegro_2026_start") ?? "";
  const end = map.get("edition_novegro_2026_end") ?? "";
  return {
    name: map.get("edition_novegro_2026_name") ?? "Novegro Artist Alley 2026",
    start,
    end,
    isActive: Boolean(start && end),
    mapPath: map.get("edition_novegro_2026_map") ?? "/mappa.webp",
  };
}

export default function PastEditionPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [edition, setEdition] = useState<EditionInfo | null>(null);

  useEffect(() => {
    fetchEdition().then(setEdition);
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10">
      {/* Header edizione */}
      <div className="mb-8">
        <p className="text-sm font-medium text-foreground/50 uppercase tracking-wider">
          Edizioni Passate
        </p>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">{edition?.name ?? "Novegro Artist Alley 2026"}</h1>
          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Conclusa
          </span>
        </div>
        <p className="mt-1 text-sm text-foreground/50">
          Dati archiviati — visualizzazione in sola lettura
          {edition?.start && edition?.end && (
            <span className="ml-2 text-foreground/40">
              ({edition.start} → {edition.end})
            </span>
          )}
        </p>
      </div>

      {/* Tab */}
      <div className="flex gap-1 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-1 mb-8 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center",
              tab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Contenuto tab */}
      {!edition ? (
        <p className="text-sm text-foreground/40">Caricamento edizione…</p>
      ) : !edition.isActive ? (
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-foreground/70">Range date non configurato</p>
          <p className="mt-2 text-sm text-foreground/50">
            Imposta i range date di {edition.name} in app_config.
          </p>
        </div>
      ) : tab === "stampapp" ? (
        <StampAppTab edition={edition} />
      ) : (
        <>
          {tab === "dashboard" && <DashboardTab edition={edition} />}
          {tab === "utenti" && <UtentiTab edition={edition} />}
          {tab === "stand" && <StandTab edition={edition} />}
          {tab === "qr" && <QrTab edition={edition} />}
        </>
      )}
    </section>
  );
}

// ── Dashboard Tab ──

function DashboardTab({ edition }: { edition: EditionInfo }) {
  const [stats, setStats] = useState<{ users: number; stamps: number; redeems: number; totalStamps: number } | null>(null);
  const [tierBreakdown, setTierBreakdown] = useState<{ tier: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [usersRes, stampsRes, allStampsRes, redeemsRes, tierRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "visitor"),
        supabase.from("stamps").select("id", { count: "exact", head: true }).eq("redeemed", false)
          .gte("stamped_at", edition.start).lte("stamped_at", edition.end),
        supabase.from("stamps").select("id", { count: "exact", head: true })
          .gte("stamped_at", edition.start).lte("stamped_at", edition.end),
        supabase.from("redeems").select("id", { count: "exact", head: true })
          .gte("created_at", edition.start).lte("created_at", edition.end),
        supabase.from("redeems").select("tier_threshold")
          .gte("created_at", edition.start).lte("created_at", edition.end),
      ]);

      const tierCounts = new Map<number, number>();
      for (const r of tierRes.data ?? []) {
        tierCounts.set(r.tier_threshold, (tierCounts.get(r.tier_threshold) ?? 0) + 1);
      }
      const tiers = Array.from(tierCounts.entries())
        .map(([tier, count]) => ({ tier, count }))
        .sort((a, b) => a.tier - b.tier);

      setStats({
        users: usersRes.count ?? 0,
        stamps: stampsRes.count ?? 0,
        redeems: redeemsRes.count ?? 0,
        totalStamps: allStampsRes.count ?? 0,
      });
      setTierBreakdown(tiers);
      setLoading(false);
    })();
  }, [edition]);

  if (loading) return <p className="text-sm text-foreground/40">Caricamento statistiche…</p>;
  if (!stats) return <p className="text-sm text-foreground/40">Nessun dato disponibile.</p>;

  return (
    <div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 mb-10">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Visitatori registrati"
          value={stats.users}
          tint="from-violet-500/15 to-fuchsia-500/15 text-violet-700 dark:text-violet-300"
          iconTint="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          icon={<Stamp className="h-5 w-5" />}
          label="Timbri attivi"
          value={stats.stamps}
          tint="from-sky-500/15 to-blue-500/15 text-sky-700 dark:text-sky-300"
          iconTint="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Premi riscattati"
          value={stats.redeems}
          tint="from-emerald-500/15 to-teal-500/15 text-emerald-700 dark:text-emerald-300"
          iconTint="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={<Hash className="h-5 w-5" />}
          label="Timbri totali"
          value={stats.totalStamps}
          tint="from-amber-500/15 to-orange-500/15 text-amber-700 dark:text-amber-300"
          iconTint="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="rounded-xl border border-foreground/10 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5 max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Tier List
          </h2>
        </div>
        <TierBreakdown data={tierBreakdown} total={stats.redeems} />
      </div>
    </div>
  );
}

// ── Utenti Tab ──

function UtentiTab({ edition }: { edition: EditionInfo }) {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [profilesRes, artistsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, nickname, display_id, created_at")
          .eq("role", "visitor")
          .order("nickname", { ascending: true }),
        supabase.from("artists").select("display_id, name")
          .gte("created_at", edition.start).lte("created_at", edition.end),
      ]);

      const profiles = profilesRes.data ?? [];
      const allArtists = artistsRes.data ?? [];
      const displayIds = profiles.map((u) => u.display_id).filter(Boolean) as string[];

      const allStamps = displayIds.length > 0
        ? await supabase
            .from("stamps")
            .select("user_id, artist_id")
            .in("user_id", displayIds)
            .eq("redeemed", false)
            .gte("stamped_at", edition.start)
            .lte("stamped_at", edition.end)
        : { data: [] as { user_id: string; artist_id: string }[] };

      const stamps = allStamps.data ?? [];
      const artistNameById = new Map(allArtists.map((a) => [a.display_id, a.name]));

      const stampsByUserGrouped = new Map<string, string[]>();
      for (const stamp of stamps) {
        const names = stampsByUserGrouped.get(stamp.user_id) ?? [];
        const artistName = artistNameById.get(stamp.artist_id);
        if (artistName) names.push(artistName);
        stampsByUserGrouped.set(stamp.user_id, names);
      }

      const result: UserEntry[] = profiles.map((u) => {
        const scannedNames = stampsByUserGrouped.get(u.display_id ?? "") ?? [];
        const rawCount = scannedNames.length;
        const kkUnlocked = SECRET_PAIRS.some((pair) =>
          pair.members.every((name) =>
            scannedNames.some((n) => n.toLowerCase() === name.toLowerCase())
          )
        );
        return {
          id: u.id,
          nickname: u.nickname,
          display_id: u.display_id,
          created_at: u.created_at,
          stamps: getEffectiveStampCount(rawCount, scannedNames),
          kkUnlocked,
        };
      });

      setUsers(result);
      setLoading(false);
    })();
  }, [edition]);

  if (loading) return <p className="text-sm text-foreground/40">Caricamento utenti…</p>;

  return (
    <div>
      <p className="text-sm text-foreground/50 mb-6">
        {users.length} visitator{users.length === 1 ? "e" : "i"} registrat{users.length === 1 ? "o" : "i"}
      </p>
      <AdminUsersList users={users} />
    </div>
  );
}

// ── Stand Tab ──

function StandTab({ edition }: { edition: EditionInfo }) {
  const [stands, setStands] = useState<StandEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: artists } = await supabase
        .from("artists")
        .select("id, name, display_id")
        .gte("created_at", edition.start)
        .lte("created_at", edition.end)
        .order("display_id", { ascending: true });

      const displayIds = (artists ?? []).map((a) => a.display_id).filter(Boolean) as string[];

      const { data: stampRows } = displayIds.length > 0
        ? await supabase
            .from("stamps")
            .select("artist_id")
            .in("artist_id", displayIds)
            .gte("stamped_at", edition.start)
            .lte("stamped_at", edition.end)
        : { data: [] as { artist_id: string }[] };

      const stampsByArtist = (stampRows ?? []).reduce<Record<string, number>>(
        (acc, s) => {
          acc[s.artist_id] = (acc[s.artist_id] ?? 0) + 1;
          return acc;
        },
        {}
      );

      const { data: inventory } = displayIds.length > 0
        ? await supabase
            .from("stand_inventory")
            .select("artist_id, remaining, total")
            .in("artist_id", displayIds)
        : { data: [] as { artist_id: string; remaining: number; total: number }[] };

      const inventoryByArtist = (inventory ?? []).reduce<Record<string, { remaining: number; total: number }>>(
        (acc, row) => {
          acc[row.artist_id] = { remaining: row.remaining, total: row.total };
          return acc;
        },
        {}
      );

      const result: StandEntry[] = (artists ?? []).map((a) => {
        const inv = inventoryByArtist[a.display_id ?? ""];
        return {
          id: a.id,
          name: a.name,
          display_id: a.display_id,
          stamps: stampsByArtist[a.display_id ?? ""] ?? 0,
          remaining: inv?.remaining ?? null,
          total: inv?.total ?? null,
        };
      });

      setStands(result);
      setLoading(false);
    })();
  }, [edition]);

  if (loading) return <p className="text-sm text-foreground/40">Caricamento stand…</p>;

  return (
    <div>
      <p className="text-sm text-foreground/50 mb-6">
        {stands.length} stand disponibil{stands.length === 1 ? "e" : "i"}
      </p>
      <AdminStandsList stands={stands} />
    </div>
  );
}

// ── QR Code Tab ──

function QrTab({ edition }: { edition: EditionInfo }) {
  const [artistQRs, setArtistQRs] = useState<{ display_id: string; name: string; qr_token: string; filename: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: artists } = await supabase
        .from("artists")
        .select("display_id, name, qr_token, active")
        .gte("created_at", edition.start)
        .lte("created_at", edition.end)
        .order("display_id");

      const result = (artists ?? [])
        .filter((a) => a.qr_token)
        .map((a) => ({
          display_id: a.display_id,
          name: a.name,
          qr_token: a.qr_token!,
          filename: `${a.display_id}_${safeFilename(a.name)}.png`,
        }));

      setArtistQRs(result);
      setLoading(false);
    })();
  }, [edition]);

  if (loading) return <p className="text-sm text-foreground/40">Caricamento QR…</p>;

  return (
    <div>
      <p className="text-sm text-foreground/50 mb-6">
        {artistQRs.length} artisti — QR generati con profile picture al centro
      </p>
      <AdminQrGrid artists={artistQRs} />
    </div>
  );
}

// ── StampApp Tab ──

function StampAppTab({ edition }: { edition: EditionInfo }) {
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      // Posizioni snapshot per edizione da artist_map_positions (dopo la migrazione);
      // se la tabella è assente/vuota si usano artists.map_x/map_y (Novegro = edizione corrente al momento dello snapshot)
      const [artistsRes, posRes] = await Promise.all([
        supabase
          .from("artists")
          .select("id, name, image_url, prize_image_url, display_id, map_x, map_y, instagram")
          .gte("created_at", edition.start)
          .lte("created_at", edition.end)
          .order("name", { ascending: true }),
        supabase
          .from("artist_map_positions")
          .select("artist_id, map_x, map_y")
          .eq("edition_key", "edition_novegro_2026"),
      ]);

      const rows = artistsRes.data ?? [];
      const posById = new Map((posRes.data ?? []).map((p) => [p.artist_id, p]));

      // Stato "scanned" delle tile: timbri attivi dell'admin nell'edizione
      const scannedIds = new Set<string>();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userIds = [user.id];
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_id")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.display_id) userIds.push(profile.display_id);

        const { data: stampRows } = await supabase
          .from("stamps")
          .select("artist_id")
          .in("user_id", userIds)
          .eq("redeemed", false)
          .gte("stamped_at", edition.start)
          .lte("stamped_at", edition.end);
        for (const s of stampRows ?? []) scannedIds.add(s.artist_id);
      }

      setArtists(
        rows.map((a) => {
          const pos = a.display_id ? posById.get(a.display_id) : undefined;
          return {
            ...a,
            map_x: pos ? pos.map_x : a.map_x,
            map_y: pos ? pos.map_y : a.map_y,
            scanned: scannedIds.has(a.id) || (a.display_id ? scannedIds.has(a.display_id) : false),
          };
        })
      );
    })();
  }, [edition]);

  if (!artists) return <p className="text-sm text-foreground/40">Caricamento artisti…</p>;

  if (artists.length === 0)
    return <p className="text-sm text-foreground/40">Nessun artista presente in questa edizione.</p>;

  return (
    <div>
      <p className="text-sm text-foreground/50 mb-2">
        {artists.length} artisti presenti a questa edizione — tiles come le vedono gli utenti.
      </p>

      {/* Apertura mappa edizione */}
      <button
        onClick={() => setMapOpen((o) => !o)}
        className="relative mt-4 w-full min-h-12 rounded-md bg-foreground px-5 py-4 text-sm font-medium text-background transition-all hover:opacity-90 flex items-center justify-center sm:min-w-[340px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0_rgba(0,0,0,0.25)]"
        style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
      >
        <span className="text-center leading-snug">
          {mapOpen ? "Nascondi mappa" : "Apri mappa edizione"}
          <br />
          <span className="text-xs font-normal opacity-70">
            Posizioni degli stand come durante l'evento
          </span>
        </span>
        <span className="absolute right-4 flex h-14 w-14 items-center justify-center rounded-md bg-white shadow-sm">
          <img src="/map-icon.svg" alt="Mappa" className="h-10 w-10" />
        </span>
      </button>

      {mapOpen && <EditionMap artists={artists} mapPath={edition.mapPath} />}

      <InView
        viewOptions={{ once: true, margin: "0px 0px -250px 0px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
        }}
      >
        <ArtistCards artists={artists} />
      </InView>
    </div>
  );
}

// ── Mappa edizione (solo admin, archivio) ──

function EditionMap({ artists, mapPath }: { artists: Artist[]; mapPath: string }) {
  const [mapScale, setMapScale] = useState(1);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const positioned = artists.filter((a) => a.map_x != null && a.map_y != null);

  useEffect(() => {
    const interval = setInterval(() => {
      const api = transformRef.current;
      if (api?.state) {
        setMapScale(api.state.scale);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const locateArtist = (artist: Artist) => {
    const api = transformRef.current;
    const viewport = viewportRef.current;
    const img = imgRef.current;
    if (!api || !viewport || !img) return;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;
    const contentW = 1600;
    const contentH = (1600 * nh) / nw;
    const scale = 2;
    const cx = ((artist.map_x ?? 0) / 100) * contentW;
    const cy = ((artist.map_y ?? 0) / 100) * contentH;
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    api.setTransform(vw / 2 - cx * scale, vh / 2 - cy * scale, scale, 600);
  };

  if (positioned.length === 0) {
    return <p className="mt-4 text-sm text-foreground/40">Nessuna posizione stand configurata per questa edizione.</p>;
  }

  return (
    <div className="mt-4">
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        limitToBounds
        centerOnInit
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-lg font-bold tracking-tight">Mappa edizione</span>
              <div className="flex items-center gap-2 ml-auto">
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
            </div>
            <div
              ref={viewportRef}
              className="relative overflow-hidden rounded-xl border border-foreground/10 h-[70vh] min-h-[420px]"
              style={{ background: "#FBCFE8" }}
            >
              <TransformComponent wrapperClass="!w-full !h-full">
                <div className="relative" style={{ width: 1600 }}>
                  <img
                    ref={imgRef}
                    src={mapPath}
                    alt="Mappa edizione"
                    className="max-w-none block"
                    style={{ width: 1600, height: "auto" }}
                    draggable={false}
                  />
                  {positioned.map((a) => (
                    <div
                      key={a.id}
                      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${a.map_x}%`, top: `${a.map_y}%` }}
                    >
                      <ArtistHoverCard artist={a} side="top" counterScale={mapScale} fixed onLocate={() => locateArtist(a)}>
                        <div
                          className="transition-transform hover:scale-110"
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                        >
                          <div
                            className={`overflow-hidden rounded-full flex items-center justify-center ${
                              a.scanned
                                ? "border-2 border-green-500 shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                                : "border-2 border-white/90 shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                            }`}
                            style={{ width: 22, height: 22 }}
                          >
                            {a.image_url ? (
                              <img
                                src={a.image_url}
                                alt={a.name}
                                width={88}
                                height={88}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span
                                className={`flex h-full w-full items-center justify-center text-[10px] font-bold ${
                                  a.scanned ? "bg-green-600 text-white" : "bg-secondary text-foreground/70"
                                }`}
                              >
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
                  <span className="text-foreground/70">Timbrato</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full bg-secondary border border-border" />
                  <span className="text-foreground/70">Da visitare</span>
                </div>
              </div>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

// ── StatCard ──

function StatCard({
  icon,
  label,
  value,
  tint,
  iconTint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: string;
  iconTint: string;
}) {
  return (
    <div className={`rounded-xl border border-foreground/10 bg-gradient-to-br p-5 ${tint}`}>
      <div className={`flex items-center gap-2 mb-3 ${iconTint}`}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-4xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
