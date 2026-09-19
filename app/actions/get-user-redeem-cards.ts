"use server";

import { createClient } from "@/lib/supabase/server";

export interface RedeemCardEntry {
  artist_id: string;
  artist_name: string;
  source: "extra" | "gatcha";
  redeemed_at: string;
}

export async function getUserRedeemCards(
  targetUserId: string
): Promise<RedeemCardEntry[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "staff") return [];

  const { data } = await supabase
    .from("redeem_cards")
    .select("artist_id, source, created_at, redeems!inner(user_id)")
    .eq("redeems.user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) return [];

  const artistIds = [...new Set(data.map((r) => r.artist_id))];
  const { data: artists } = await supabase
    .from("artists")
    .select("display_id, name")
    .in("display_id", artistIds);

  const nameMap = new Map((artists ?? []).map((a) => [a.display_id, a.name]));

  return data.map((r) => ({
    artist_id: r.artist_id,
    artist_name: nameMap.get(r.artist_id) ?? r.artist_id,
    source: r.source as "extra" | "gatcha",
    redeemed_at: r.created_at,
  }));
}
