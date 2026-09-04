"use client";

import { cn } from "@/lib/utils";
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
import { createClient } from "@/lib/supabase/client";

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

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const domNickname = (formData.get("nickname") as string)?.trim() ?? "";
    const domPassword = (formData.get("password") as string) ?? "";

    const effectiveNickname = domNickname || nickname.trim();
    const effectivePassword = domPassword || password;

    try {
      // Usa la route server-side con IP forwarding per rate limiting
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: effectiveNickname, password: effectivePassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError("Troppi tentativi di accesso. Riprova tra qualche secondo.");
          return;
        }
        throw new Error(data.error ?? "Credenziali non valide");
      }

      // Imposta la sessione nel client con i token ricevuti
      if (data.access_token && data.refresh_token) {
        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        // Verifica ruolo staff
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user_id)
          .maybeSingle();

        if (profile?.role !== "staff") {
          await supabase.auth.signOut();
          throw new Error("Accesso non autorizzato: account non staff");
        }
      }

      window.location.href = "/admin";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Si è verificato un errore");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="border-foreground/10 bg-[#3D2545] text-white">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#996C9E]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Area Admin</CardTitle>
          <CardDescription className="text-white/70">Accesso riservato allo staff</CardDescription>
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
                <label htmlFor="nickname" className="text-lg font-bold text-[#C5A3C9]">
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
                  className="h-12 w-full rounded-lg border border-white/15 bg-[#4A2D54] px-4 text-base text-white outline-none transition-all focus:border-white/30 focus:ring-2 focus:ring-white/20 placeholder:text-white/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-lg font-bold text-[#C5A3C9]">
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
                  className="h-12 w-full rounded-lg border border-white/15 bg-[#4A2D54] px-4 text-base text-white outline-none transition-all focus:border-white/30 focus:ring-2 focus:ring-white/20 placeholder:text-white/50"
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
                className="flex w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-base font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
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
