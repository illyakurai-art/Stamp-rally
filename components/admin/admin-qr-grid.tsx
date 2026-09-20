"use client";

import { useState } from "react";
import { Search, Download, ExternalLink } from "lucide-react";

interface ArtistQR {
  display_id: string;
  name: string;
  qr_token: string;
  filename: string;
}

export function AdminQrGrid({ artists }: { artists: ArtistQR[] }) {
  const [query, setQuery] = useState("");

  const filtered = artists.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.display_id.toLowerCase().includes(q) ||
      a.qr_token.toLowerCase().includes(q)
    );
  });

  const downloadPng = (artist: ArtistQR) => {
    const a = document.createElement("a");
    a.href = `/qr-stand/${artist.filename}`;
    a.download = artist.filename;
    a.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Cerca artista..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-foreground/15 bg-foreground/[0.02] pl-9 pr-4 text-sm outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <span className="text-xs text-foreground/40 shrink-0">
          {filtered.length} QR
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((artist) => (
          <div
            key={artist.display_id}
            className="flex flex-col items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4"
          >
            <div className="rounded-lg overflow-hidden bg-white p-1 shadow-sm">
        <img
          src={`/qr-stand/${artist.filename}`}
          alt={`QR ${artist.name}`}
          width={150}
          height={150}
          className="w-[150px] h-[150px] object-contain"
        />
            </div>
            <p className="text-xs font-semibold text-center truncate w-full">
              {artist.name}
            </p>
            <p className="text-[10px] text-foreground/40 font-mono">
              {artist.display_id}
            </p>
            <p className="text-[10px] text-foreground/30 font-mono truncate w-full text-center">
              {artist.qr_token}
            </p>
            <button
              onClick={() => downloadPng(artist)}
              className="flex items-center gap-1 rounded-md border border-foreground/15 px-3 py-1.5 text-xs font-medium text-foreground/60 hover:bg-foreground/5 transition-colors"
            >
              <Download className="h-3 w-3" />
              PNG
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
