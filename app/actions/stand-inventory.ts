"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface StandInfo {
  artist_id: string;
  name: string;
  display_id: string;
  total: number;
  remaining: number;
}

export interface GatchaResult {
  artist_id: string;
  name: string;
  remaining: number;
}

export async function getAvailableStands(): Promise<StandInfo[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  console.log("[getAvailableStands] user:", user?.id);
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[getAvailableStands] profile:", profile);
  if (profile?.role !== "staff") return [];

  const { data, error } = await supabase.rpc("get_available_stands");
  console.log("[getAvailableStands] rpc result:", data, "error:", error);
  return (data as StandInfo[]) ?? [];
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

  const results = (data as GatchaResult[]) ?? [];

  // Randomizza l'ordine di visualizzazione
  const shuffled = [...results].sort(() => Math.random() - 0.5);
  return shuffled;
}
