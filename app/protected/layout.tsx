import Link from "next/link";
import { UserSettings } from "@/components/user-settings";
import { GameRules } from "@/components/game-rules";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const isStaff = profile?.role === "staff";

  return (
    <main className="min-h-screen flex flex-col items-center">
      <nav className="w-full border-b border-foreground/10">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 text-sm">
          <div className="flex items-center gap-2">
            <GameRules />
          </div>
          {isStaff && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-md border border-[#996C9E]/30 bg-[#996C9E]/10 px-3 py-2 text-sm font-semibold text-[#996C9E] transition-colors hover:bg-[#996C9E]/20"
            >
              Torna ad Admin
            </Link>
          )}
          <UserSettings />
        </div>
      </nav>
      <div className="w-full max-w-5xl flex-1">
        {children}
      </div>
    </main>
  );
}
