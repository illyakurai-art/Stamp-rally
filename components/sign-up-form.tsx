"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { checkNicknameAvailable } from "@/app/actions/check-nickname";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { PrivacyCheckbox } from "@/components/privacy-checkbox";
import { useI18n } from "@/lib/i18n/context";

function nicknameToFakeEmail(nickname: string): string {
  const safe = nickname.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
  return `${safe}@stamprally.local`;
}

type NicknameStatus = "idle" | "checking" | "available" | "taken";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useI18n();
  const router = useRouter();

  // Check disponibilità nickname con debounce 500ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (nickname.trim().length < 2) {
      setNicknameStatus("idle");
      return;
    }

    setNicknameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      const available = await checkNicknameAvailable(nickname);
      setNicknameStatus(available ? "available" : "taken");
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nickname]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nicknameStatus === "taken") {
      setError(t("nickname_unavailable"));
      return;
    }

    if (password !== repeatPassword) {
      setError(t("passwords_dont_match"));
      return;
    }

    if (nickname.trim().length < 2) {
      setError(t("nickname_too_short"));
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    // Double-check sincrono prima di registrare
    const available = await checkNicknameAvailable(nickname);
    if (!available) {
      setNicknameStatus("taken");
      setError(t("nickname_unavailable"));
      setIsLoading(false);
      return;
    }

    const fakeEmail = nicknameToFakeEmail(nickname);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password,
        options: { data: { nickname: nickname.trim() } },
      });
      if (signUpError) throw signUpError;

      // Se session è null: o conferma email attiva, o utente già esistente
      // (Supabase non distingue i due casi per sicurezza)
      if (!signUpData.session) {
        // Proviamo il login diretto: se funziona, l'utente esisteva già
        const { error: loginRetryError } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password,
        });
        if (!loginRetryError) {
          router.push("/protected");
          return;
        }
        // Se anche il login fallisce, l'account esiste ma non è confermato
        // oppure la password è diversa
        setNicknameStatus("taken");
        throw new Error(t("nickname_unavailable"));
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });
      if (loginError) {
        if (loginError.message.toLowerCase().includes("not confirmed")) {
          throw new Error(t("account_not_confirmed"));
        }
        throw loginError;
      }

      router.push("/protected");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("error_occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const nicknameHint = () => {
    if (nickname.trim().length < 2) return null;
    if (nicknameStatus === "checking")
      return <p className="text-xs text-foreground/50">{t("checking_availability")}</p>;
    if (nicknameStatus === "taken")
      return <p className="text-xs text-red-500">{t("nickname_unavailable")}</p>;
    if (nicknameStatus === "available")
      return <p className="text-xs text-emerald-600 dark:text-emerald-400">{t("nickname_available")}</p>;
    return null;
  };

  const canSubmit =
    !isLoading &&
    nicknameStatus !== "taken" &&
    nicknameStatus !== "checking" &&
    nickname.trim().length >= 2;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("register_title")}</CardTitle>
          <CardDescription>{t("register_subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="nickname">{t("nickname")}</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder={t("nickname_placeholder")}
                  required
                  autoComplete="username"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={
                    nicknameStatus === "taken"
                      ? "border-red-500 focus-visible:ring-red-500"
                      : nicknameStatus === "available"
                      ? "border-emerald-500 focus-visible:ring-emerald-500"
                      : ""
                  }
                />
                {nicknameHint()}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="repeat-password">{t("repeat_password")}</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
                {repeatPassword.length > 0 && password !== repeatPassword && (
                  <p className="text-xs text-red-500">{t("passwords_dont_match")}</p>
                )}
                {repeatPassword.length > 0 && password === repeatPassword && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{t("passwords_match")}</p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <PrivacyCheckbox />
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {isLoading ? t("creating_account") : t("register")}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t("have_account")}{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                {t("login")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
