"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkNicknameAvailable(nickname: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_nickname_available", {
    p_nickname: nickname.trim(),
  });
  if (error) {
    console.error("nickname check error:", error);
    return false;
  }
  return data as boolean;
}
