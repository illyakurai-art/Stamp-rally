import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchRecentRedeems, fetchRecentStamps } from "@/lib/admin-recent";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? "0");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "10");

  if (type !== "stamps" && type !== "redeems") {
    return NextResponse.json({ error: "Tipo non valido" }, { status: 400 });
  }
  if (!Number.isFinite(offset) || offset < 0 || !Number.isFinite(limit) || limit < 1 || limit > 50) {
    return NextResponse.json({ error: "Parametri non validi" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "staff") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const data =
    type === "stamps"
      ? await fetchRecentStamps(supabase, { offset, limit })
      : await fetchRecentRedeems(supabase, { offset, limit });

  return NextResponse.json({ data, hasMore: data.length === limit });
}