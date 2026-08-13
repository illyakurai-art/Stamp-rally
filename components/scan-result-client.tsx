"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  artist: string | null;
  error: string | null;
  image?: string | null;
}

export function ScanResultClient({ artist, error, image }: Props) {
  const { t } = useI18n();
  const [countdown, setCountdown] = useState(3);
  const [stamped, setStamped] = useState(false);
  const [closed, setClosed] = useState(false);
  const [showManualClose, setShowManualClose] = useState(false);
  const doneRef = useRef(false); // evita doppia esecuzione in StrictMode o re-render

  const isSuccess = !error;

  useEffect(() => {
    if (doneRef.current) return;

    // Ritardo 400ms poi stampa animata sopra l'immagine
    const stampTimer = setTimeout(() => {
      setStamped(true);
    }, 400);

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          if (!doneRef.current) {
            doneRef.current = true;
            setClosed(true);
            try { window.close(); } catch {}
            // Il tasto manuale appare 1s dopo la fine del countdown, come
            // fallback nel caso in cui la chiusura automatica non parta.
            setTimeout(() => setShowManualClose(true), 1000);
            setTimeout(() => {
              window.location.href = "/protected?refresh=1";
            }, 500);
          }
          return 0;
        }
        return c - 1;
      });
    }, 600);

    return () => { clearInterval(timer); clearTimeout(stampTimer); };
  // solo al mount — dipendenze vuote intenzionali
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-xs w-full">

        {/* Card artista scansionata */}
        {isSuccess && image && (
          <div className="relative w-full max-w-[220px] overflow-hidden rounded-3xl border-2 border-green-500 shadow-lg shadow-green-500/20">
            <img
              src={image}
              alt={artist ?? "Artist"}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
              <p className="text-base font-bold text-white truncate">{artist}</p>
              <p className="text-xs text-white/80 mt-0.5">{t("stamp_added")}</p>
            </div>

            {/* Timbro animato che "stampa" il pallino verde con ✓ */}
            {stamped && (
              <div className="absolute top-3 right-3 stamp-pop">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 border-4 border-white/90 text-white shadow-xl">
                  <span className="text-2xl leading-none">✓</span>
                </div>
              </div>
            )}
          </div>
        )}

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
        {closed && showManualClose && (
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
          </div>
        )}

      </div>
    </main>
  );
}
