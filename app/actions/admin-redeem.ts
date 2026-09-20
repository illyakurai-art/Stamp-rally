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
    .eq("redeemed", false)
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
    .select("tier_threshold, gacha_included, extra_choice, is_full_collection")
    .lte("tier_threshold", stampCount)
    .order("tier_threshold", { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log("[adminRedeem] tier:", tier, "error:", tierError?.message);
  if (!tier) {
    return { success: false, error: "Timbri insufficienti per qualsiasi fascia premio" };
  }

  // Timbri da rimuovere (FIFO) con gestione K&K
  const { SECRET_PAIRS } = await import("@/lib/secret-pairs");
  const stampsToRemove: string[] = [];
  const kkPairsToRemove: string[][] = [];
  let count = 0;
  const targetCount = tier.tier_threshold;

  for (const stamp of stamps ?? []) {
    if (count >= targetCount) break;
    if (stampsToRemove.includes(stamp.id)) continue;

    const artistName = artistNameById.get(stamp.artist_id);
    stampsToRemove.push(stamp.id);
    count++;

    // Controlla se questo artista fa parte di una coppia K&K
    for (const pair of SECRET_PAIRS) {
      const isMember = pair.members.some(
        (m) => m.toLowerCase() === artistName?.toLowerCase()
      );
      if (isMember) {
        // Trova l'altro membro della coppia
        const otherMember = pair.members.find(
          (m) => m.toLowerCase() !== artistName?.toLowerCase()
        );
        if (otherMember) {
          // Trova il timbro dell'altro membro (non ancora incluso)
          const otherStamp = (stamps ?? []).find((s) => {
            if (stampsToRemove.includes(s.id)) return false;
            const otherName = artistNameById.get(s.artist_id);
            return otherName?.toLowerCase() === otherMember.toLowerCase();
          });
          if (otherStamp) {
            stampsToRemove.push(otherStamp.id);
            kkPairsToRemove.push([stamp.id, otherStamp.id]);
          }
        }
        break;
      }
    }
  }

  // Se ci sono timbri K&K in piu', dobbiamo assicurarci che la RLS li permetta
  // Il conteggio effettivo e' stampsToRemove.length - kkPairsToRemove.length
  // (perche' ogni coppia K&K conta come 1 timbro effettivo)
  const effectiveCount = stampsToRemove.length - kkPairsToRemove.length;
  console.log("[adminRedeem] toRemove:", stampsToRemove.length, "effective:", effectiveCount, "kkPairs:", kkPairsToRemove.length);

  if (stampsToRemove.length === 0) {
    return { success: false, error: "Nessun timbro da rimuovere" };
  }

  // Marca timbri come riscattati (UPDATE invece di DELETE per preservare lo storico)
  let updateResult = await supabase
    .from("stamps")
    .update({ redeemed: true }, { count: "exact" })
    .in("id", stampsToRemove);

  let updatedCount = updateResult.count;
  let updateError = updateResult.error;

  // Se fallisce e ci sono coppie K&K, prova a marcare solo i timbri base
  if (updateError && kkPairsToRemove.length > 0) {
    console.log("[adminRedeem] RLS bloccato con K&K, tentativo senza extra K&K");
    const baseStamps = stampsToRemove.filter(
      (id) => !kkPairsToRemove.some((pair) => pair[1] === id)
    );
    updateResult = await supabase
      .from("stamps")
      .update({ redeemed: true }, { count: "exact" })
      .in("id", baseStamps);
    updatedCount = updateResult.count;
    updateError = updateResult.error;
  }

  console.log("[adminRedeem] updated:", updatedCount, "error:", updateError?.message);

  if (updateError) {
    return { success: false, error: `Errore aggiornamento timbri: ${updateError.message}` };
  }

  if (updatedCount === null || updatedCount === 0) {
    return { success: false, error: "Nessun timbro marcato come riscattato" };
  }

  // Calcola i timbri rimanenti (K&K conta come 1)
  const effectiveRemoved = updatedCount - kkPairsToRemove.length;
  const remainingAfter = stampCount - effectiveRemoved;

  // Full Collection: riduci tutte le card rimanenti di 1
  if (tier.is_full_collection) {
    console.log("[adminRedeem] Full Collection: riduco inventory di 1 per ogni stand");
    const { error: inventoryError } = await supabase.rpc("decrement_all_inventory");
    if (inventoryError) {
      console.error("[adminRedeem] inventory decrement error:", inventoryError.message);
    }
  }

  // Insert redeem via RPC security definer
  const { error: redeemError } = await supabase.rpc("insert_redeem", {
    p_user_id: targetProfile.id,
    p_tier_threshold: tier.tier_threshold,
    p_stamps_removed_count: effectiveRemoved,
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
      stamps_removed: effectiveRemoved,
      stamps_remaining: remainingAfter,
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
    stamps_removed: effectiveRemoved,
    stamps_remaining: remainingAfter,
    nickname: targetProfile.nickname,
  };
}

export async function getUserStamps(userId: string) {
  const supabase = await createClient();

  // Verifica che chi chiama sia staff
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (callerProfile?.role !== "staff") return null;

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
    .eq("redeemed", false)
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
