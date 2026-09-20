"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Trophy } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

function ScanErrorContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? t("scan_error_unknown");

  const isRateLimit = reason.toLowerCase().includes("attendi");
  const isAlreadyScanned = reason.toLowerCase().includes("già timbrato");
  const isRallyTerminated = reason.toLowerCase().includes("terminata");
  const autoClose = (isRateLimit || isAlreadyScanned) && !isRallyTerminated;

  const [countdown, setCountdown] = useState(3);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!autoClose) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          if (!doneRef.current) {
            doneRef.current = true;
            try { window.close(); } catch {}
            setTimeout(() => { window.location.href = "/protected"; }, 500);
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 flex items-center justify-center">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 text-center">

        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${isRallyTerminated ? "bg-amber-500/10" : "bg-red-500/10"}`}>
          {isRallyTerminated ? (
            <Trophy className="h-10 w-10 text-amber-500" />
          ) : (
            <AlertCircle className="h-10 w-10 text-red-500" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {isRallyTerminated
              ? t("rally_terminated")
              : isRateLimit || isAlreadyScanned
                ? t("stamp_too_hot")
                : t("stamp_not_registered")}
          </h1>
          <p className="text-sm text-foreground/60">
            {isRallyTerminated
              ? t("rally_terminated_desc")
              : isRateLimit || isAlreadyScanned
                ? t("stamp_hot_desc")
                : t("scan_failed")}
          </p>
        </div>

        {!isRateLimit && !isAlreadyScanned && !isRallyTerminated && (
          <div className="w-full rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {reason}
          </div>
        )}

        {autoClose && countdown > 0 && (
          <p className="text-xs text-foreground/40">
            {t("auto_close_in")} {countdown}…
          </p>
        )}

        <div className="flex w-full flex-col gap-3">
          {!isRateLimit && !isAlreadyScanned && !isRallyTerminated && (
            <Link
              href="/scan"
              className="min-h-12 rounded-xl bg-foreground px-4 py-3 text-center text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              {t("retry_scan")}
            </Link>
          )}
          <Link
            href="/protected"
            className="flex items-center justify-center gap-2 min-h-12 rounded-xl border border-foreground/15 px-4 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back_to_my_area")}
          </Link>
        </div>

      </div>
    </main>
  );
}

function ScanErrorFallback() {
  const { t } = useI18n();
  return <div className="min-h-screen flex items-center justify-center text-foreground/50">{t("loading")}</div>;
}

export default function ScanErrorPage() {
  return (
    <Suspense fallback={<ScanErrorFallback />}>
      <ScanErrorContent />
    </Suspense>
  );
}
