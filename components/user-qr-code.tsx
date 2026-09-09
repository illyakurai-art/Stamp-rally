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
        className="flex items-center justify-center gap-2 min-h-12 rounded-md border border-foreground/20 px-5 py-3 text-sm font-medium transition-all hover:bg-foreground/5 shadow-[4px_4px_0_rgba(0,0,0,0.25)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_rgba(0,0,0,0.25)]"
      >
        <QrCode className="h-4 w-4" />
        {t("my_qr")}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs !bg-[#2D1B33]" aria-describedby={undefined}>
          <VisuallyHidden.Root>
            <DialogTitle>{t("qr_of")} {nickname}</DialogTitle>
          </VisuallyHidden.Root>

          <div className="flex flex-col items-center gap-5 px-4 pt-8 pb-6">
            <div>
              <p className="text-center text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent animate-gradient-flow">{nickname}</p>
            </div>

            <div className="rounded-2xl border-2 border-[#996C9E] bg-white p-4 shadow-sm">
              <QRCodeSVG
                value={displayId}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>

            <p className="text-sm font-semibold text-center max-w-[220px] leading-snug text-[#C9A0DC]">
              {t("show_qr_to_stand")} <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent animate-gradient-flow font-extrabold">Asunicha</span> {t("show_qr_to_stand_end")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
