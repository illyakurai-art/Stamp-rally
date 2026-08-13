"use client";

import { useState, useEffect } from "react";
import { Settings, LogOut, Trash2, Globe, QrCode } from "lucide-react";
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
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-1">Account</p>
            <h2 className="text-xl font-bold">{t("settings")}</h2>
          </div>

          <div className="px-6 py-5 flex flex-col gap-5">

            {/* Lingua */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                <Globe className="h-4 w-4" />
                {t("language")}
              </div>
              <div className="flex rounded-lg border border-foreground/15 overflow-hidden">
                <button
                  onClick={() => setLang("ITA")}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    lang === "ITA"
                      ? "bg-foreground text-background"
                      : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  Italiano
                </button>
                <button
                  onClick={() => setLang("ENG")}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    lang === "ENG"
                      ? "bg-foreground text-background"
                      : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* QR Toggle */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3.5">
              <div className="flex items-start gap-3 min-w-0">
                <QrCode className="h-4 w-4 mt-0.5 text-foreground/50 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t("manual_qr_reader")}</p>
                  <p className="text-xs text-foreground/50 mt-0.5 leading-snug">
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

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-foreground/15 px-4 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
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
                <p className="text-xs text-foreground/60 leading-snug">
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
    </>
  );
}
