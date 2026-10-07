type Supabase = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>;

export interface RecentStamp {
  id: string;
  stamped_at: string;
  user_id: string;
  artist_id: string;
  userLabel: string;
  artistLabel: string;
}

export interface RecentRedeem {
  id: string;
  created_at: string;
  user_id: string;
  confirmed_by: string | null;
  tier_threshold: number;
  stamps_removed_count: number;
  userLabel: string;
  staffLabel: string;
}

export async function fetchRecentStamps(
  supabase: Supabase,
  { offset, limit, dateStart, dateEnd }: { offset: number; limit: number; dateStart?: string; dateEnd?: string }
): Promise<RecentStamp[]> {
  let query = supabase
    .from("stamps")
    .select("id, stamped_at, user_id, artist_id")
    .eq("redeemed", false)
    .order("stamped_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (dateStart && dateEnd) {
    query = query.gte("stamped_at", dateStart).lte("stamped_at", dateEnd);
  }
  const { data: rawStamps } = await query;

  if (!rawStamps || rawStamps.length === 0) return [];

  const userIds = [...new Set(rawStamps.map((s) => s.user_id))];
  const artistIds = [...new Set(rawStamps.map((s) => s.artist_id))];

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

  return rawStamps.map((s) => ({
    ...s,
    userLabel: profileMap.get(s.user_id) ?? s.user_id,
    artistLabel: artistMap.get(s.artist_id) ?? s.artist_id,
  }));
}

export async function fetchRecentRedeems(
  supabase: Supabase,
  { offset, limit, dateStart, dateEnd }: { offset: number; limit: number; dateStart?: string; dateEnd?: string }
): Promise<RecentRedeem[]> {
  let query = supabase
    .from("redeems")
    .select("id, created_at, user_id, confirmed_by, tier_threshold, stamps_removed_count")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (dateStart && dateEnd) {
    query = query.gte("created_at", dateStart).lte("created_at", dateEnd);
  }
  const { data: rawRedeems } = await query;

  if (!rawRedeems || rawRedeems.length === 0) return [];

  const redeemAllIds = [
    ...new Set([
      ...rawRedeems.map((r) => r.user_id),
      ...rawRedeems.map((r) => r.confirmed_by ?? ""),
    ]),
  ].filter(Boolean);

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

  return rawRedeems.map((r) => ({
    ...r,
    userLabel: redeemProfileMap.get(r.user_id) ?? r.user_id,
    staffLabel: redeemProfileMap.get(r.confirmed_by ?? "") ?? r.confirmed_by ?? "—",
  }));
}