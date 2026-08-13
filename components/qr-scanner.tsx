"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CameraOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type ScanState = "idle" | "requesting" | "scanning" | "error";

export function QrScanner() {
  const { t } = useI18n();
  const router = useRouter();
  const [state, setState] = useState<ScanState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const foundRef = useRef(false);
  const lastAttemptRef = useRef<{ data: string; time: number } | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    foundRef.current = false;

    const start = async () => {
      setState("requesting");

      if (!navigator.mediaDevices?.getUserMedia) {
        if (mountedRef.current) {
          setErrorMsg(t("camera_not_supported"));
          setState("error");
        }
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch (err: any) {
        if (!mountedRef.current) return;
        const name = err?.name ?? "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setErrorMsg(t("camera_denied"));
        } else if (name === "NotFoundError") {
          setErrorMsg(t("no_camera"));
        } else if (name === "NotReadableError") {
          setErrorMsg(t("camera_in_use"));
        } else {
          setErrorMsg(t("camera_error"));
        }
        setState("error");
        return;
      }

      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");

      try {
        await video.play();
      } catch {
        if (mountedRef.current) {
          setErrorMsg(t("camera_error"));
          setState("error");
        }
        return;
      }

      if (!mountedRef.current) return;
      setState("scanning");

      // Carica jsQR dinamicamente
      const { default: jsQR } = await import("jsqr");
      if (!mountedRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const tick = () => {
        if (!mountedRef.current || foundRef.current) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code?.data) {
            const data = code.data.trim();
            const now = Date.now();
            const last = lastAttemptRef.current;
            if (last && last.data === data && now - last.time < 1500) {
              // Stesso QR già tentato: aspetta, non risolverlo di nuovo
              foundRef.current = false;
              rafRef.current = requestAnimationFrame(tick);
              return;
            }
            foundRef.current = true;
            lastAttemptRef.current = { data, time: now };
            void extractToken(data)
              .then((token) => {
                if (!mountedRef.current) return;
                if (token) {
                  stopAll();
                  router.push(`/scan/go?token=${encodeURIComponent(token)}`);
                } else {
                  // QR trovato ma senza token valido — continua a scansionare
                  foundRef.current = false;
                  rafRef.current = requestAnimationFrame(tick);
                }
              })
              .catch(() => {
                foundRef.current = false;
                rafRef.current = requestAnimationFrame(tick);
              });
            return;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    start();

    return () => {
      mountedRef.current = false;
      stopAll();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Estrae il token dal contenuto del QR. Se è un link abbreviato (es. qr.link),
  // lo risolve lato server seguendo i redirect per ottenere l'URL finale.
  const extractToken = async (data: string): Promise<string | null> => {
    const raw = data.trim();
    if (!/^https?:\/\//i.test(raw)) return raw;

    try {
      const url = new URL(raw);
      const t = url.searchParams.get("token");
      if (t) return t;

      const isAppHost =
        url.hostname === "localhost" ||
        url.hostname === "stamprally-nvgr.vercel.app" ||
        url.hostname.endsWith(".vercel.app");

      // Host dell'app senza ?token= in query → usa l'ultimo segmento del path
      if (isAppHost) {
        const seg = url.pathname.split("/").filter(Boolean).pop();
        return seg ? decodeURIComponent(seg) : null;
      }

      // Link esterno (abbreviatore) → risolvi i redirect e leggi il token
      try {
        const res = await fetch(`/api/resolve-url?url=${encodeURIComponent(url.toString())}`);
        const json = (await res.json()) as { url: string | null };
        if (json?.url) {
          const finalUrl = new URL(json.url);
          return finalUrl.searchParams.get("token") ?? null;
        }
      } catch {
        return null;
      }
      return null;
    } catch {
      return raw;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-sm rounded-xl overflow-hidden border border-foreground/10 bg-black relative">
        {/* Video diretto — nessuna libreria DOM */}
        <video
          ref={videoRef}
          className="w-full block"
          playsInline
          muted
          style={{ display: state === "scanning" ? "block" : "none" }}
        />

        {/* Canvas nascosto per processing jsQR */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay loading */}
        {(state === "idle" || state === "requesting") && (
          <div className="flex flex-col items-center justify-center gap-3 text-white/60 p-8 min-h-[300px]">
            <Camera className="h-10 w-10 animate-pulse" />
            <p className="text-sm text-center">
              {state === "requesting" ? t("requesting_camera") : t("starting_camera")}
            </p>
          </div>
        )}

        {/* Overlay errore */}
        {state === "error" && (
          <div className="flex flex-col items-center justify-center gap-3 text-foreground/40 p-8 min-h-[200px]">
            <CameraOff className="h-10 w-10" />
          </div>
        )}
      </div>

      {state === "scanning" && (
        <p className="text-sm text-foreground/60 text-center">
          {t("scan_stand_qr")}
        </p>
      )}

      {state === "error" && errorMsg && (
        <div className="w-full rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400 text-center">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
