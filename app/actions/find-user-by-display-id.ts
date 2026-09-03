"use server";

import { createClient } from "@/lib/supabase/server";
import type { UserEntry } from "@/components/admin-users-list";

export async function findUserByDisplayId(displayId: string): Promise<UserEntry | null> {
  const supabase = await createClient();

  // Verifica che chi chiama sia staff
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (callerProfile?.role !== "staff") return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, display_id, created_at")
    .eq("display_id", displayId.trim().toUpperCase())
    .maybeSingle();

  if (!profile) return null;

  const { data: stamps } = await supabase
    .from("stamps")
    .select("id")
    .eq("user_id", profile.display_id ?? profile.id);

  return {
    id: profile.id,
    nickname: profile.nickname,
    display_id: profile.display_id,
    created_at: profile.created_at,
    stamps: stamps?.length ?? 0,
  };
}
