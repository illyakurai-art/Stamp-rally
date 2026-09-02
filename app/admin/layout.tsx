export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin-nav";
import { AdminRealtimeRefresh } from "@/components/admin-realtime-refresh";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  // Estrae il ruolo dagli app_metadata (gestito dal nostro hook)
  const jwtRole = (user as any).app_metadata?.role ?? null;
  
  // Estrae il nome dell'utente dai metadati del JWT (evita query al DB se disponibile)
  const metaName = user.user_metadata?.nickname ?? user.user_metadata?.full_name ?? "Admin/Staff";

  let nickname = metaName;
  let hasAccess = jwtRole === "admin" || jwtRole === "staff";

  // Se il ruolo non è presente nel JWT (es. prima del refresh del token), interroga il DB
  if (!jwtRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin" && profile?.role !== "staff") {
      redirect("/admin/login?error=unauthorized");
    }
    nickname = profile?.nickname ?? metaName;
  } else {
    // Se il ruolo nel JWT non è autorizzato, blocca l'accesso
    if (!hasAccess) {
      redirect("/admin/login?error=unauthorized");
    }
    
    // Se il nickname non era nei metadati del JWT, facciamo una query leggera di fallback
    if (nickname === "Admin/Staff") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .maybeSingle();
      nickname = profile?.nickname ?? "Admin/Staff";
    }
  }

  const pathname = (await headers()).get("x-pathname") ?? "";
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AdminNav nickname={nickname} />
      <AdminRealtimeRefresh />
      <div className="flex-1 bg-foreground/[0.02]">
        {children}
      </div>
    </main>
  );
}
