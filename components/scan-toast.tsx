"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/context";

export function ScanToast() {
  const { t } = useI18n();
  const params = useSearchParams();
  const router = useRouter();
  const shownRef = useRef(false);
  const refreshedRef = useRef(false);

  const scan = params.get("scan");
  const artist = params.get("artist");
  const refresh = params.get("refresh");

  // Gestisce ?refresh=1 — arriva dalla pagina /scan/result su mobile
  useEffect(() => {
    if (refresh !== "1" || refreshedRef.current) return;
    refreshedRef.current = true;
    router.refresh();
    router.replace("/protected", { scroll: false });
  }, [refresh, router]);

  useEffect(() => {
    if (scan !== "success" || shownRef.current) return;

    shownRef.current = true;

    if (artist) {
      toast.success(`${t("scanned_stand_of")} ${artist}`);
    } else {
      toast.success(t("stamp_added_success"));
    }

    const next = new URLSearchParams(params.toString());
    next.delete("scan");
    next.delete("artist");

    const query = next.toString();
    router.replace(query ? `/protected?${query}` : "/protected", {
      scroll: false,
    });
  }, [scan, artist, params, router]);

  return null;
}