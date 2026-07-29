"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { QrCode } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  displayId: string;
  nickname: string;
}

export function UserQrCode({ displayId, nickname }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 min-h-12 rounded-md border border-foreground/20 px-5 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
      >
        <QrCode className="h-4 w-4" />
        {t("my_qr")}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs" aria-describedby={undefined}>
          <VisuallyHidden.Root>
            <DialogTitle>{t("qr_of")} {nickname}</DialogTitle>
          </VisuallyHidden.Root>

          <div className="flex flex-col items-center gap-5 px-4 pt-8 pb-6">
            <div>
              <p className="text-center text-lg font-bold">{nickname}</p>
            </div>

            <div className="rounded-2xl border border-foreground/10 bg-white p-4 shadow-sm">
              <QRCodeSVG
                value={displayId}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>

            <p className="text-xs text-foreground/50 text-center max-w-[200px]">
              {t("show_qr_to_staff")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
