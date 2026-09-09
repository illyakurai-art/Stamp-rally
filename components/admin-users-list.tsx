"use client";

import { useState } from "react";
import { Search, QrCode, Crown } from "lucide-react";
import { AdminUserModal } from "@/components/admin-user-modal";
import { AdminQrScanner } from "@/components/admin-qr-scanner";
import { getStampsDarkGradient } from "@/lib/stamp-gradient";

const TIERS = [
  { stamps: 50, label: "Full collection" },
  { stamps: 45, label: "24 gacha + 12 extra" },
  { stamps: 40, label: "20 gacha + 10 extra" },
  { stamps: 35, label: "16 gacha + 8 extra" },
  { stamps: 30, label: "12 gacha + 6 extra" },
  { stamps: 25, label: "8 gacha + 4 extra" },
  { stamps: 20, label: "6 gacha + 3 extra" },
  { stamps: 15, label: "4 gacha + 2 extra" },
  { stamps: 10, label: "2 gacha + 1 extra" },
  { stamps: 5,  label: "1 gacha" },
];

function getTier(stamps: number) {
  return TIERS.find((t) => stamps >= t.stamps) ?? null;
}

export interface UserEntry {
  id: string;
  nickname: string;
  display_id: string | null;
  created_at: string;
  stamps: number;
  kkUnlocked?: boolean;
}

export function AdminUsersList({ users }: { users: UserEntry[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<UserEntry | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [initialView, setInitialView] = useState<"main" | "confirm">("main");

  const filtered = query.trim()
    ? users.filter((u) =>
        u.nickname.toLowerCase().includes(query.trim().toLowerCase())
      )
    : users;

  const max = 50;

  return (
    <div className="flex flex-col gap-6">
      {/* Bottone scanner QR — sopra la ricerca, stessa larghezza */}
      <button
        onClick={() => setScannerOpen(true)}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#996C9E] px-5 text-base font-semibold text-white shadow-sm hover:bg-[#8a5f8e] transition-colors"
        style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
      >
        <QrCode className="h-6 w-6 shrink-0" />
        Scansiona QR utente
      </button>

      {/* Barra ricerca */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca nickname…"
            className="h-10 w-full rounded-lg border border-foreground/15 bg-[#C5A3C9] pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-foreground/60 focus:border-foreground/30 focus:ring-2 focus:ring-foreground/20 transition-all"
            style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
          />
        </div>
        {query && (
          <span className="text-xs text-foreground/40">
            {filtered.length} risultat{filtered.length === 1 ? "o" : "i"}
          </span>
        )}
      </div>

      {/* Griglia card — cliccabili */}
      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => {
            const tier = getTier(user.stamps);
            const progress = Math.min((user.stamps / max) * 100, 100);

            const isGold = user.stamps >= 51;

            return (
              <button
                key={user.id}
                onClick={() => setSelected(user)}
                className={`rounded-2xl border p-5 flex flex-col gap-4 hover:shadow-lg active:scale-[0.98] transition-all text-left ${
                  isGold
                    ? "border-yellow-400/60 hover:border-yellow-400"
                    : "border-foreground/10 hover:border-foreground/25"
                }`}
                style={{
                  background: isGold
                    ? "linear-gradient(135deg, #D4A017 0%, #F5D060 30%, #FFED8A 50%, #F5D060 70%, #D4A017 100%)"
                    : getStampsDarkGradient(user.stamps),
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {user.kkUnlocked && <Crown className="h-4 w-4 text-yellow-400 shrink-0 fill-yellow-400" />}
                      <p className={`font-semibold text-base drop-shadow-sm ${user.kkUnlocked ? "text-yellow-300" : "text-white"}`}>{user.nickname}</p>
                    </div>
                    <p className="text-xs text-white/80 mt-1">
                      {user.display_id ?? "—"} ·{" "}
                      {new Date(user.created_at).toLocaleString("it-IT", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-baseline gap-1 rounded-full px-2.5 py-1 text-sm font-bold ${
                    isGold ? "bg-yellow-900/40 text-yellow-900" : "bg-white/25 text-white"
                  }`}>
                    {user.stamps}
                    <span className="text-xs font-normal opacity-70">/{max}</span>
                  </span>
                </div>

                {/* Barra progresso */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full rounded-full bg-white/80 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Premio attuale */}
                <div className="rounded-lg bg-white/20 px-3 py-2 text-xs text-white text-center font-medium backdrop-blur-sm">
                  {tier ? tier.label : "Nessun premio ancora"}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-foreground/40 gap-2">
          <Search className="h-8 w-8" />
          <p className="text-sm">
            {query ? `Nessun utente trovato per "${query}"` : "Nessun utente registrato."}
          </p>
        </div>
      )}

      {/* Scanner QR admin */}
      <AdminQrScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onUserFound={(user) => {
          setInitialView("confirm");
          setSelected(user);
        }}
      />

      {/* Modal utente selezionato */}
      {selected && (
        <AdminUserModal
          userId={selected.id}
          nickname={selected.nickname}
          stampCount={selected.stamps}
          open={!!selected}
          initialView={initialView}
          onClose={() => { setSelected(null); setInitialView("main"); }}
        />
      )}
    </div>
  );
}
