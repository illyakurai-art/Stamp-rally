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
            <p className="text-base font-bold text-foreground">
              Ecco le regole della Rally:
            </p>

            <div>
              <p className="font-semibold text-foreground mb-2">Benvenuti alla Stamp Rally!</p>
              <p>
                Colleziona un timbro con un acquisto minimo di €2 presso uno dei 40 artisti partecipanti.
                Una volta raccolti i timbri, vieni allo stand Asunicha per ritirare il tuo premio!
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-2">Regole</p>
              <p>
                La rally è organizzata dallo stand Asunicha e Cristy. Partecipano 40 artisti, tutti segnalati
                sulla mappa della rally e sul proprio stand con un cartello identificativo.
              </p>
              <p className="mt-2">
                Tutte le informazioni utili sono disponibili sull&apos;app web della rally, che viene usata
                anche per timbrare digitalmente ogni stand visitato tramite QR/NFC.
              </p>
              <p className="mt-2">
                Per ottenere un timbro su uno stand partecipante è necessario spendere almeno €2.
                Servono minimo 5 timbri per accedere a un premio. Raccogliere più timbri sblocca
                premi via via più ricchi.
              </p>
              <p className="mt-2">
                La rally può essere ripetuta quante volte si vuole: ogni stand può dare un solo timbro
                per giro, ma torna disponibile non appena il giro viene chiuso con un ritiro premio.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-2">Come ritirare il premio</p>
              <p>
                Con almeno 5 timbri, presentati allo stand della rally: lo staff verificherà i tuoi
                timbri tramite l&apos;app e procederà al ritiro del premio corrispondente alla tua
                fascia raggiunta.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
