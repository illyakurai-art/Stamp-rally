import { createClient } from "@/lib/supabase/server";
import { AdminQrGrid } from "@/components/admin/admin-qr-grid";
import { getEditionDates } from "@/lib/editions";

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

  const edition = await getEditionDates(supabase, "current");

  if (!edition.isActive) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">QR Code Artisti</h1>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-foreground/70">Nessuna edizione attiva</p>
          <p className="mt-2 text-sm text-foreground/50">
            Imposta il range date dell&apos;edizione corrente in app_config per visualizzare i QR.
          </p>
        </div>
      </div>
    );
  }

  const { data: artists } = await supabase
    .from("artists")
    .select("display_id, name, qr_token, active")
    .gte("created_at", edition.start)
    .lte("created_at", edition.end)
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
          Edizione: <span className="font-medium text-foreground/70">{edition.name}</span>
          {" — "}
          {artistQRs.length} artisti — QR generati con profile picture al centro
        </p>
      </div>
      <AdminQrGrid artists={artistQRs} />
    </div>
  );
}
