"use client";

import { useState, useEffect } from "react";
import { Menu, Settings, Globe, QrCode, LogOut, Trash2 } from "lucide-react";
import * as motion from "motion/react-client";
import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from "@/components/motion/morphing-popover";
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

export function RulesAndSettings() {
  const { lang, setLang, t } = useI18n();
  const router = useRouter();
  const [qrMode, setQrMode] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    <MorphingPopover>
      <MorphingPopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-md border border-foreground/25 bg-foreground/5 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/10">
          <Menu className="h-4 w-4" />
          <motion.span layoutId="rules-settings-label" layout="position">
            {t("rules")} & {t("settings")}
          </motion.span>
        </button>
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="w-80 max-h-[80vh] overflow-y-auto p-0">
        <div className="flex flex-col">
          {/* Header */}
          <div className="px-5 pt-5 pb-3 border-b border-foreground/10">
            <motion.h4
              layoutId="rules-settings-label"
              layout="position"
              className="text-base font-bold"
            >
              {t("rules")} & {t("settings")}
            </motion.h4>
          </div>

          {/* Regole */}
          <div className="px-5 py-4 flex flex-col gap-3 text-sm leading-relaxed text-foreground/85">
            <div>
              <p className="font-semibold text-foreground mb-1">Regole della Rally</p>
              <p>
                Colleziona un timbro con un acquisto minimo di €1 presso uno dei 51 artisti partecipanti.
                Una volta raccolti i timbri, vieni allo stand Asunicha per ritirare il tuo premio!
              </p>
            </div>

            <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-3 py-2 flex flex-col gap-1 text-xs">
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

          <div className="border-t border-foreground/10" />

          {/* Impostazioni */}
          <div className="px-5 py-4 flex flex-col gap-4">
            {/* Lingua */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Globe className="h-4 w-4" />
                {t("language")}
              </div>
              <div className="flex rounded-lg border border-foreground/15 overflow-hidden">
                <button
                  onClick={() => setLang("ITA")}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                    lang === "ITA"
                      ? "bg-foreground text-background"
                      : "text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <FlagIT className="h-3 w-3 rounded-[2px]" />
                    ITA
                  </span>
                </button>
                <button
                  onClick={() => setLang("ENG")}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                    lang === "ENG"
                      ? "bg-foreground text-background"
                      : "text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <FlagGB className="h-3 w-3 rounded-[2px]" />
                    ENG
                  </span>
                </button>
              </div>
            </div>

            {/* QR Toggle */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 bg-foreground/[0.02] px-3 py-2.5">
              <div className="flex items-start gap-2 min-w-0">
                <QrCode className="h-4 w-4 mt-0.5 text-foreground/70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium">{t("manual_qr_reader")}</p>
                  <p className="text-[10px] text-foreground/70 mt-0.5 leading-snug">
                    {t("manual_qr_desc")}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleQrMode}
                className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ${
                  qrMode ? "bg-foreground" : "bg-foreground/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                    qrMode ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-foreground/10" />

          {/* Logout & Delete */}
          <div className="px-5 py-4 flex flex-col gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-600 transition-colors hover:bg-green-500/20 dark:text-green-500"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("logout")}
            </button>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("delete_account")}
              </button>
            ) : (
              <div className="flex flex-col gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs font-medium text-red-500">{t("delete_account")}</p>
                <p className="text-[10px] text-foreground/80 leading-snug">
                  {t("delete_account_warning")}
                </p>
                <input
                  type="password"
                  placeholder={t("enter_password")}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="rounded-md border border-foreground/15 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
                />
                {deleteError && (
                  <p className="text-[10px] text-red-500">{deleteError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={resetDelete}
                    className="flex-1 rounded-md border border-foreground/15 px-2 py-1.5 text-xs font-medium hover:bg-foreground/5 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!deletePassword || deleteLoading}
                    className="flex-1 rounded-md bg-red-500 px-2 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:bg-red-600 transition-colors"
                  >
                    {deleteLoading ? t("deleting") : t("confirm")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}
