"use client";

import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const languages = [
  { code: "ITA" as const, label: "IT" },
  { code: "ENG" as const, label: "EN" },
  { code: "JPN" as const, label: "JP" },
];

export function LanguageSelector() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1.5">
      {languages.map((l) => (
        <Button
          key={l.code}
          variant="outline"
          size="icon"
          aria-label={l.code}
          onClick={() => setLang(l.code)}
          className={cn(
            "h-9 w-9 rounded-full text-xs font-semibold transition-colors",
            lang === l.code
              ? "bg-[#7d4d7f] text-white border-[#7d4d7f]"
              : "text-foreground/60 hover:text-foreground"
          )}
        >
          {l.label}
        </Button>
      ))}
    </div>
  );
}
