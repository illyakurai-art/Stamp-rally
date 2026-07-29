"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminRealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Ascolta qualsiasi nuovo timbro inserito da qualsiasi utente
    const stampsChannel = supabase
      .channel("admin-stamps-watch")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "stamps" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "stamps" },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stampsChannel);
    };
  }, [router]);

  return null;
}
