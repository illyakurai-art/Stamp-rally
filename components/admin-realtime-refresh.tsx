"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminRealtimeRefresh() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const debouncedRefresh = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => router.refresh(), 3000);
  };

  useEffect(() => {
    const supabase = createClient();

    const stampsChannel = supabase
      .channel("admin-stamps-watch")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "stamps" },
        debouncedRefresh
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "stamps" },
        debouncedRefresh
      )
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(stampsChannel);
    };
  }, [router]);

  return null;
}
