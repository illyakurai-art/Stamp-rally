"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, LogOut, Users, LayoutDashboard, Store, Stamp, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/users", label: "Utenti", icon: Users, exact: false },
  { href: "/admin/stands", label: "Stand", icon: Store, exact: false },
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/qr-codes", label: "QR Code", icon: QrCode, exact: false },
  { href: "/protected", label: "StampApp", icon: Stamp, exact: false },
];

function isActive(pathname: string, exact: boolean, href: string) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function AdminNav({ nickname }: { nickname: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <nav className="w-full border-b border-foreground/10 bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <ShieldCheck className="h-5 w-5 text-foreground/70" />
            <span>Admin</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(pathname, exact, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#996C9E] text-white shadow-sm"
                      : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-foreground/50">
            Staff: <span className="font-medium text-foreground/70">{nickname}</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-md border border-foreground/20 px-3 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Esci</span>
          </button>
        </div>
      </div>

      {/* Nav mobile */}
      <div className="flex sm:hidden border-t border-foreground/10">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, exact, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                active ? "text-[#996C9E] border-t-2 border-[#996C9E] -mt-px" : "text-foreground/50"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
