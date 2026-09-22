"use client";

import { useI18n } from "@/lib/i18n/context";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="w-full pb-6 pt-4 text-center">
      <p className="text-xs text-foreground/50">
        {t("footer_made_by")}{" "}
        <a
          href="https://www.instagram.com/illya.cosph?igsh=d3g4azVmcGUxMW82"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-foreground/70 hover:text-foreground hover:underline"
        >
          @IllyA
        </a>
        {" · "}
        {t("footer_assistance")}{" "}
        <a
          href="https://t.me/Illya_frutti_rossi"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-foreground/70 hover:text-foreground hover:underline"
        >
          {t("here")}
        </a>
      </p>
    </footer>
  );
}
