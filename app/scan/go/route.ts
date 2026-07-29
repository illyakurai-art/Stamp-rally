import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
    .select("id, name, display_id, qr_token")
    .eq("qr_token", token)
    .eq("active", true)
    .maybeSingle();

  let artist = artistExact;

  // Fallback: cerca per nome se il qr_token non corrisponde
  if (!artist) {
    const searchName = token.toLowerCase().replace("-stamp", "").replace("stamp-", "");
    const { data: artistsByName } = await supabase
      .from("artists")
      .select("id, name, display_id, qr_token")
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

  const redirectUrl = new URL("/scan/result", base);
  if (artist.name) {
    redirectUrl.searchParams.set("artist", artist.name);
  }

  return NextResponse.redirect(redirectUrl);
}
