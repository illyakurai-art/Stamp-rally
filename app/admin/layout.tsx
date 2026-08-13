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

  const isLogin = (await headers()).get("x-pathname") === "/admin/login";

  // Senza sessione renderizza comunque i children (es. la pagina di login admin)
  if (!user) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "staff") {
    redirect("/admin/login?error=unauthorized");
  }

  if (isLogin) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AdminNav nickname={profile.nickname} />
      <AdminRealtimeRefresh />
      <div className="flex-1 bg-foreground/[0.02]">
        {children}
      </div>
    </main>
  );
}
