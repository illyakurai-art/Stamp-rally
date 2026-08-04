"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  artist: string | null;
  error: string | null;
}

export function ScanResultClient({ artist, error }: Props) {
  const { t } = useI18n();
  const [countdown, setCountdown] = useState(3);
  const [closed, setClosed] = useState(false);
  const doneRef = useRef(false); // evita doppia esecuzione in StrictMode o re-render

  const isSuccess = !error;

  useEffect(() => {
    if (doneRef.current) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          if (!doneRef.current) {
            doneRef.current = true;
            setClosed(true);
            try { window.close(); } catch {}
            setTimeout(() => {
              window.location.href = "/protected?refresh=1";
            }, 500);
          }
          return 0;
        }
        return c - 1;
      });
    }, 600);

    return () => clearInterval(timer);
  // solo al mount — dipendenze vuote intenzionali
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-xs w-full">

        {/* Icona risultato */}
        <div className={`flex h-24 w-24 items-center justify-center rounded-full ${
          isSuccess ? "bg-emerald-500/10" : "bg-red-500/10"
        }`}>
          {isSuccess
            ? <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            : <AlertCircle className="h-12 w-12 text-red-500" />
          }
        </div>

        {/* Testo */}
        <div className="flex flex-col gap-2">
          <h1 className={`text-4xl font-extrabold ${
            isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
          }`}>
            {isSuccess ? t("stamp_added") : t("stamp_not_registered")}
          </h1>
          {isSuccess && artist && (
            <p className="text-foreground/60 text-sm">{t("stand_of")} {artist}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* Countdown chiusura */}
        {!closed && (
          <p className="text-xs text-foreground/40">
            {countdown > 0
              ? `${t("auto_close_in")} ${countdown}…`
              : t("you_can_close")}
          </p>
        )}

        {/* Fallback se window.close() non funziona */}
        {closed && (
          <div className="flex flex-col gap-3 w-full">
            <p className="text-sm text-foreground/50">
              {t("close_tab_manually")}
            </p>
            <button
              onClick={() => window.close()}
              className="flex items-center justify-center gap-2 min-h-12 rounded-xl bg-foreground text-background text-sm font-semibold"
            >
              <X className="h-4 w-4" />
              {t("close_tab")}
            </button>
            <Link
              href="/protected"
              className="min-h-12 rounded-xl border border-foreground/15 px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-foreground/5 flex items-center justify-center"
            >
              {t("go_to_my_area")}
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
