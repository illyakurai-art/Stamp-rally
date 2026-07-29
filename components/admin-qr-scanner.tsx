"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, CameraOff, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { findUserByDisplayId } from "@/app/actions/find-user-by-display-id";
import type { UserEntry } from "@/components/admin-users-list";

interface Props {
  open: boolean;
  onClose: () => void;
  onUserFound: (user: UserEntry) => void;
}

type ScanState = "idle" | "requesting" | "scanning" | "error";

export function AdminQrScanner({ open, onClose, onUserFound }: Props) {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scannerRef = useRef<any>(null);
  const cleanedUpRef = useRef(false);
  const runningRef = useRef(false);
  const handledRef = useRef(false);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    if (runningRef.current) {
      runningRef.current = false;
      try { await scanner.stop(); } catch {}
    }
    try { scanner.clear(); } catch {}
    scannerRef.current = null;
  };

  useEffect(() => {
    if (!open) return;

    cleanedUpRef.current = false;
    handledRef.current = false;
    setScanState("idle");
    setErrorMsg(null);

    const startScanner = async () => {
      setScanState("requesting");

      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cleanedUpRef.current) {
          setErrorMsg("Fotocamera non supportata. Usa HTTPS e un browser aggiornato.");
          setScanState("error");
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        stream.getTracks().forEach((t) => t.stop());
      } catch (permErr: any) {
        if (cleanedUpRef.current) return;
        const name = permErr?.name ?? "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setErrorMsg("Accesso fotocamera negato. Consenti l'accesso nelle impostazioni.");
        } else if (name === "NotFoundError") {
          setErrorMsg("Nessuna fotocamera trovata.");
        } else {
          setErrorMsg(permErr?.message ?? "Impossibile accedere alla fotocamera.");
        }
        setScanState("error");
        return;
      }

      if (cleanedUpRef.current) return;
      const container = document.getElementById("admin-qr-reader");
      if (!container) return;

      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cleanedUpRef.current) return;

        const scanner = new Html5Qrcode("admin-qr-reader");
        scannerRef.current = scanner;

        const onSuccess = (text: string) => {
          if (handledRef.current) return;
          handledRef.current = true;

          // Il QR dell'utente contiene il display_id (es. "U0001")
          // oppure una URL tipo https://...?uid=U0001
          let displayId = text.trim();
          try {
            const url = new URL(text);
            displayId = url.searchParams.get("uid") ?? url.searchParams.get("display_id") ?? text.trim();
          } catch {}

          stopScanner().then(() => {
            if (cleanedUpRef.current) return;
            startTransition(async () => {
              const user = await findUserByDisplayId(displayId);
              if (user) {
                onUserFound(user);
                onClose();
              } else {
                setErrorMsg(`Nessun utente trovato per "${displayId}"`);
                setScanState("error");
                handledRef.current = false;
              }
            });
          });
        };

        const onError = () => {};

        try {
          await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } }, onSuccess, onError);
        } catch {
          if (cleanedUpRef.current) return;
          await scanner.start({ facingMode: "user" }, { fps: 10, qrbox: { width: 220, height: 220 } }, onSuccess, onError);
        }

        if (!cleanedUpRef.current) {
          runningRef.current = true;
          setScanState("scanning");
        } else {
          stopScanner();
        }
      } catch (err: any) {
        if (cleanedUpRef.current) return;
        setErrorMsg(err?.message ?? "Impossibile avviare la fotocamera.");
        setScanState("error");
      }
    };

    startScanner();

    return () => {
      cleanedUpRef.current = true;
      stopScanner();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { stopScanner(); onClose(); } }}>
      <DialogContent className="overflow-hidden max-w-sm" aria-describedby={undefined}>
        <VisuallyHidden.Root>
          <DialogTitle>Scansiona QR utente</DialogTitle>
        </VisuallyHidden.Root>

        <div className="px-6 pt-8 pb-2 border-b border-foreground/10">
          <h2 className="text-xl font-bold">Scansiona QR utente</h2>
          <p className="text-sm text-foreground/50 mt-0.5">
            Inquadra il QR code mostrato dall'utente
          </p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="relative w-full overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5 min-h-[260px]">
            <div id="admin-qr-reader" className="w-full" />

            {(scanState === "idle" || scanState === "requesting") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground/40">
                <Camera className="h-10 w-10 animate-pulse" />
                <p className="text-sm">{scanState === "requesting" ? "Avvio fotocamera…" : "Inizializzazione…"}</p>
              </div>
            )}

            {scanState === "error" && !isPending && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground/40">
                <CameraOff className="h-10 w-10" />
              </div>
            )}

            {isPending && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin text-foreground/60" />
                <p className="text-sm text-foreground/60">Ricerca utente…</p>
              </div>
            )}
          </div>

          {scanState === "scanning" && !isPending && (
            <p className="text-sm text-foreground/50 text-center">
              Inquadra il QR code dello schermo dell'utente
            </p>
          )}

          {scanState === "error" && errorMsg && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 text-center">
              {errorMsg}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
