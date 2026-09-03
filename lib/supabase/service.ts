import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client con service role key — bypassa RLS.
 * Usare SOLO per operazioni server-side che richiedono privilegi elevati
 * (es. login con IP forwarding per rate limiting).
 * MAI esporre al client browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY non configurata");
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
