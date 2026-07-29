import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Users, Stamp, Trophy, Activity } from "lucide-react";

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [usersRes, stampsRes, redeemsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "visitor"),
    supabase.from("stamps").select("id", { count: "exact", head: true }),
    supabase.from("redeems").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    totalStamps: stampsRes.count ?? 0,
    totalRedeems: redeemsRes.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  noStore();
  const supabase = await createClient();
  const stats = await getStats(supabase);

  // Ultimi 10 timbri
  const { data: rawStamps } = await supabase
    .from("stamps")
    .select("id, stamped_at, user_id, artist_id")
    .order("stamped_at", { ascending: false })
    .limit(10);

  // Risolve user_id → nickname (gli user_id possono essere UUID o display_id tipo U0001)
  const userIds = [...new Set((rawStamps ?? []).map((s) => s.user_id))];
  const artistIds = [...new Set((rawStamps ?? []).map((s) => s.artist_id))];

  const [profilesRes, artistsRes] = await Promise.all([
    userIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, display_id, nickname")
          .in("display_id", userIds)
      : { data: [] },
    artistIds.length > 0
      ? supabase
          .from("artists")
          .select("id, display_id, name")
          .in("display_id", artistIds)
      : { data: [] },
  ]);

  // Mappa id/display_id → nickname/nome
  const profileMap = new Map<string, string>();
  for (const p of profilesRes.data ?? []) {
    if (p.id) profileMap.set(p.id, p.nickname);
    if (p.display_id) profileMap.set(p.display_id, p.nickname);
  }
  const artistMap = new Map<string, string>();
  for (const a of artistsRes.data ?? []) {
    if (a.id) artistMap.set(a.id, a.name);
    if (a.display_id) artistMap.set(a.display_id, a.name);
  }

  const recentStamps = (rawStamps ?? []).map((s) => ({
    ...s,
    userLabel: profileMap.get(s.user_id) ?? s.user_id,
    artistLabel: artistMap.get(s.artist_id) ?? s.artist_id,
  }));

  // Ultimi 5 riscatti con nickname utente e staff
  const { data: rawRedeems } = await supabase
    .from("redeems")
    .select("id, created_at, user_id, confirmed_by, tier_threshold, stamps_removed_count")
    .order("created_at", { ascending: false })
    .limit(5);

  // Raccoglie tutti gli UUID coinvolti (utenti + staff)
  const redeemAllIds = [...new Set([
    ...(rawRedeems ?? []).map((r) => r.user_id),
    ...(rawRedeems ?? []).map((r) => r.confirmed_by),
  ])];

  const { data: redeemProfiles } = redeemAllIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", redeemAllIds)
    : { data: [] };

  const redeemProfileMap = new Map<string, string>();
  for (const p of redeemProfiles ?? []) {
    if (p.id) redeemProfileMap.set(p.id, p.nickname);
  }

  const recentRedeems = (rawRedeems ?? []).map((r) => ({
    ...r,
    userLabel: redeemProfileMap.get(r.user_id) ?? r.user_id,
    staffLabel: redeemProfileMap.get(r.confirmed_by) ?? r.confirmed_by,
  }));

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-foreground/50 uppercase tracking-wider">Admin</p>
        <h1 className="mt-1 text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Statistiche */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Visitatori registrati"
          value={stats.totalUsers}
        />
        <StatCard
          icon={<Stamp className="h-5 w-5" />}
          label="Timbri attivi"
          value={stats.totalStamps}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Premi riscattati"
          value={stats.totalRedeems}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ultimi timbri */}
        <div className="rounded-xl border border-foreground/10 bg-background p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-foreground/50" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/50">
              Ultimi timbri
            </h2>
          </div>
          {recentStamps && recentStamps.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentStamps.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg bg-foreground/[0.03] px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{s.userLabel}</span>
                    <span className="text-foreground/30 shrink-0">→</span>
                    <span className="text-foreground/70 truncate">{s.artistLabel}</span>
                  </div>
                  <span className="text-xs text-foreground/40 shrink-0 ml-2">
                    {new Date(s.stamped_at).toLocaleString("it-IT", {
                      day: "2-digit", month: "2-digit",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/40">Nessun timbro ancora.</p>
          )}
        </div>

        {/* Ultimi riscatti */}
        <div className="rounded-xl border border-foreground/10 bg-background p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-foreground/50" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/50">
              Ultimi riscatti
            </h2>
          </div>
          {recentRedeems && recentRedeems.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentRedeems.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg bg-foreground/[0.03] px-3 py-2 text-sm"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium truncate">{r.userLabel}</span>
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-semibold shrink-0">
                        -{r.tier_threshold} timbri
                      </span>
                    </div>
                    <span className="text-xs text-foreground/40">
                      Staff: <span className="text-foreground/60">{r.staffLabel}</span>
                    </span>
                  </div>
                  <span className="text-xs text-foreground/40 shrink-0 ml-2">
                    {new Date(r.created_at).toLocaleString("it-IT", {
                      day: "2-digit", month: "2-digit",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/40">Nessun riscatto ancora.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-background p-5">
      <div className="flex items-center gap-2 text-foreground/50 mb-3">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-4xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
