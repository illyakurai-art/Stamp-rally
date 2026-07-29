"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  userDisplayId: string | null;
}

export function StampRealtimeRefresh({ userId, userDisplayId }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Ascolta nuovi timbri per questo utente (sia per UUID che display_id)
    const channel = supabase
      .channel(`stamps-refresh-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stamps",
          // Filtra per display_id se disponibile, altrimenti UUID
          filter: userDisplayId
            ? `user_id=eq.${userDisplayId}`
            : `user_id=eq.${userId}`,
        },
        () => {
          // Nuovo timbro inserito — aggiorna la pagina
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userDisplayId, router]);

  return null;
}
