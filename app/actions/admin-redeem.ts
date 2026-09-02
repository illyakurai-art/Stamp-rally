"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getEffectiveStampCount } from "@/lib/secret-pairs";

export interface RedeemResult {
  success: boolean;
  error?: string;
  tier_threshold?: number;
  gacha_included?: number;
  extra_choice?: number;
  is_full_collection?: boolean;
  stamps_removed?: number;
  stamps_remaining?: number;
  nickname?: string;
}

export async function adminRedeem(userId: string): Promise<RedeemResult> {
  const supabase = await createClient();

  // Verifica che chi chiama sia staff
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non autenticato" };
  console.log("[adminRedeem] staff user id:", user.id);

  const { data: staffProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[adminRedeem] staff role:", staffProfile?.role);
  if (staffProfile?.role !== "staff") {
    return { success: false, error: "Permesso negato" };
  }

  // Recupera profilo utente target
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, nickname, display_id")
    .eq("id", userId)
    .maybeSingle();

  console.log("[adminRedeem] target profile:", targetProfile);
  if (!targetProfile) return { success: false, error: "Utente non trovato" };

  // Timbri attuali
  const { data: stamps, error: stampsError } = await supabase
    .from("stamps")
    .select("id, stamped_at, artist_id")
    .eq("user_id", targetProfile.display_id ?? targetProfile.id)
    .order("stamped_at", { ascending: true });

  console.log("[adminRedeem] stamps fetched:", stamps?.length, "error:", stampsError?.message);

  // Get artist names for effective count calculation
  const artistIds = (stamps ?? []).map((s) => s.artist_id);
  const { data: stampArtists } = await supabase
    .from("artists")
    .select("display_id, name")
    .in("display_id", artistIds);

  const artistNameById = new Map((stampArtists ?? []).map((a) => [a.display_id, a.name]));
  const scannedNames = artistIds
    .map((id) => artistNameById.get(id))
    .filter((n): n is string => !!n);

  const rawCount = stamps?.length ?? 0;
  const stampCount = getEffectiveStampCount(rawCount, scannedNames);

  // Fascia premio massima
  const { data: tier, error: tierError } = await supabase
    .from("prizes")
    .select("*")
    .lte("tier_threshold", stampCount)
    .order("tier_threshold", { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log("[adminRedeem] tier:", tier, "error:", tierError?.message);
  if (!tier) {
    return { success: false, error: "Timbri insufficienti per qualsiasi fascia premio" };
  }

  // Timbri da rimuovere (FIFO)
  const toRemove = (stamps ?? []).slice(0, tier.tier_threshold).map((s) => s.id);
  console.log("[adminRedeem] toRemove count:", toRemove.length);

  if (toRemove.length === 0) {
    return { success: false, error: "Nessun timbro da rimuovere" };
  }

  // Delete timbri
  const { error: deleteError, count: deletedCount } = await supabase
    .from("stamps")
    .delete({ count: "exact" })
    .in("id", toRemove);

  console.log("[adminRedeem] deleted:", deletedCount, "error:", deleteError?.message);

  if (deleteError) {
    return { success: false, error: `Errore eliminazione timbri: ${deleteError.message}` };
  }

  if (deletedCount !== null && deletedCount < toRemove.length) {
    return {
      success: false,
      error: `RLS bloccato: rimossi ${deletedCount}/${toRemove.length}. Esegui fix_stamps_delete_rls.sql.`,
    };
  }

  // Insert redeem via RPC security definer
  const { error: redeemError } = await supabase.rpc("insert_redeem", {
    p_user_id: targetProfile.id,
    p_tier_threshold: tier.tier_threshold,
    p_stamps_removed_count: tier.tier_threshold,
    p_confirmed_by: user.id,
  });
  console.log("[adminRedeem] insert_redeem error:", redeemError?.message ?? "none");

  // Notifica
  const { error: notifError } = await supabase.from("notifications").insert({
    user_id: targetProfile.id,
    type: "redeem",
    payload: {
      tier_threshold: tier.tier_threshold,
      gacha_included: tier.gacha_included,
      extra_choice: tier.extra_choice,
      is_full_collection: tier.is_full_collection,
      stamps_removed: tier.tier_threshold,
      stamps_remaining: stampCount - tier.tier_threshold,
    },
  });
  console.log("[adminRedeem] notification error:", notifError?.message ?? "none");

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/protected");

  return {
    success: true,
    tier_threshold: tier.tier_threshold,
    gacha_included: tier.gacha_included,
    extra_choice: tier.extra_choice,
    is_full_collection: tier.is_full_collection,
    stamps_removed: tier.tier_threshold,
    stamps_remaining: stampCount - tier.tier_threshold,
    nickname: targetProfile.nickname,
  };
}

export async function getUserStamps(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, display_id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return null;

  const { data: stamps } = await supabase
    .from("stamps")
    .select("id, stamped_at, artist_id")
    .eq("user_id", profile.display_id ?? profile.id)
    .order("stamped_at", { ascending: true });

  // Risolvi i nomi degli artisti
  const artistIds = [...new Set((stamps ?? []).map((s) => s.artist_id))];
  const { data: artists } = artistIds.length > 0
    ? await supabase
        .from("artists")
        .select("id, display_id, name")
        .in("display_id", artistIds)
    : { data: [] };

  const artistMap = new Map<string, string>();
  for (const a of artists ?? []) {
    if (a.display_id) artistMap.set(a.display_id, a.name);
    if (a.id) artistMap.set(a.id, a.name);
  }

  return {
    nickname: profile.nickname,
    stamps: (stamps ?? []).map((s) => ({
      id: s.id,
      stamped_at: s.stamped_at,
      artist_name: artistMap.get(s.artist_id) ?? s.artist_id,
    })),
  };
}
