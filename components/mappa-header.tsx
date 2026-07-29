"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function MappaHeader() {
  const { t } = useI18n();
  return (
    <>
      <Link href="/protected" className="text-sm font-medium text-foreground/70">
        ← {t("back_to_my_area")}
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mt-4">{t("map")}</h1>
      <p className="mt-1 text-base text-foreground/70">
        Scopri gli stand e i timbri che hai raccolto.
      </p>
    </>
  );
}
