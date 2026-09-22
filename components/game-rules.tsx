"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useI18n } from "@/lib/i18n/context";

export function GameRules() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-foreground/25 bg-foreground/5 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/10"
      >
        <Menu className="h-4 w-4" />
        {t("rules")}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
          <VisuallyHidden.Root>
            <DialogTitle>Regole della Rally</DialogTitle>
          </VisuallyHidden.Root>

          <div className="px-6 pt-8 pb-6 flex flex-col gap-5 text-sm leading-relaxed text-foreground/85">
            <div>
              <p className="text-base font-bold text-foreground">{t("rules_welcome")}</p>
              <p className="mt-2">
                {t("rules_intro")}
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-2">{t("rules_prizes")}</p>
              <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-4 py-3 flex flex-col gap-1.5">
                <div className="flex justify-between"><span>{t("stamps_count").replace("{count}", "5")}</span><span className="font-medium">1 Gacha</span></div>
                <div className="flex justify-between"><span>{t("stamps_count").replace("{count}", "10")}</span><span className="font-medium">2 Gacha + 1 {t("extra_choice")}</span></div>
                <div className="flex justify-between"><span>{t("stamps_count").replace("{count}", "15")}</span><span className="font-medium">4 Gacha + 2 {t("extra_choice")}</span></div>
                <div className="flex justify-between"><span>{t("stamps_count").replace("{count}", "20")}</span><span className="font-medium">6 Gacha + 3 {t("extra_choice")}</span></div>
                <div className="flex justify-between"><span>{t("stamps_count").replace("{count}", "25")}</span><span className="font-medium">8 Gacha + 4 {t("extra_choice")}</span></div>
                <div className="flex justify-between"><span>{t("stamps_count").replace("{count}", "30")}</span><span className="font-medium">12 Gacha + 6 {t("extra_choice")}</span></div>
                <div className="flex justify-between"><span>{t("stamps_count").replace("{count}", "35")}</span><span className="font-medium">16 Gacha + 8 {t("extra_choice")}</span></div>
                <div className="flex justify-between"><span>{t("stamps_count").replace("{count}", "40")}</span><span className="font-medium">20 Gacha + 10 {t("extra_choice")}</span></div>
                <div className="flex justify-between"><span>{t("stamps_count").replace("{count}", "45")}</span><span className="font-medium">24 Gacha + 12 {t("extra_choice")}</span></div>
                <div className="flex justify-between"><span>{t("stamps_count").replace("{count}", "50")}</span><span className="font-medium">Full Collection</span></div>
              </div>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-2">{t("rules_section_title")}</p>
              <p>
                {t("rules_artists_info")}
              </p>
              <p className="mt-2">
                {t("rules_app_info")}
              </p>
              <p className="mt-2">
                {t("rules_purchase")}
              </p>
              <p className="mt-2">
                {t("rules_repeat")}
              </p>
              <p className="mt-2">
                {t("rules_redemption")}
              </p>
              <p className="mt-2">
                {t("rules_stock")}
              </p>
              <p className="mt-2 text-foreground/60 text-xs">
                {t("rules_disclaimer")}
              </p>
              <p className="mt-1 text-foreground/60 text-xs">
                {t("rules_changes")}
              </p>
            </div>

            <div className="border-t border-foreground/10 pt-4 text-xs text-foreground/50 flex flex-col gap-1">
              <p>{t("rules_organized_by")}{" "}
                <a href="https://www.instagram.com/Asunicha" target="_blank" rel="noreferrer" className="font-medium text-violet-400 hover:text-violet-300 hover:underline">Asunicha</a>{" "}
                {"& "}
                <a href="https://www.instagram.com/cristychan96" target="_blank" rel="noreferrer" className="font-medium text-violet-400 hover:text-violet-300 hover:underline">Cristychan96</a>
              </p>
              <p>{t("rules_graphic_help")}{" "}
                <a href="https://www.instagram.com/lordghirahim" target="_blank" rel="noreferrer" className="font-medium text-violet-400 hover:text-violet-300 hover:underline">ARTeapot Studio</a>
              </p>
              <p>{t("rules_made_by")}{" "}
                <a href="https://www.instagram.com/illya.coph" target="_blank" rel="noreferrer" className="font-medium text-violet-400 hover:text-violet-300 hover:underline">Illya</a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
