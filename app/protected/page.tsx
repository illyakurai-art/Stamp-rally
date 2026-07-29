"use client";

import { Suspense } from "react";
import { useI18n } from "@/lib/i18n/context";
import { ProtectedDashboard } from "@/components/protected-dashboard";

function ProtectedPageFallback() {
  const { t } = useI18n();
  return <div>{t("loading")}</div>;
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<ProtectedPageFallback />}>
      <ProtectedDashboard />
    </Suspense>
  );
}