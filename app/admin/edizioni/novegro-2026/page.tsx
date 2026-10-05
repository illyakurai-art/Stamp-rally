"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminUsersList, type UserEntry } from "@/components/admin-users-list";
import { AdminStandsList, type StandEntry } from "@/components/admin-stands-list";
import { AdminQrGrid } from "@/components/admin/admin-qr-grid";
import { TierBreakdown } from "@/components/admin-tier-breakdown";
import { getEffectiveStampCount, SECRET_PAIRS } from "@/lib/secret-pairs";
import { cn } from "@/lib/utils";
import { Users, Stamp, Trophy, Hash, LayoutDashboard, Store, QrCode, BarChart3 } from "lucide-react";

type Tab = "dashboard" | "utenti" | "stand" | "qr";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "utenti", label: "Utenti", icon: Users },
  { id: "stand", label: "Stand", icon: Store },
  { id: "qr", label: "QR Code", icon: QrCode },
];

function safeFilename(name: string): string {
  return name.replace(/[^\w\-]+/g, "_").replace(/^_+|_+$/g, "") || "artista";
}

export default function PastEditionPage() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10">
      {/* Header edizione */}
      <div className="mb-8">
        <p className="text-sm font-medium text-foreground/50 uppercase tracking-wider">
          Edizioni Passate
        </p>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">Novegro Artist Alley 2026</h1>
          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Conclusa
          </span>
        </div>
        <p className="mt-1 text-sm text-foreground/50">
          Dati archiviati — visualizzazione in sola lettura
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
      {tab === "dashboard" && <DashboardTab />}
      {tab === "utenti" && <UtentiTab />}
      {tab === "stand" && <StandTab />}
      {tab === "qr" && <QrTab />}
    </section>
  );
}

// ── Dashboard Tab ──

function DashboardTab() {
  const [stats, setStats] = useState<{ users: number; stamps: number; redeems: number; totalStamps: number } | null>(null);
  const [tierBreakdown, setTierBreakdown] = useState<{ tier: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [usersRes, stampsRes, redeemsRes, tierRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "visitor"),
        supabase.from("stamps").select("id", { count: "exact", head: true }).eq("redeemed", false),
        supabase.from("redeems").select("id", { count: "exact", head: true }),
        supabase.from("redeems").select("tier_threshold"),
      ]);

      const tierCounts = new Map<number, number>();
      for (const r of tierRes.data ?? []) {
        tierCounts.set(r.tier_threshold, (tierCounts.get(r.tier_threshold) ?? 0) + 1);
      }
      const tiers = Array.from(tierCounts.entries())
        .map(([tier, count]) => ({ tier, count }))
        .sort((a, b) => a.tier - b.tier);
      const stampsConsumed = tiers.reduce((sum, t) => sum + t.tier * t.count, 0);
      const activeStamps = stampsRes.count ?? 0;

      setStats({
        users: usersRes.count ?? 0,
        stamps: activeStamps,
        redeems: redeemsRes.count ?? 0,
        totalStamps: activeStamps + stampsConsumed,
      });
      setTierBreakdown(tiers);
      setLoading(false);
    })();
  }, []);

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

function UtentiTab() {
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
        supabase.from("artists").select("display_id, name"),
      ]);

      const profiles = profilesRes.data ?? [];
      const allArtists = artistsRes.data ?? [];
      const displayIds = profiles.map((u) => u.display_id).filter(Boolean) as string[];

      const [stampCountsRes, allStampsRes] = displayIds.length > 0
        ? await Promise.all([
            supabase.rpc("get_stamp_counts_by_users", { p_user_ids: displayIds }),
            supabase.from("stamps").select("user_id, artist_id").in("user_id", displayIds).eq("redeemed", false),
          ])
        : [{ data: [] as unknown[] }, { data: [] as unknown[] }];

      const stampCounts = (stampCountsRes.data as { user_id: string; count: number }[]) ?? [];
      const allStamps = (allStampsRes.data as { user_id: string; artist_id: string }[]) ?? [];
      const artistNameById = new Map(allArtists.map((a) => [a.display_id, a.name]));

      const stampsByUser = stampCounts.reduce<Record<string, number>>((acc, s) => {
        acc[s.user_id] = s.count;
        return acc;
      }, {});

      const stampsByUserGrouped = new Map<string, string[]>();
      for (const stamp of allStamps) {
        const names = stampsByUserGrouped.get(stamp.user_id) ?? [];
        const artistName = artistNameById.get(stamp.artist_id);
        if (artistName) names.push(artistName);
        stampsByUserGrouped.set(stamp.user_id, names);
      }

      const result: UserEntry[] = profiles.map((u) => {
        const rawCount = stampsByUser[u.display_id ?? ""] ?? 0;
        const scannedNames = stampsByUserGrouped.get(u.display_id ?? "") ?? [];
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
  }, []);

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

function StandTab() {
  const [stands, setStands] = useState<StandEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: artists } = await supabase
        .from("artists")
        .select("id, name, display_id")
        .order("display_id", { ascending: true });

      const displayIds = (artists ?? []).map((a) => a.display_id).filter(Boolean) as string[];

      const { data: stampCounts } = displayIds.length > 0
        ? await supabase.rpc("get_stamp_counts_by_artists", { p_artist_ids: displayIds })
        : { data: [] as unknown[] };

      const stampsByArtist = ((stampCounts as { artist_id: string; count: number }[]) ?? []).reduce<Record<string, number>>(
        (acc, s) => {
          acc[s.artist_id] = s.count;
          return acc;
        },
        {}
      );

      const { data: inventory } = await supabase
        .from("stand_inventory")
        .select("artist_id, remaining, total");

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
  }, []);

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

function QrTab() {
  const [artistQRs, setArtistQRs] = useState<{ display_id: string; name: string; qr_token: string; filename: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: artists } = await supabase
        .from("artists")
        .select("display_id, name, qr_token, active")
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
  }, []);

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
