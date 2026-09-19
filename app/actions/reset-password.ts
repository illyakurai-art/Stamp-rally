"use server";

import { createClient } from "@supabase/supabase-js";

const DEFAULT_PASSWORD = "Asunicha2025!";

export async function resetUserPassword(
  targetUserId: string
): Promise<{ success: boolean; password?: string; error?: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non autenticato" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "staff") {
    return { success: false, error: "Permesso negato" };
  }

  const { error } = await supabase.auth.admin.updateUserById(targetUserId, {
    password: DEFAULT_PASSWORD,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, password: DEFAULT_PASSWORD };
}
