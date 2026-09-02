import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminStandsList, type StandEntry } from "@/components/admin-stands-list";

async function StandsContent() {
  const supabase = await createClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("id, name, display_id")
    .order("display_id", { ascending: true });

  const displayIds = (artists ?? [])
    .map((a) => a.display_id)
    .filter(Boolean) as string[];

  const { data: stampCounts } = displayIds.length > 0
    ? await supabase
        .rpc("get_stamp_counts_by_artists", { p_artist_ids: displayIds })
    : { data: [] };

  const stampsByArtist = (stampCounts as { artist_id: string; count: number }[] ?? []).reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.artist_id] = s.count;
      return acc;
    },
    {}
  );

  const stands: StandEntry[] = (artists ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    display_id: a.display_id,
    stamps: stampsByArtist[a.display_id ?? ""] ?? 0,
  }));

  return (
    <>
      <p className="mt-1 text-sm text-foreground/50 mb-8">
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
