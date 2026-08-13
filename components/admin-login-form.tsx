"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

function nicknameToFakeEmail(nickname: string): string {
  const safe = nickname.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
  return `${safe}@stamprally.local`;
}

export function AdminLoginForm({ className }: { className?: string }) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get("error") === "unauthorized";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const supabase = createClient();

    // L'auto-fill (Face ID / password manager) scrive il campo ma NON
    // triggera onChange: leggiamo i valori reali dal DOM al momento del submit.
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const domNickname = (formData.get("nickname") as string)?.trim() ?? "";
    const domPassword = (formData.get("password") as string) ?? "";

    const effectiveNickname = domNickname || nickname.trim();
    const effectivePassword = domPassword || password;

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: nicknameToFakeEmail(effectiveNickname),
        password: effectivePassword,
      });

      if (loginError) {
        throw new Error("Credenziali non valide");
      }

      // Verifica ruolo staff lato client (il middleware lo verifica anche lato server)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.role !== "staff") {
        await supabase.auth.signOut();
        throw new Error("Accesso non autorizzato: account non staff");
      }

      // Hard navigation per assicurarsi che il proxy legga i cookie aggiornati
      window.location.href = "/admin";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="border-foreground/10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#996C9E]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Area Admin</CardTitle>
          <CardDescription>Accesso riservato allo staff</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-5">
              {isUnauthorized && !error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  Non hai i permessi per accedere a questa sezione.
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label htmlFor="nickname" className="text-lg font-bold text-[#7d4d7f]">
                  Nickname
                </label>
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  placeholder="Nickname staff"
                  required
                  autoComplete="username"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onAnimationStart={(e) => {
                    if (e.animationName === "onAutoFillStart") setNickname(e.currentTarget.value);
                  }}
                  className="h-12 w-full rounded-lg border border-foreground/15 bg-[#D4B3E3] px-4 text-base text-foreground outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/20 placeholder:text-foreground/60"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-lg font-bold text-[#7d4d7f]">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onAnimationStart={(e) => {
                    if (e.animationName === "onAutoFillStart") setPassword(e.currentTarget.value);
                  }}
                  className="h-12 w-full rounded-lg border border-foreground/15 bg-[#D4B3E3] px-4 text-base text-foreground outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/20 placeholder:text-foreground/60"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-foreground text-base font-semibold text-background transition-all hover:opacity-90 disabled:opacity-40"
                style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
              >
                {isLoading ? "Accesso in corso…" : "Accedi come Staff"}
              </button>

              <Link
                href="/auth/sign-up"
                className="flex w-full items-center justify-center rounded-xl border border-foreground/15 px-4 py-3 text-base font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                Accedi come utente
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
