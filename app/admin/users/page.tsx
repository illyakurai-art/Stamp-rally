import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminUsersList, type UserEntry } from "@/components/admin-users-list";
import { getEffectiveStampCount, SECRET_PAIRS } from "@/lib/secret-pairs";

async function UsersContent() {
  const supabase = await createClient();

  // LIVELLO 1: Recuperiamo profili e artisti in parallelo
  const [profilesRes, artistsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nickname, display_id, created_at")
      .eq("role", "visitor")
      .order("nickname", { ascending: true }),
    supabase
      .from("artists")
      .select("display_id, name")
  ]);

  const profiles = profilesRes.data ?? [];
  const allArtists = artistsRes.data ?? [];

  const displayIds = profiles
    .map((u) => u.display_id)
    .filter(Boolean) as string[];

  // LIVELLO 2: Recuperiamo i timbri e i conteggi rpc in parallelo (solo se ci sono utenti)
  const [stampCountsRes, allStampsRes] = displayIds.length > 0
    ? await Promise.all([
        supabase.rpc("get_stamp_counts_by_users", { p_user_ids: displayIds }),
        supabase.from("stamps").select("user_id, artist_id").in("user_id", displayIds).eq("redeemed", false)
      ])
    : [{ data: [] }, { data: [] }];

  const stampCounts = stampCountsRes.data as { user_id: string; count: number }[] ?? [];
  const allStamps = allStampsRes.data ?? [];

  // Mappatura rapida degli artisti
  const artistNameById = new Map(allArtists.map((a) => [a.display_id, a.name]));

  // Raggruppamento dei timbri per utente
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

  // Costruzione della lista utenti finale
  const users: UserEntry[] = profiles.map((u) => {
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
