"use client";

import Link from "next/link";
import { QrScanner } from "@/components/qr-scanner";
import { useI18n } from "@/lib/i18n/context";

export default function ScanPage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <Link
          href="/protected"
          className="text-sm font-medium text-foreground/70"
        >
          ← {t("back_to_my_area")}
        </Link>

        <header className="space-y-2">
          <p className="text-sm font-medium text-foreground/60">{t("scan_stand")}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("scan_in_progress")}
          </h1>
          <p className="text-base text-foreground/70">
            {t("scan_instruction")}
          </p>
        </header>

        <QrScanner />
      </div>
    </main>
  );
}
