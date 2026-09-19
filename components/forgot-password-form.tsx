"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { MapPin } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Recupera password</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Per reimpostare la tua password, recati allo stand{" "}
            <span className="font-semibold text-foreground">Asunicha</span> e
            chiedi assistenza al personale.
          </p>
          <Link
            href="/mappa?artist=A0001"
            className="inline-flex items-center gap-2 rounded-lg bg-[#996C9E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8a5f8e]"
          >
            <MapPin className="h-4 w-4" />
            Vedi mappa
          </Link>
          <p className="text-sm text-muted-foreground">
            Oppure contatta direttamente l&apos;Amministratore di Sistema tramite{" "}
            <a
              href="https://t.me/Illya_frutti_rossi"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 font-semibold text-[#996C9E] hover:text-[#8a5f8e] transition-colors"
            >
              chat
            </a>
          </p>
          <div className="mt-2 text-center text-sm">
            Hai già un account?{" "}
            <Link
              href="/auth/login"
              className="underline underline-offset-4"
            >
              Accedi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}