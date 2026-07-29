"use client";

import dynamic from "next/dynamic";
import { useI18n } from "@/lib/i18n/context";

const RedeemPrizeDialog = dynamic(
  () => import("@/components/redeem-prize-dialog").then((m) => m.RedeemPrizeDialog),
  { ssr: false }
);

interface RedeemPrizeButtonProps {
  nickname: string;
  stampCount: number;
}

export function RedeemPrizeButton({ nickname, stampCount }: RedeemPrizeButtonProps) {
  const { t } = useI18n();
  return (
    <RedeemPrizeDialog nickname={nickname} stampCount={stampCount}>
      <button className="min-h-12 rounded-md border border-foreground/20 px-5 py-3 text-center text-sm font-medium transition-colors hover:bg-foreground/5 flex items-center justify-center">
        {t("redeem_prize")}
      </button>
    </RedeemPrizeDialog>
  );
}
