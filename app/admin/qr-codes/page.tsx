import { createClient } from "@/lib/supabase/server";
import { AdminQrGrid } from "@/components/admin/admin-qr-grid";

interface ArtistQR {
  display_id: string;
  name: string;
  qr_token: string;
  filename: string;
}

function safeFilename(name: string): string {
  return name.replace(/[^\w\-]+/g, "_").replace(/^_+|_+$/g, "") || "artista";
}

export default async function AdminQrPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "staff") return null;

  const { data: artists } = await supabase
    .from("artists")
    .select("display_id, name, qr_token, active")
    .eq("active", true)
    .order("display_id");

  const artistQRs: ArtistQR[] = (artists ?? [])
    .filter((a) => a.qr_token)
    .map((a) => ({
      display_id: a.display_id,
      name: a.name,
      qr_token: a.qr_token!,
      filename: `${a.display_id}_${safeFilename(a.name)}.png`,
    }));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">QR Code Artisti</h1>
        <p className="text-sm text-foreground/50 mt-1">
          {artistQRs.length} artisti attivi — QR generati con profile picture al centro
        </p>
      </div>
      <AdminQrGrid artists={artistQRs} />
    </div>
  );
}
