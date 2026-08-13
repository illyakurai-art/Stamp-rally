import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Users, Stamp, Trophy, Activity, type LucideIcon } from "lucide-react";
import { fetchRecentRedeems, fetchRecentStamps } from "@/lib/admin-recent";
import {
  RecentRedeemsList,
  RecentStampsList,
} from "@/components/admin-recent-lists";

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

  const [recentStamps, recentRedeems] = await Promise.all([
    fetchRecentStamps(supabase, { offset: 0, limit: 10 }),
    fetchRecentRedeems(supabase, { offset: 0, limit: 10 }),
  ]);

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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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

        {/* Ultimi riscatti */}
        <div className="rounded-xl border border-foreground/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Ultimi riscatti
            </h2>
          </div>
          <RecentRedeemsList initial={recentRedeems} />
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
