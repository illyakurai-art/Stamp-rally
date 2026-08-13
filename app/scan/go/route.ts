import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SECRET_PAIRS } from "@/lib/secret-pairs";

function getBaseUrl(request: NextRequest): string {
  // Usa sempre l'host reale dalla request per evitare che Next.js normalizzi a localhost
  const host = request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  const base = getBaseUrl(request);

  if (!token) {
    return NextResponse.redirect(new URL("/scan/error?reason=missing-token", base));
  }

  const supabase = await createClient();

  // 1. Verifica utente autenticato
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/auth/login", base);
    loginUrl.searchParams.set("redirectTo", `/scan/go?token=${encodeURIComponent(token)}`);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Cerca l'artista per qr_token esatto
  const { data: artistExact } = await supabase
    .from("artists")
    .select("id, name, display_id, qr_token, image_url")
    .eq("qr_token", token)
    .eq("active", true)
    .maybeSingle();

  let artist = artistExact;

  // Fallback: cerca per nome se il qr_token non corrisponde
  if (!artist) {
    const searchName = token.toLowerCase().replace("-stamp", "").replace("stamp-", "");
    const { data: artistsByName } = await supabase
      .from("artists")
      .select("id, name, display_id, qr_token, image_url")
      .eq("active", true)
      .ilike("name", `%${searchName}%`);
    artist = artistsByName?.[0] ?? null;
  }

  if (!artist) {
    return NextResponse.redirect(
      new URL(`/scan/error?reason=${encodeURIComponent("Stand o artista non trovato")}`, base)
    );
  }

  // 3. Inserisci timbro via RPC (SECURITY DEFINER, bypassa RLS)
  const { error: rpcError } = await supabase.rpc("add_stamp", {
    p_artist_qr_token: artist.qr_token || token,
  });

  if (rpcError) {
    return NextResponse.redirect(
      new URL(`/scan/error?reason=${encodeURIComponent(rpcError.message)}`, base)
    );
  }

  revalidatePath("/protected");
  revalidatePath("/mappa");

  // Notifica realtime all'utente per aggiornare il conteggio su tutti i device
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "stamp",
    payload: {
      artist_name: artist.name ?? null,
    },
  });

  // Obiettivo segreto: completa una coppia → notifica "kk_unlock" (una sola volta)
  await checkAndUnlockSecret(user.id);

  const redirectUrl = new URL("/scan/result", base);
  if (artist.name) {
    redirectUrl.searchParams.set("artist", artist.name);
  }
  if (artist.image_url) {
    redirectUrl.searchParams.set("image", artist.image_url);
  }

  return NextResponse.redirect(redirectUrl);
}

// Controlla se l'utente ha appena completato una coppia segreta.
// Se sì e non è già stato notificato, inserisce una notifica "kk_unlock".
async function checkAndUnlockSecret(userId: string) {
  const supabase = await createClient();

  // Display id dell'utente (i timbri sono salvati con il display_id)
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_id")
    .eq("id", userId)
    .maybeSingle();

  const userDisplayId = profile?.display_id;
  if (!userDisplayId) return;

  for (const pair of SECRET_PAIRS) {
    const { data: artists } = await supabase
      .from("artists")
      .select("display_id")
      .in("name", pair.members);

    const artistIds = (artists ?? []).map((a) => a.display_id).filter((x): x is string => !!x);
    if (artistIds.length !== pair.members.length) continue;

    const { count } = await supabase
      .from("stamps")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userDisplayId)
      .in("artist_id", artistIds);

    if (count !== artistIds.length) continue;

    // Già notificato? Salta.
    const { count: existing } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "kk_unlock");

    if (existing && existing > 0) continue;

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "kk_unlock",
      payload: { label: pair.label },
    });
  }
}
