import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { artist_ids } = await request.json();

  if (!Array.isArray(artist_ids) || artist_ids.length === 0) {
    return NextResponse.json({ error: "artist_ids required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "staff") {
    return NextResponse.json({ error: "Permesso negato" }, { status: 403 });
  }

  const { error } = await supabase.rpc("restore_stand_cards", {
    p_artist_ids: artist_ids,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
