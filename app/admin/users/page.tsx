import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminUsersList, type UserEntry } from "@/components/admin-users-list";
import { getEffectiveStampCount } from "@/lib/secret-pairs";

async function UsersContent() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, display_id, created_at")
    .eq("role", "visitor")
    .order("nickname", { ascending: true });

  const displayIds = (profiles ?? [])
    .map((u) => u.display_id)
    .filter(Boolean) as string[];

  const { data: stampCounts } = displayIds.length > 0
    ? await supabase
        .rpc("get_stamp_counts_by_users", { p_user_ids: displayIds })
    : { data: [] };

  const stampsByUser = (stampCounts as { user_id: string; count: number }[] ?? []).reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.user_id] = s.count;
      return acc;
    },
    {}
  );

  // Fetch all stamps to get artist names for effective count
  const { data: allStamps } = displayIds.length > 0
    ? await supabase
        .from("stamps")
        .select("user_id, artist_id")
        .in("user_id", displayIds)
    : { data: [] };

  const { data: allArtists } = await supabase
    .from("artists")
    .select("display_id, name");

  const artistNameById = new Map((allArtists ?? []).map((a) => [a.display_id, a.name]));

  // Group stamps by user and calculate effective counts
  const stampsByUserGrouped = new Map<string, string[]>();
  for (const stamp of allStamps ?? []) {
    const names = stampsByUserGrouped.get(stamp.user_id) ?? [];
    const artistName = artistNameById.get(stamp.artist_id);
    if (artistName) names.push(artistName);
    stampsByUserGrouped.set(stamp.user_id, names);
  }

  const users: UserEntry[] = (profiles ?? []).map((u) => {
    const rawCount = stampsByUser[u.display_id ?? ""] ?? 0;
    const scannedNames = stampsByUserGrouped.get(u.display_id ?? "") ?? [];
    return {
      id: u.id,
      nickname: u.nickname,
      display_id: u.display_id,
      created_at: u.created_at,
      stamps: getEffectiveStampCount(rawCount, scannedNames),
    };
  });

  return (
    <>
      <p className="mt-1 text-sm text-foreground/50 mb-8">
        {users.length} visitator{users.length === 1 ? "e" : "i"} registrat{users.length === 1 ? "o" : "i"}
      </p>
      <AdminUsersList users={users} />
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-10">
      <div className="mb-2">
        <h1 className="text-3xl font-bold">Utenti</h1>
      </div>
      <Suspense fallback={
        <p className="text-sm text-foreground/40 mt-4">Caricamento utenti…</p>
      }>
        <UsersContent />
      </Suspense>
    </section>
  );
}
