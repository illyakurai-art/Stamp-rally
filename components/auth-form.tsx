"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkNicknameAvailable } from "@/app/actions/check-nickname";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Eye, EyeOff } from "lucide-react";
import { TextShimmer } from "@/components/motion/text-shimmer";
import { TextMorph } from "@/components/motion/text-morph";

function nicknameToFakeEmail(nickname: string): string {
  const safe = nickname.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
  return `${safe}@stamprally.local`;
}

type NicknameStatus = "idle" | "checking" | "available" | "taken";

export function AuthForm() {
  const { t } = useI18n();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otherTabOpen, setOtherTabOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rileva se un'altra scheda sta visitando la stessa pagina di auth:
  // su iPadOS/Safari il prompt Face ID di auto-fill fallisce quando la
  // stessa pagina di login è già aperta in un'altra scheda.
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    let bc: BroadcastChannel | null = null;
    let disposed = false;
    try {
      bc = new BroadcastChannel("stamprally-auth");
      const onMessage = (e: MessageEvent) => {
        if (e.data?.type === "auth-heartbeat") setOtherTabOpen(true);
      };
      const hb = setInterval(() => {
        try { bc?.postMessage({ type: "auth-heartbeat" }); } catch {}
      }, 3000);
      bc.addEventListener("message", onMessage);
      try { bc.postMessage({ type: "auth-heartbeat" }); } catch {}
      // Beccherà anche le altre schede già aperte al mount
      setTimeout(() => {
        if (!disposed && bc) {
          try { bc.postMessage({ type: "auth-heartbeat" }); } catch {}
        }
      }, 250);
      return () => {
        disposed = true;
        clearInterval(hb);
        bc?.removeEventListener("message", onMessage);
        bc?.close();
      };
    } catch {
      return;
    }
  }, []);

  // Nickname check debounced — determina se è un utente esistente o nuovo
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (nickname.trim().length < 2) {
      setNicknameStatus("idle");
      setWrongPassword(false);
      return;
    }
    setNicknameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      const available = await checkNicknameAvailable(nickname);
      setNicknameStatus(available ? "available" : "taken");
      setWrongPassword(false);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [nickname]);

  const isNewUser = nicknameStatus === "available";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWrongPassword(false);

    // L'auto-fill (Face ID / password manager) scrive il campo ma NON
    // triggera onChange: leggiamo i valori reali dal DOM al momento del submit.
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const domNickname = (formData.get("nickname") as string)?.trim() ?? "";
    const domPassword = (formData.get("password") as string) ?? "";
    const domRepeatPassword = (formData.get("repeat-password") as string) ?? "";

    // Usa i valori DOM se lo state è rimasto vuoto (caso auto-fill Face ID)
    const effectiveNickname = domNickname || nickname.trim();
    const effectivePassword = domPassword || password;
    const effectiveRepeat = domRepeatPassword || repeatPassword;

    if (!effectiveNickname || !effectivePassword) return;
    setNickname(effectiveNickname);

    setIsLoading(true);
    const supabase = createClient();

    if (!isNewUser) {
      // ── LOGIN via route server-side (IP forwarding per rate limiting) ──
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname: effectiveNickname, password: effectivePassword }),
        });
        const data = await res.json();

        if (!res.ok) {
          if (data.error?.toLowerCase().includes("nickname o password")) {
            setWrongPassword(nicknameStatus === "taken");
            setIsLoading(false);
            return;
          }
          if (res.status === 429) {
            setError("Troppi tentativi di accesso. Riprova tra qualche secondo.");
            setIsLoading(false);
            return;
          }
          throw new Error(data.error ?? t("error_occurred"));
        }

        // Imposta la sessione nel client con i token ricevuti
        if (data.access_token && data.refresh_token) {
          const supabase = createClient();
          await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
        }

        router.push("/protected");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t("error_occurred"));
      } finally {
        setIsLoading(false);
      }
    } else {
      // ── REGISTRAZIONE (nickname nuovo) ──
      if (effectivePassword !== effectiveRepeat) {
        setError(t("passwords_dont_match"));
        setIsLoading(false);
        return;
      }
      if (effectiveNickname.length < 2) {
        setError(t("nickname_too_short"));
        setIsLoading(false);
        return;
      }

      const available = await checkNicknameAvailable(effectiveNickname);
      if (!available) {
        setNicknameStatus("taken");
        setError(t("error_occurred"));
        setIsLoading(false);
        return;
      }

      const fakeEmail = nicknameToFakeEmail(effectiveNickname);
      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: fakeEmail,
          password: effectivePassword,
          options: { data: { nickname: effectiveNickname.trim() } },
        });
        if (signUpError) throw signUpError;

        if (!signUpData.session) {
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: fakeEmail,
            password: effectivePassword,
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
          password: effectivePassword,
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
    if (nickname.trim().length < 2) return null;
    if (nicknameStatus === "checking")
      return <p className="text-xs text-foreground/50">{t("checking_availability")}</p>;
    if (nicknameStatus === "taken")
      return (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          {t("welcome_back")} <span className="font-semibold">{nickname.trim()}</span>
        </p>
      );
    if (nicknameStatus === "available")
      return <p className="text-xs text-emerald-600 dark:text-emerald-400">{t("nickname_available")}</p>;
    return null;
  };

  const canSubmit =
    !isLoading &&
    (isNewUser ? password === repeatPassword : true);

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {/* Avviso: altra scheda di login aperta (Face ID/iPadOS può fallire) */}
      {otherTabOpen && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
          <span className="leading-snug">{t("login_other_tab_warning")}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-2 flex flex-col items-center gap-3">
        <img
          src="/stamprally-banner.png"
          alt="Stamp Rally"
          className="w-full max-w-[260px] rounded-lg object-contain"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Nickname */}
        <div className="flex flex-col gap-2">
          <div className="h-8 flex items-center">
            <TextMorph className="text-lg font-bold text-[#7d4d7f]">
              {nickname.trim().length >= 2
                ? nicknameStatus === "taken"
                  ? `${t("welcome_back")} ${nickname.trim()}`
                  : `${t("welcome")} ${nickname.trim()}`
                : t("welcome")}
            </TextMorph>
          </div>
          <input
            id="nickname"
            name="nickname"
            type="text"
            placeholder={t("nickname_placeholder")}
            required
            autoComplete="username"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onAnimationStart={(e) => {
              if (e.animationName === "onAutoFillStart") setNickname(e.currentTarget.value);
            }}
            className={`h-12 w-full rounded-lg border bg-[#D4B3E3] px-4 text-base text-foreground outline-none transition-all focus:ring-2 focus:ring-foreground/20 placeholder:text-foreground/60 ${
              isNewUser
                ? "border-emerald-500 focus:border-emerald-500"
                : "border-foreground/15 focus:border-foreground/30"
            }`}
          />
          {nickname.trim().length >= 2 && nicknameStatus === "available" && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{t("nickname_available")}</p>
          )}
          {wrongPassword && (
            <>
              <p className="text-xs text-red-500">{t("wrong_password_hint")}</p>
              <a
                href={`/auth/forgot-password?nickname=${encodeURIComponent(nickname.trim())}`}
                className="text-xs underline underline-offset-2 text-foreground/60 hover:text-foreground"
              >
                {t("forgot_my_password")}
              </a>
            </>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-lg font-bold text-[#7d4d7f]">
            {t("password")}
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete={isNewUser ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onAnimationStart={(e) => {
                if (e.animationName === "onAutoFillStart") setPassword(e.currentTarget.value);
              }}
              className="h-12 w-full rounded-lg border border-foreground/15 bg-[#D4B3E3] px-4 pr-11 text-base text-foreground outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/20 placeholder:text-foreground/60"
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

        {/* Ripeti password — solo per nuovi utenti */}
        {isNewUser && (
          <div className="flex flex-col gap-2">
            <label htmlFor="repeat-password" className="text-lg font-bold text-[#7d4d7f]">
              {t("repeat_password")}
            </label>
            <div className="relative">
              <input
                id="repeat-password"
                name="repeat-password"
                type={showRepeat ? "text" : "password"}
                required
                autoComplete="new-password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                onAnimationStart={(e) => {
                  if (e.animationName === "onAutoFillStart") setRepeatPassword(e.currentTarget.value);
                }}
                className={`h-12 w-full rounded-lg border bg-[#D4B3E3] px-4 pr-11 text-base text-foreground outline-none transition-all focus:ring-2 focus:ring-foreground/20 placeholder:text-foreground/60 ${
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

        {/* Privacy — solo per nuovi utenti */}
        {isNewUser && (
          <p className="text-xs text-foreground/50 text-center">
            {t("privacy_consent")}{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              {t("privacy_policy")}
            </a>
          </p>
        )}

        {/* Bottone principale — sempre cliccabile per il login, attivo solo a
            password corrispondenti per la registrazione */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="h-11 w-full rounded-xl bg-foreground text-background text-base font-semibold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
        >
          {isLoading
            ? isNewUser ? t("creating_account") : t("logging_in")
            : isNewUser ? t("register") : t("login")}
        </button>
      </form>
    </div>
  );
}
