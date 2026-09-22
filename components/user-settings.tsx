"use client";

import { useState, useEffect } from "react";
import { Settings, LogOut, Trash2, Globe, QrCode, KeyRound, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/app/actions/delete-account";
import { useI18n } from "@/lib/i18n/context";

function FlagIT({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} aria-hidden="true">
      <rect width="1" height="2" fill="#009246" />
      <rect x="1" width="1" height="2" fill="#ffffff" />
      <rect x="2" width="1" height="2" fill="#ce2b37" />
    </svg>
  );
}

function FlagGB({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <clipPath id="gb-a">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="gb-b">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#gb-a)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#gb-b)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function FlagJP({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 9 6" className={className} aria-hidden="true">
      <rect width="9" height="6" fill="#ffffff" />
      <circle cx="4.5" cy="3" r="1.8" fill="#BC002D" />
    </svg>
  );
}

export function UserSettings() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [qrMode, setQrMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("qrMode");
    if (saved === "true" || saved === "false") {
      setQrMode(saved === "true");
    }
  }, []);

  const toggleQrMode = () => {
    const next = !qrMode;
    setQrMode(next);
    localStorage.setItem("qrMode", String(next));
    window.dispatchEvent(new CustomEvent("qrModeChange", { detail: next }));
  };
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pwdChangeOpen, setPwdChangeOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setDeleteLoading(true);
    const result = await deleteAccount(deletePassword);
    if (result.error) {
      setDeleteError(result.error);
      setDeleteLoading(false);
    } else {
      router.push("/auth/sign-up");
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-up");
  };

  const resetDelete = () => {
    setConfirmDelete(false);
    setDeletePassword("");
    setDeleteError(null);
  };

  const resetPwdChange = () => {
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setPwdError(null);
    setPwdSuccess(false);
    setShowCurrentPwd(false);
    setShowNewPwd(false);
    setShowConfirmPwd(false);
  };

  const handleChangePassword = async () => {
    setPwdError(null);
    if (newPwd.length < 6) {
      setPwdError("La password deve avere almeno 6 caratteri");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Le password non coincidono");
      return;
    }
    setPwdLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) {
      setPwdError(error.message);
      setPwdLoading(false);
    } else {
      setPwdSuccess(true);
      setPwdLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-foreground/25 bg-foreground/5 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/10"
      >
        <Settings className="h-4 w-4" />
        {t("settings")}
      </button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetDelete(); }}>
        <DialogContent className="max-w-sm overflow-hidden p-0" aria-describedby={undefined}>
          <VisuallyHidden.Root>
            <DialogTitle>{t("settings")}</DialogTitle>
          </VisuallyHidden.Root>

          {/* Header */}
          <div className="px-6 pt-8 pb-5 border-b border-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60 mb-1">Account</p>
            <h2 className="text-xl font-bold">{t("settings")}</h2>
          </div>

          <div className="px-6 py-5 flex flex-col gap-5">

            {/* Lingua */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Globe className="h-4 w-4" />
                {t("language")}
              </div>
              <div className="flex rounded-lg border border-foreground/15 overflow-hidden">
                <button
                  onClick={() => setLang("ITA")}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    lang === "ITA"
                      ? "bg-foreground text-background"
                      : "text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <FlagIT className="h-4 w-4 rounded-[2px]" />
                    Italiano
                  </span>
                </button>
                <button
                  onClick={() => setLang("ENG")}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    lang === "ENG"
                      ? "bg-foreground text-background"
                      : "text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <FlagGB className="h-4 w-4 rounded-[2px]" />
                    English
                  </span>
                </button>
                <button
                  onClick={() => setLang("JPN")}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    lang === "JPN"
                      ? "bg-foreground text-background"
                      : "text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <FlagJP className="h-4 w-4 rounded-[2px]" />
                    日本語
                  </span>
                </button>
              </div>
            </div>

            {/* QR Toggle */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3.5">
              <div className="flex items-start gap-3 min-w-0">
                <QrCode className="h-4 w-4 mt-0.5 text-foreground/70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t("manual_qr_reader")}</p>
                  <p className="text-xs text-foreground/70 mt-0.5 leading-snug">
                    {t("manual_qr_desc")}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleQrMode}
                className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
                  qrMode ? "bg-foreground" : "bg-foreground/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${
                    qrMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-foreground/10" />

            {/* Cambia password */}
            <button
              onClick={() => { setPwdChangeOpen(true); setOpen(false); resetPwdChange(); }}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-foreground/15 bg-foreground/[0.02] px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.06]"
            >
              <KeyRound className="h-4 w-4" />
              {t("change_password")}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-600 transition-colors hover:bg-green-500/20 dark:text-green-500"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>

            {/* Elimina account */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                {t("delete_account")}
              </button>
            ) : (
              <div className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm font-medium text-red-500">{t("delete_account")}</p>
                <p className="text-xs text-foreground/80 leading-snug">
                  {t("delete_account_warning")}
                </p>
                <input
                  type="password"
                  placeholder={t("enter_password")}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
                />
                {deleteError && (
                  <p className="text-xs text-red-500">{deleteError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={resetDelete}
                    className="flex-1 rounded-lg border border-foreground/15 px-3 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!deletePassword || deleteLoading}
                    className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-red-600 transition-colors"
                  >
                    {deleteLoading ? t("deleting") : t("confirm")}
                  </button>
                </div>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>

      {/* ── CAMBIO PASSWORD POPUP ── */}
      <Dialog open={pwdChangeOpen} onOpenChange={(o) => { setPwdChangeOpen(o); if (!o) resetPwdChange(); }}>
        <DialogContent className="max-w-sm overflow-hidden p-0" aria-describedby={undefined}>
          <VisuallyHidden.Root>
            <DialogTitle>{t("change_password")}</DialogTitle>
          </VisuallyHidden.Root>

          <div className="px-6 pt-8 pb-5 border-b border-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60 mb-1">Account</p>
            <h2 className="text-xl font-bold">{t("change_password")}</h2>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            {pwdSuccess ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <KeyRound className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm font-medium text-green-600">Password aggiornata con successo</p>
                <button
                  onClick={() => { setPwdChangeOpen(false); resetPwdChange(); }}
                  className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
                >
                  {t("close")}
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70">{t("enter_password")}</label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground/70"
                    >
                      {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70">Nuova password</label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground/70"
                    >
                      {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70">Conferma nuova password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground/70"
                    >
                      {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {pwdError && (
                  <p className="text-xs text-red-500">{pwdError}</p>
                )}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => { setPwdChangeOpen(false); resetPwdChange(); }}
                    className="flex-1 rounded-lg border border-foreground/15 px-3 py-2.5 text-sm font-medium hover:bg-foreground/5 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={!currentPwd || !newPwd || !confirmPwd || pwdLoading}
                    className="flex-1 rounded-lg bg-foreground px-3 py-2.5 text-sm font-medium text-background disabled:opacity-50 hover:bg-foreground/90 transition-colors"
                  >
                    {pwdLoading ? "…" : t("confirm")}
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
