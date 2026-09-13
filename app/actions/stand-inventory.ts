"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface StandInfo {
  artist_id: string;
  name: string;
  display_id: string;
  total: number;
  remaining: number;
  prize_image_url?: string | null;
}

export interface GatchaResult {
  artist_id: string;
  name: string;
  remaining: number;
  prize_image_url?: string | null;
}

export async function getAvailableStands(): Promise<StandInfo[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "staff") return [];

  const { data, error } = await supabase.rpc("get_available_stands");
  if (error) {
    console.error("[getAvailableStands] rpc error:", error.message);
    return [];
  }

  const stands = (data as { artist_id: string; name: string; display_id: string; total: number; remaining: number }[]) ?? [];

  return stands.map((s) => ({
    ...s,
    prize_image_url: `https://qoniejhhzixwzgtzlngo.supabase.co/storage/v1/render/image/public/artists-cards/Premi%20artisti/${s.artist_id}.webp?width=150&height=220`,
  }));
}

export async function redeemStandCards(
  artistIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non autenticato" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "staff") {
    return { success: false, error: "Permesso negato" };
  }

  const counts = artistIds.map(() => 1);
  const { error } = await supabase.rpc("redeem_stand_cards", {
    p_artist_ids: artistIds,
    p_counts: counts,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function restoreStandCards(
  artistIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non autenticato" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "staff") {
    return { success: false, error: "Permesso negato" };
  }

  const { error } = await supabase.rpc("restore_stand_cards", {
    p_artist_ids: artistIds,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function drawGatchaPrizes(
  count: number
): Promise<GatchaResult[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "staff") return [];

  const { data } = await supabase.rpc("draw_gatcha_prizes", {
    p_count: count,
  });

  const rpcResults = (data as { artist_id: string; name: string; remaining: number }[]) ?? [];

  // Fetch prize images for each artist
  const artistIds = rpcResults.map((r) => r.artist_id);
  const { data: artists } = await supabase
    .from("artists")
    .select("display_id, prize_image_url")
    .in("display_id", artistIds);

  const imageMap = new Map(
    (artists ?? []).map((a) => [a.display_id, a.prize_image_url])
  );

  const results: GatchaResult[] = rpcResults.map((r) => ({
    ...r,
    prize_image_url: imageMap.get(r.artist_id) ?? null,
  }));

  // Randomizza l'ordine di visualizzazione
  const shuffled = [...results].sort(() => Math.random() - 0.5);
  return shuffled;
}
