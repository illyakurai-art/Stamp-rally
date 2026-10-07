import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminStandsList, type StandEntry } from "@/components/admin-stands-list";
import { getEditionDates } from "@/lib/editions";

async function StandsContent() {
  const supabase = await createClient();

  const edition = await getEditionDates(supabase, "current");
  if (!edition.isActive) {
    return (
      <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] px-6 py-12 text-center">
        <p className="text-lg font-semibold text-foreground/70">Nessuna edizione attiva</p>
        <p className="mt-2 text-sm text-foreground/50">
          Imposta il range date dell&apos;edizione corrente in app_config per visualizzare i dati.
        </p>
      </div>
    );
  }

  const { data: artists } = await supabase
    .from("artists")
    .select("id, name, display_id")
    .gte("created_at", edition.start)
    .lte("created_at", edition.end)
    .order("display_id", { ascending: true });

  const displayIds = (artists ?? [])
    .map((a) => a.display_id)
    .filter(Boolean) as string[];

  // Conteggio timbri per artisti filtrati per edizione
  const { data: stampCounts } = displayIds.length > 0
    ? await supabase
        .from("stamps")
        .select("artist_id")
        .in("artist_id", displayIds)
        .gte("stamped_at", edition.start)
        .lte("stamped_at", edition.end)
    : { data: [] as { artist_id: string }[] };

  const stampsByArtist = (stampCounts ?? []).reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.artist_id] = (acc[s.artist_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // Inventario stand solo per artisti di questa edizione
  const { data: inventory } = displayIds.length > 0
    ? await supabase
        .from("stand_inventory")
        .select("artist_id, remaining, total")
        .in("artist_id", displayIds)
    : { data: [] as { artist_id: string; remaining: number; total: number }[] };

  const inventoryByArtist = (inventory ?? []).reduce<Record<string, { remaining: number; total: number }>>(
    (acc, row) => {
      acc[row.artist_id] = { remaining: row.remaining, total: row.total };
      return acc;
    },
    {}
  );

  const stands: StandEntry[] = (artists ?? []).map((a) => {
    const inv = inventoryByArtist[a.display_id ?? ""];
    return {
      id: a.id,
      name: a.name,
      display_id: a.display_id,
      stamps: stampsByArtist[a.display_id ?? ""] ?? 0,
      remaining: inv?.remaining ?? null,
      total: inv?.total ?? null,
    };
  });

  return (
    <>
      <p className="mt-1 text-sm text-foreground/50 mb-8">
        Edizione: <span className="font-medium text-foreground/70">{edition.name}</span>
        {" — "}
        {stands.length} stand disponibil{stands.length === 1 ? "e" : "i"}
      </p>
      <AdminStandsList stands={stands} />
    </>
  );
}

export default function AdminStandsPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-10">
      <div className="mb-2">
        <h1 className="text-3xl font-bold">Stand</h1>
      </div>
      <Suspense fallback={
        <p className="text-sm text-foreground/40 mt-4">Caricamento stand…</p>
      }>
        <StandsContent />
      </Suspense>
    </section>
  );
}
