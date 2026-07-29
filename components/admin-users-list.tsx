"use client";

import { useState } from "react";
import { Search, QrCode } from "lucide-react";
import { AdminUserModal } from "@/components/admin-user-modal";
import { AdminQrScanner } from "@/components/admin-qr-scanner";

const TIERS = [
  { stamps: 40, label: "Full collection", color: "from-purple-500 to-indigo-500" },
  { stamps: 35, label: "16 gacha + 8 extra", color: "from-blue-500 to-cyan-500" },
  { stamps: 30, label: "12 gacha + 6 extra", color: "from-teal-500 to-emerald-500" },
  { stamps: 25, label: "8 gacha + 4 extra",  color: "from-green-500 to-lime-500" },
  { stamps: 20, label: "6 gacha + 3 extra",  color: "from-yellow-500 to-orange-400" },
  { stamps: 15, label: "4 gacha + 2 extra",  color: "from-orange-500 to-red-400" },
  { stamps: 10, label: "2 gacha + 1 extra",  color: "from-red-500 to-pink-500" },
  { stamps: 5,  label: "1 gacha",            color: "from-pink-500 to-rose-500" },
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

  const max = 40;

  return (
    <div className="flex flex-col gap-6">
      {/* Barra ricerca + bottone QR */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca nickname…"
            className="h-10 w-full rounded-lg border border-foreground/15 bg-background pl-9 pr-4 text-sm outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/20 transition-all"
          />
        </div>
        {query && (
          <span className="text-xs text-foreground/40">
            {filtered.length} risultat{filtered.length === 1 ? "o" : "i"}
          </span>
        )}
        {/* Bottone scanner QR */}
        <button
          onClick={() => setScannerOpen(true)}
          title="Scansiona QR utente"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-foreground/15 bg-background text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-colors"
        >
          <QrCode className="h-4 w-4" />
        </button>
      </div>

      {/* Griglia card — cliccabili */}
      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => {
            const tier = getTier(user.stamps);
            const progress = Math.min((user.stamps / max) * 100, 100);

            return (
              <button
                key={user.id}
                onClick={() => setSelected(user)}
                className="rounded-2xl border border-foreground/10 bg-background p-5 flex flex-col gap-4 hover:border-foreground/25 hover:shadow-sm active:scale-[0.98] transition-all text-left"
              >
                {/* Nome + badge timbri */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate text-base">{user.nickname}</p>
                    <p className="text-xs text-foreground/40 mt-0.5">
                      {new Date(user.created_at).toLocaleString("it-IT", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-baseline gap-1 rounded-full px-2.5 py-1 text-sm font-bold ${
                    user.stamps >= 40
                      ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                      : user.stamps >= 20
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : user.stamps >= 5
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      : "bg-foreground/8 text-foreground/50"
                  }`}>
                    {user.stamps}
                    <span className="text-xs font-normal opacity-60">/{max}</span>
                  </span>
                </div>

                {/* Barra progresso */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                      tier ? tier.color : "from-foreground/20 to-foreground/30"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Premio attuale */}
                <div className="rounded-lg bg-foreground/[0.03] px-3 py-2 text-xs text-foreground/60 text-center">
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
