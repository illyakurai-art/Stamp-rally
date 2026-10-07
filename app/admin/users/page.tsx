import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminUsersList, type UserEntry } from "@/components/admin-users-list";
import { getEffectiveStampCount, SECRET_PAIRS } from "@/lib/secret-pairs";
import { getEditionDates } from "@/lib/editions";

async function UsersContent() {
  const supabase = await createClient();

  const edition = await getEditionDates(supabase, "current");
  if (!edition.isActive) {
    return (
      <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] px-6 py-12 text-center">
        <p className="text-lg font-semibold text-foreground/70">Nessuna edizione attiva</p>
        <p className="mt-2 text-sm text-foreground/50">
          Imposta il range date dell&apos;edizione corrente in app_config per visualizzare i dati.
        </p>
      </div>
    );
  }

  // Recuperiamo profili e artisti in parallelo
  const [profilesRes, artistsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nickname, display_id, created_at")
      .eq("role", "visitor")
      .order("nickname", { ascending: true }),
    supabase
      .from("artists")
      .select("display_id, name")
      .gte("created_at", edition.start)
      .lte("created_at", edition.end),
  ]);

  const profiles = profilesRes.data ?? [];
  const allArtists = artistsRes.data ?? [];

  const displayIds = profiles
    .map((u) => u.display_id)
    .filter(Boolean) as string[];

  // Timbri filtrati per edizione corrente
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

  // Conteggio timbri per utente
  const artistNameById = new Map(allArtists.map((a) => [a.display_id, a.name]));

  const stampsByUserGrouped = new Map<string, string[]>();
  for (const stamp of stamps) {
    const names = stampsByUserGrouped.get(stamp.user_id) ?? [];
    const artistName = artistNameById.get(stamp.artist_id);
    if (artistName) names.push(artistName);
    stampsByUserGrouped.set(stamp.user_id, names);
  }

  const users: UserEntry[] = profiles.map((u) => {
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

  return (
    <>
      <p className="mt-1 text-sm text-foreground/50 mb-8">
        Edizione: <span className="font-medium text-foreground/70">{edition.name}</span>
        {" — "}
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
