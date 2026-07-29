import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArtistMap } from "@/components/artist-map";

export async function MappaContent() {
  noStore();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("display_id")
    .eq("id", user.id)
    .maybeSingle();

  const userDisplayId = userProfile?.display_id;

  const userIdsToMatch = [user.id];
  if (userDisplayId) {
    userIdsToMatch.push(userDisplayId);
  }

  const [artistsResult, stampsResult] = await Promise.all([
    supabase
      .from("artists")
      .select("id, name, qr_token, image_url, map_x, map_y, display_id")
      .eq("active", true),
    supabase
      .from("stamps")
      .select("artist_id")
      .in("user_id", userIdsToMatch),
  ]);

  const artists = artistsResult.data ?? [];
  const scannedIdentifiers = new Set(
    stampsResult.data?.map((s) => s.artist_id) ?? []
  );

  console.log("[mappa] userIdsToMatch:", userIdsToMatch);
  console.log("[mappa] stamps found:", stampsResult.data?.length, stampsResult.data);
  console.log("[mappa] scannedIdentifiers:", [...scannedIdentifiers]);

  const artistsWithStatus = artists.map((a) => ({
    ...a,
    scanned:
      scannedIdentifiers.has(a.id) ||
      (a.display_id ? scannedIdentifiers.has(a.display_id) : false),
  }));

  return <ArtistMap artists={artistsWithStatus} />;
}
