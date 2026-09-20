import { createClient } from "@/lib/supabase/server";
import { Users, Stamp, Trophy, Activity, BarChart3, Hash } from "lucide-react";
import { fetchRecentRedeems, fetchRecentStamps } from "@/lib/admin-recent";
import {
  RecentRedeemsList,
  RecentStampsList,
} from "@/components/admin-recent-lists";
import { TierBreakdown } from "@/components/admin-tier-breakdown";

// Semplificato rimuovendo la funzione getStats separata per ottimizzare il Promise.all unico
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Eseguiamo TUTTE le query in parallelo in un unico livello di waterfall
  const [
    usersRes, 
    stampsRes, 
    redeemsRes, 
    recentStamps, 
    recentRedeems,
    tierStatsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "visitor"),
    supabase.from("stamps").select("id", { count: "exact", head: true }).eq("redeemed", false),
    supabase.from("redeems").select("id", { count: "exact", head: true }),
    fetchRecentStamps(supabase, { offset: 0, limit: 10 }),
    fetchRecentRedeems(supabase, { offset: 0, limit: 10 }),
    supabase.from("redeems").select("tier_threshold"),
  ]);

  const stats = {
    totalUsers: usersRes.count ?? 0,
    totalStamps: stampsRes.count ?? 0,
    totalRedeems: redeemsRes.count ?? 0,
  };

  // Calcola tier breakdown
  const tierCounts = new Map<number, number>();
  for (const r of tierStatsRes.data ?? []) {
    tierCounts.set(r.tier_threshold, (tierCounts.get(r.tier_threshold) ?? 0) + 1);
  }
  const tierBreakdown = Array.from(tierCounts.entries())
    .map(([tier, count]) => ({ tier, count }))
    .sort((a, b) => a.tier - b.tier);

  // Timbri consumati dai redeem (tier * count)
  const stampsConsumed = tierBreakdown.reduce((sum, t) => sum + t.tier * t.count, 0);
  // Totale timbri elargiti = ancora in possesso + consumati
  const stampsTotal = stats.totalStamps + stampsConsumed;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-foreground/50 uppercase tracking-wider">Admin</p>
        <h1 className="mt-1 text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Statistiche */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 mb-10">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Visitatori registrati"
          value={stats.totalUsers}
          tint="from-violet-500/15 to-fuchsia-500/15 text-violet-700 dark:text-violet-300"
          iconTint="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          icon={<Stamp className="h-5 w-5" />}
          label="Timbri attivi"
          value={stats.totalStamps}
          tint="from-sky-500/15 to-blue-500/15 text-sky-700 dark:text-sky-300"
          iconTint="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Premi riscattati"
          value={stats.totalRedeems}
          tint="from-emerald-500/15 to-teal-500/15 text-emerald-700 dark:text-emerald-300"
          iconTint="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={<Hash className="h-5 w-5" />}
          label="Timbri totali"
          value={stampsTotal}
          tint="from-amber-500/15 to-orange-500/15 text-amber-700 dark:text-amber-300"
          iconTint="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tier List */}
        <div className="rounded-xl border border-foreground/10 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Tier List
            </h2>
          </div>
          <TierBreakdown data={tierBreakdown} total={stats.totalRedeems} />
        </div>

        {/* Ultimi riscatti */}
        <div className="rounded-xl border border-foreground/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Riscossioni
            </h2>
          </div>
          <RecentRedeemsList initial={recentRedeems} />
        </div>

        {/* Ultimi timbri */}
        <div className="rounded-xl border border-foreground/10 bg-gradient-to-br from-sky-500/10 to-blue-500/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
              Ultimi timbri
            </h2>
          </div>
          <RecentStampsList initial={recentStamps} />
        </div>
      </div>
    </section>
  );
}

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
    <div
      className={`rounded-xl border border-foreground/10 bg-gradient-to-br p-5 ${tint}`}
    >
      <div className={`flex items-center gap-2 mb-3 ${iconTint}`}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-4xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
