"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, LogOut, Users, LayoutDashboard, Store, Stamp, QrCode, History, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/users", label: "Utenti", icon: Users, exact: false },
  { href: "/admin/stands", label: "Stand", icon: Store, exact: false },
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/qr-codes", label: "QR Code", icon: QrCode, exact: false },
  { href: "/protected", label: "StampApp", icon: Stamp, exact: false },
];

const PAST_EDITIONS = [
  { href: "/admin/edizioni/novegro-2026", label: "Novegro Artist Alley 2026" },
];

function isActive(pathname: string, exact: boolean, href: string) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function AdminNav({ nickname }: { nickname: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [editionsOpen, setEditionsOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const editionsActive = pathname.startsWith("/admin/edizioni");
  const anyEditionActive = editionsActive || PAST_EDITIONS.some((e) => pathname.startsWith(e.href));

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

            {/* Edizioni Passate — dropdown */}
            <div className="relative">
              <button
                onClick={() => setEditionsOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  anyEditionActive
                    ? "bg-[#996C9E] text-white shadow-sm"
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                <History className="h-4 w-4" />
                Edizioni Passate
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", editionsOpen && "rotate-180")} />
              </button>
              {editionsOpen && (
                <div className="absolute left-0 z-30 mt-1 w-64 overflow-hidden rounded-md border border-foreground/15 bg-background shadow-lg">
                  {PAST_EDITIONS.map((ed) => {
                    const edActive = pathname.startsWith(ed.href);
                    return (
                      <Link
                        key={ed.href}
                        href={ed.href}
                        onClick={() => setEditionsOpen(false)}
                        className={cn(
                          "block px-3 py-2.5 text-sm transition-colors hover:bg-foreground/5",
                          edActive ? "bg-foreground/5 font-medium text-foreground" : "text-foreground/70"
                        )}
                      >
                        {ed.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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
      <div className="flex sm:hidden border-t border-foreground/10 flex-wrap">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, exact, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors min-w-0",
                active ? "text-[#996C9E] border-t-2 border-[#996C9E] -mt-px" : "text-foreground/50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
        {/* Edizioni Passate mobile — toggle */}
        <button
          onClick={() => setEditionsOpen((o) => !o)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors min-w-0",
            anyEditionActive ? "text-[#996C9E] border-t-2 border-[#996C9E] -mt-px" : "text-foreground/50"
          )}
        >
          <History className="h-5 w-5" />
          <span className="truncate">Edizioni</span>
        </button>
        {editionsOpen && (
          <div className="w-full border-t border-foreground/10 bg-background">
            {PAST_EDITIONS.map((ed) => {
              const edActive = pathname.startsWith(ed.href);
              return (
                <Link
                  key={ed.href}
                  href={ed.href}
                  onClick={() => setEditionsOpen(false)}
                  className={cn(
                    "block px-4 py-3 text-sm border-b border-foreground/5 transition-colors",
                    edActive ? "bg-foreground/5 font-medium text-foreground" : "text-foreground/70"
                  )}
                >
                  {ed.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
