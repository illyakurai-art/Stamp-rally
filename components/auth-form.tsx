"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkNicknameAvailable } from "@/app/actions/check-nickname";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function nicknameToFakeEmail(nickname: string): string {
  const safe = nickname.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
  return `${safe}@stamprally.local`;
}

type NicknameStatus = "idle" | "checking" | "available" | "taken";
type Mode = "login" | "register";

export function AuthForm() {
  const { t } = useI18n();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nickname check debounced — solo in modalità registrazione
  useEffect(() => {
    if (mode !== "register") return;
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
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [nickname, mode]);

  const switchToRegister = () => {
    setMode("register");
    setError(null);
    setNicknameStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const supabase = createClient();

    if (mode === "login") {
      // ── LOGIN ──
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: nicknameToFakeEmail(nickname),
          password,
        });
        if (error) {
          if (
            error.message.toLowerCase().includes("invalid login") ||
            error.message.toLowerCase().includes("invalid credentials")
          ) {
            throw new Error(t("wrong_nickname_or_password"));
          }
          throw error;
        }
        router.push("/protected");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t("error_occurred"));
      } finally {
        setIsLoading(false);
      }
    } else {
      // ── REGISTRAZIONE ──
      if (nicknameStatus === "taken") {
        setError(t("nickname_unavailable"));
        setIsLoading(false);
        return;
      }
      if (password !== repeatPassword) {
        setError(t("passwords_dont_match"));
        setIsLoading(false);
        return;
      }
      if (nickname.trim().length < 2) {
        setError(t("nickname_too_short"));
        setIsLoading(false);
        return;
      }

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

        if (!signUpData.session) {
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: fakeEmail,
            password,
          });
          if (!retryError) {
            router.push("/protected");
            return;
          }
          setNicknameStatus("taken");
          throw new Error(t("nickname_unavailable"));
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password,
        });
        if (loginError) throw loginError;
        router.push("/protected");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t("error_occurred"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const nicknameHint = () => {
    if (mode !== "register" || nickname.trim().length < 2) return null;
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
    nickname.trim().length >= 2 &&
    password.length >= 1 &&
    (mode === "login" ||
      (nicknameStatus !== "taken" &&
        nicknameStatus !== "checking" &&
        password === repeatPassword));

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Stamp Rally</h1>
        <p className="text-sm text-foreground/50 mt-1">
          {mode === "login" ? t("login_subtitle") : t("register_subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nickname */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nickname" className="text-sm font-medium">
            {t("nickname")}
          </label>
          <input
            id="nickname"
            type="text"
            placeholder={t("nickname_placeholder")}
            required
            autoComplete="username"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={`h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-foreground/20 ${
              mode === "register" && nicknameStatus === "taken"
                ? "border-red-500 focus:border-red-500"
                : mode === "register" && nicknameStatus === "available"
                ? "border-emerald-500 focus:border-emerald-500"
                : "border-foreground/15 focus:border-foreground/30"
            }`}
          />
          {nicknameHint()}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            {t("password")}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-foreground/15 bg-background px-3 pr-10 text-sm outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Ripeti password — solo in modalità registrazione */}
        {mode === "register" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="repeat-password" className="text-sm font-medium">
              {t("repeat_password")}
            </label>
            <div className="relative">
              <input
                id="repeat-password"
                type={showRepeat ? "text" : "password"}
                required
                autoComplete="new-password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className={`h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm outline-none transition-all focus:ring-2 focus:ring-foreground/20 ${
                  repeatPassword.length > 0 && password !== repeatPassword
                    ? "border-red-500"
                    : repeatPassword.length > 0 && password === repeatPassword
                    ? "border-emerald-500"
                    : "border-foreground/15 focus:border-foreground/30"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowRepeat(!showRepeat)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                tabIndex={-1}
              >
                {showRepeat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {repeatPassword.length > 0 && password !== repeatPassword && (
              <p className="text-xs text-red-500">{t("passwords_dont_match")}</p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Privacy — solo in modalità registrazione */}
        {mode === "register" && (
          <p className="text-xs text-foreground/50 text-center">
            {t("privacy_consent")}{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              {t("privacy_policy")}
            </Link>
          </p>
        )}

        {/* Bottone principale */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="h-11 w-full rounded-xl bg-foreground text-background text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isLoading
            ? mode === "login" ? t("logging_in") : t("creating_account")
            : mode === "login" ? t("login") : t("register")}
        </button>

        {/* Bottone "Non sono ancora registrato" — solo in modalità login */}
        {mode === "login" && (
          <button
            type="button"
            onClick={switchToRegister}
            className="h-11 w-full rounded-xl border border-foreground/15 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            Non sono ancora registrato
          </button>
        )}

        {/* Torna al login — solo in modalità registrazione */}
        {mode === "register" && (
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); setRepeatPassword(""); }}
            className="text-xs text-foreground/50 text-center hover:text-foreground transition-colors"
          >
            {t("have_account")} <span className="underline underline-offset-2">{t("login")}</span>
          </button>
        )}
      </form>
    </div>
  );
}
