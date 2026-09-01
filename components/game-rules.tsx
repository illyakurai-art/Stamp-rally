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
              <p className="text-base font-bold text-foreground">Benvenuti alla Stamp Rally!</p>
              <p className="mt-2">
                Colleziona un timbro con un acquisto minimo di €1 presso uno dei 51 artisti partecipanti.
                Una volta raccolti i timbri, vieni allo stand Asunicha per ritirare il tuo premio!
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-2">Cosa si ottiene</p>
              <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-4 py-3 flex flex-col gap-1.5">
                <div className="flex justify-between"><span>5 timbri</span><span className="font-medium">1 Gacha</span></div>
                <div className="flex justify-between"><span>10 timbri</span><span className="font-medium">2 Gacha + 1 a scelta</span></div>
                <div className="flex justify-between"><span>15 timbri</span><span className="font-medium">4 Gacha + 2 a scelta</span></div>
                <div className="flex justify-between"><span>20 timbri</span><span className="font-medium">6 Gacha + 3 a scelta</span></div>
                <div className="flex justify-between"><span>25 timbri</span><span className="font-medium">8 Gacha + 4 a scelta</span></div>
                <div className="flex justify-between"><span>30 timbri</span><span className="font-medium">12 Gacha + 6 a scelta</span></div>
                <div className="flex justify-between"><span>35 timbri</span><span className="font-medium">16 Gacha + 8 a scelta</span></div>
                <div className="flex justify-between"><span>40 timbri</span><span className="font-medium">20 Gacha + 10 a scelta</span></div>
                <div className="flex justify-between"><span>45 timbri</span><span className="font-medium">24 Gacha + 12 a scelta</span></div>
                <div className="flex justify-between"><span>50 timbri</span><span className="font-medium">Full Collection</span></div>
              </div>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-2">Regole</p>
              <p>
                In questa stamp rally partecipano 51 artisti, tutti segnalati sulla mappa della rally
                e sul proprio stand con un cartello identificativo.
              </p>
              <p className="mt-2">
                Tutte le informazioni utili sono disponibili sull&apos;app web della rally, che viene usata
                anche per timbrare digitalmente ogni stand visitato tramite QR/NFC.
              </p>
              <p className="mt-2">
                Per ottenere un timbro su uno stand partecipante è necessario spendere almeno €1.
                Servono minimo 5 timbri per accedere a un premio. Raccogliere più timbri sblocca
                premi via via più ricchi.
              </p>
              <p className="mt-2">
                La rally può essere ripetuta quante volte si vuole: ogni stand può dare un solo timbro
                per giro, ma torna disponibile non appena il giro viene chiuso con un ritiro premio.
              </p>
              <p className="mt-2">
                Per ritirare il vostro premio, basterà tornare presso lo stand di Asunicha, in modo da
                scansionare il vostro QR code e ricevere i vostri premi a seconda di quanti timbri avete
                ottenuto nel vostro giro.
              </p>
              <p className="mt-2">
                I premi saranno distribuiti fino ad esaurimento scorte.
                I premi a scelta dovranno essere scelti 1 quantità a design. Per ricevere una seconda
                copia dello stesso design a scelta si dovrà fare un nuovo giro.
              </p>
              <p className="mt-2 text-foreground/60 text-xs">
                Questa rally non è affiliata all&apos;evento Milan Artist Alley, agli organizzatori o
                all&apos;ente Parco Esposizioni Novegro.
              </p>
              <p className="mt-1 text-foreground/60 text-xs">
                Queste regole potranno essere modificate durante il corso dell&apos;evento per garantire
                il fair play e favorire l&apos;esperienza piacevole ed equa per tutti.
              </p>
            </div>

            <div className="border-t border-foreground/10 pt-4 text-xs text-foreground/50 flex flex-col gap-1">
              <p>Stamp rally organizzata da{" "}
                <a href="https://www.instagram.com/Asunicha" target="_blank" rel="noreferrer" className="font-medium text-violet-400 hover:text-violet-300 hover:underline">Asunicha</a>{" "}
                e{" "}
                <a href="https://www.instagram.com/cristychan96" target="_blank" rel="noreferrer" className="font-medium text-violet-400 hover:text-violet-300 hover:underline">Cristychan96</a>
              </p>
              <p>Aiuto grafiche e ideazione logo{" "}
                <a href="https://www.instagram.com/lordghirahim" target="_blank" rel="noreferrer" className="font-medium text-violet-400 hover:text-violet-300 hover:underline">ARTeapot Studio</a>
              </p>
              <p>App web realizzata da{" "}
                <a href="https://www.instagram.com/illya.coph" target="_blank" rel="noreferrer" className="font-medium text-violet-400 hover:text-violet-300 hover:underline">Illya</a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
