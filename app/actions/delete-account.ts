"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteAccount(password: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Utente non autenticato" };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email ?? "",
    password,
  });

  if (signInError) {
    return { error: "Password errata" };
  }

  const { error: deleteError } = await supabase.rpc("delete_user");

  if (deleteError) {
    console.error("delete account error:", deleteError);
    return { error: "Errore durante l'eliminazione dell'account" };
  }

  return { success: true };
}
