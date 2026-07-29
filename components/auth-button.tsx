"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { useI18n } from "@/lib/i18n/context";
import { useEffect, useState } from "react";

export function AuthButton() {
  const { t } = useI18n();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  return userEmail ? (
    <div className="flex items-center gap-4">
      <span className="text-sm">Ciao, {userEmail}</span>
      <Button asChild size="sm" variant="outline">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">{t("login")}</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/auth/sign-up">{t("register")}</Link>
      </Button>
    </div>
  );
}