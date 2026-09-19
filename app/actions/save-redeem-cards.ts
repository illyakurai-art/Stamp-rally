"use server";

import { createClient } from "@/lib/supabase/server";

export interface RedeemCardEntry {
  artist_id: string;
  source: "extra" | "gatcha";
}

export async function saveRedeemCards(
  userId: string,
  cards: RedeemCardEntry[]
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

  // Trova l'ultimo redeem dell'utente
  const { data: redeem } = await supabase
    .from("redeems")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!redeem) {
    return { success: false, error: "Nessun redeem trovato" };
  }

  const rows = cards.map((c) => ({
    redeem_id: redeem.id,
    artist_id: c.artist_id,
    source: c.source,
  }));

  const { error } = await supabase.from("redeem_cards").insert(rows);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
