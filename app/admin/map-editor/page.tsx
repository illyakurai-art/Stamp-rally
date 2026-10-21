"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { createClient } from "@/lib/supabase/client";
import { Map as MapIcon, Search, Trash2, Save, AlertTriangle, ZoomIn, ZoomOut, RotateCcw, MapPin, X } from "lucide-react";

type EditorArtist = {
  id: string;
  display_id: string;
  name: string;
  image_url?: string | null;
  active: boolean;
  map_x?: number | null;
  map_y?: number | null;
};

type Pos = { x: number; y: number };

const clamp = (v: number) => Math.min(100, Math.max(0, v));

export default function MapEditorPage() {
  const [artists, setArtists] = useState<EditorArtist[] | null>(null);
  const [positions, setPositions] = useState<Record<string, Pos>>({});
  const [initial, setInitial] = useState<Record<string, Pos>>({});
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [placingId, setPlacingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [snapshotMissing, setSnapshotMissing] = useState(false);
  const [mapPath, setMapPath] = useState("/mappa.webp");

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const draggingRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [artistsRes, snapshotRes, configRes] = await Promise.all([
        supabase
          .from("artists")
          .select("id, display_id, name, image_url, active, map_x, map_y")
          .not("display_id", "is", null)
          .order("display_id", { ascending: true }),
        supabase
          .from("artist_map_positions")
          .select("artist_id", { count: "exact", head: true })
          .eq("edition_key", "edition_novegro_2026"),
        supabase
          .from("app_config")
          .select("value")
          .eq("key", "edition_current_map")
          .maybeSingle(),
      ]);
      setSnapshotMissing((snapshotRes.count ?? 0) === 0);
      if (configRes.data?.value) setMapPath(configRes.data.value);
      const list = (artistsRes.data ?? []) as EditorArtist[];
      setArtists(list);
      const pos: Record<string, Pos> = {};
      for (const a of list) {
        if (a.map_x != null && a.map_y != null) pos[a.display_id] = { x: a.map_x, y: a.map_y };
      }
      setPositions(pos);
      setInitial(pos);
    })();
  }, []);

  const dirty = useMemo(() => {
    const changed: string[] = [];
    const removed: string[] = [];
    for (const [id, p] of Object.entries(positions)) {
      const init = initial[id];
      if (!init || Math.abs(init.x - p.x) > 0.001 || Math.abs(init.y - p.y) > 0.001) changed.push(id);
    }
    for (const id of Object.keys(initial)) {
      if (!(id in positions)) removed.push(id);
    }
    return { changed, removed, total: changed.length + removed.length };
  }, [positions, initial]);

  const unpositioned = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (artists ?? []).filter(
      (a) => !(a.display_id in positions) &&
        (!q || a.name.toLowerCase().includes(q) || a.display_id.toLowerCase().includes(q))
    );
  }, [artists, positions, search]);

  const positionedList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (artists ?? []).filter(
      (a) => a.display_id in positions &&
        (!q || a.name.toLowerCase().includes(q) || a.display_id.toLowerCase().includes(q))
    );
  }, [artists, positions, search]);

  const pointToPercent = (clientX: number, clientY: number): Pos | null => {
    const el = contentRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    // Precisione al centesimo di percentuale (es. 12.34%)
    const toCoord = (v: number) => Math.round(clamp(v) * 100) / 100;
    return {
      x: toCoord(((clientX - rect.left) / rect.width) * 100),
      y: toCoord(((clientY - rect.top) / rect.height) * 100),
    };
  };

  const setPos = (displayId: string, p: Pos) => {
    setPositions((prev) => ({ ...prev, [displayId]: p }));
    setSaveMsg(null);
  };

  const removePos = (displayId: string) => {
    setPositions((prev) => {
      const next = { ...prev };
      delete next[displayId];
      return next;
    });
    if (selectedId === displayId) setSelectedId(null);
    setSaveMsg(null);
  };

  const centerOn = (a: EditorArtist) => {
    const p = positions[a.display_id];
    const api = transformRef.current;
    const viewport = viewportRef.current;
    const img = imgRef.current;
    if (!p || !api || !viewport || !img) return;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;
    const contentW = 1600;
    const contentH = (1600 * nh) / nw;
    const scale = 2;
    const cx = (p.x / 100) * contentW;
    const cy = (p.y / 100) * contentH;
    api.setTransform(viewport.clientWidth / 2 - cx * scale, viewport.clientHeight / 2 - cy * scale, scale, 400);
  };

  const save = async () => {
    if (dirty.total === 0) return;
    setSaving(true);
    setSaveMsg(null);
    const ids: string[] = [];
    const xs: (number | null)[] = [];
    const ys: (number | null)[] = [];
    for (const id of dirty.changed) {
      ids.push(id);
      xs.push(positions[id].x);
      ys.push(positions[id].y);
    }
    for (const id of dirty.removed) {
      ids.push(id);
      xs.push(null);
      ys.push(null);
    }
    const supabase = createClient();
    const { error } = await supabase.rpc("save_map_positions", {
      p_artist_ids: ids,
      p_map_x: xs,
      p_map_y: ys,
    });
    setSaving(false);
    if (error) {
      setSaveMsg({ ok: false, text: `Errore salvataggio: ${error.message}` });
      return;
    }
    setInitial(positions);
    setSaveMsg({ ok: true, text: `${dirty.total} posizion${dirty.total === 1 ? "e salvata" : "i salvati"}` });
  };

  if (!artists) {
    return (
      <section className="mx-auto w-full max-w-6xl px-5 py-10">
        <p className="text-sm text-foreground/40">Caricamento artisti…</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapIcon className="h-7 w-7 text-foreground/60" />
            Editor mappa
          </h1>
          <p className="mt-1 text-sm text-foreground/50">
            Trascina i pin per posizionare gli artisti sulla mappa live. Clicca un artista non posizionato, poi clicca sulla mappa.
            Per cambiare mappa: carica il nuovo file in <span className="font-mono">public/</span> e aggiorna{" "}
            <span className="font-mono">app_config → edition_current_map</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-sm ${saveMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {saveMsg.text}
            </span>
          )}
          <button
            onClick={save}
            disabled={dirty.total === 0 || saving}
            className="flex items-center gap-2 rounded-md bg-[#996C9E] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: "4px 4px 0 rgba(0, 0, 0, 0.2)" }}
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvataggio…" : dirty.total > 0 ? `Salva posizioni (${dirty.total})` : "Salva posizioni"}
          </button>
        </div>
      </div>

      {/* Warning snapshot Novegro */}
      {snapshotMissing && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            Lo snapshot Novegro non è ancora in <span className="font-mono">artist_map_positions</span>: applica prima la migrazione{" "}
            <span className="font-mono font-semibold">add-artist-map-positions.sql</span> su Supabase. Se salvi posizioni della nuova
            edizione senza snapshot, l'archivio Novegro erediterà le coordinate sbagliate.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        {/* Mappa */}
        <div>
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            limitToBounds
            centerOnInit
            wheel={{ step: 0.1 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    Mappa edizione corrente: <span className="font-mono text-foreground/60">{mapPath}</span>
                  </span>
                  {placingId && (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#996C9E]/15 border border-[#996C9E]/30 px-3 py-1 text-xs font-medium text-[#996C9E] dark:text-purple-300">
                      <MapPin className="h-3.5 w-3.5" />
                      Clicca sulla mappa per posizionare {artists.find((a) => a.display_id === placingId)?.name}
                      <button onClick={() => setPlacingId(null)} className="ml-1 hover:opacity-70">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => zoomIn()}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-foreground/20 transition-colors hover:bg-foreground/5"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-foreground/20 transition-colors hover:bg-foreground/5"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-foreground/20 transition-colors hover:bg-foreground/5"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div
                  ref={viewportRef}
                  className="relative overflow-hidden rounded-xl border border-foreground/10 h-[70vh] min-h-[420px]"
                  style={{ background: "#FBCFE8" }}
                >
                  <TransformComponent wrapperClass="!w-full !h-full">
                    <div
                      ref={contentRef}
                      className="relative"
                      style={{ width: 1600 }}
                      onClick={(e) => {
                        if (!placingId) {
                          setSelectedId(null);
                          return;
                        }
                        const p = pointToPercent(e.clientX, e.clientY);
                        if (p) {
                          setPos(placingId, p);
                          setSelectedId(placingId);
                          setPlacingId(null);
                        }
                      }}
                    >
                      <img
                        ref={imgRef}
                        src={mapPath}
                        alt="Mappa"
                        className="max-w-none block select-none"
                        style={{ width: 1600, height: "auto" }}
                        draggable={false}
                      />
                      {positionedList.map((a) => {
                        const p = positions[a.display_id];
                        if (!p) return null;
                        const selected = selectedId === a.display_id;
                        return (
                          <div
                            key={a.id}
                            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none"
                            style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: "none" }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              draggingRef.current = a.display_id;
                              setSelectedId(a.display_id);
                              setPlacingId(null);
                              e.currentTarget.setPointerCapture(e.pointerId);
                            }}
                            onPointerMove={(e) => {
                              if (draggingRef.current !== a.display_id) return;
                              e.stopPropagation();
                              const np = pointToPercent(e.clientX, e.clientY);
                              if (np) setPos(a.display_id, np);
                            }}
                            onPointerUp={(e) => {
                              draggingRef.current = null;
                              if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                                e.currentTarget.releasePointerCapture(e.pointerId);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className={`overflow-hidden rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-all ${
                                selected
                                  ? "border-[3px] border-[#996C9E] ring-2 ring-[#996C9E]/40 scale-110"
                                  : "border-2 border-white/90 hover:scale-110"
                              }`}
                              style={{ width: 26, height: 26 }}
                            >
                              {a.image_url ? (
                                <img
                                  src={a.image_url}
                                  alt={a.name}
                                  width={104}
                                  height={104}
                                  loading="lazy"
                                  className="h-full w-full object-cover pointer-events-none"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center bg-secondary text-[11px] font-bold text-foreground/70 pointer-events-none">
                                  {a.name.charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TransformComponent>
                </div>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* Pannello laterale */}
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] overflow-hidden">
          <div className="p-3 border-b border-foreground/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca artista o codice…"
                className="w-full rounded-md border border-foreground/15 bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-[#996C9E]"
              />
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {/* Da posizionare */}
            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 px-1 py-1">
                Da posizionare ({unpositioned.length})
              </p>
              {unpositioned.length === 0 && (
                <p className="px-1 py-2 text-sm text-foreground/40">Tutti gli artisti sono posizionati.</p>
              )}
              {unpositioned.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setPlacingId(a.display_id);
                    setSelectedId(null);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-sm transition-colors ${
                    placingId === a.display_id
                      ? "bg-[#996C9E]/15 ring-1 ring-[#996C9E]/40"
                      : "hover:bg-foreground/5"
                  }`}
                >
                  <ArtistAvatar artist={a} size={28} />
                  <span className="flex-1 min-w-0">
                    <span className={`block font-medium truncate ${a.active ? "" : "opacity-50"}`}>{a.name}</span>
                    <span className="block text-xs text-foreground/40 font-mono">{a.display_id}</span>
                  </span>
                  <MapPin className="h-4 w-4 shrink-0 text-foreground/30" />
                </button>
              ))}
            </div>

            {/* Posizionati */}
            {positionedList.length > 0 && (
              <div className="px-3 py-2 border-t border-foreground/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 px-1 py-1">
                  Posizionati ({positionedList.length})
                </p>
                {positionedList.map((a) => {
                  const p = positions[a.display_id];
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center gap-2.5 rounded-lg p-2 text-sm ${
                        selectedId === a.display_id ? "bg-[#996C9E]/15 ring-1 ring-[#996C9E]/40" : ""
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedId(a.display_id);
                          setPlacingId(null);
                          centerOn(a);
                        }}
                        className="flex flex-1 min-w-0 items-center gap-2.5 text-left hover:bg-foreground/5 rounded-lg p-0.5"
                      >
                        <ArtistAvatar artist={a} size={28} />
                        <span className="flex-1 min-w-0">
                          <span className={`block font-medium truncate ${a.active ? "" : "opacity-50"}`}>{a.name}</span>
                          <span className="block text-xs text-foreground/40 font-mono">
                            {a.display_id} · {p?.x.toFixed(2)}%, {p?.y.toFixed(2)}%
                          </span>
                        </span>
                      </button>
                      <button
                        onClick={() => removePos(a.display_id)}
                        title="Rimuovi posizione"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArtistAvatar({ artist, size }: { artist: EditorArtist; size: number }) {
  return (
    <span
      className="shrink-0 overflow-hidden rounded-full border border-foreground/10 bg-white flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {artist.image_url ? (
        <img
          src={artist.image_url}
          alt={artist.name}
          width={size * 2}
          height={size * 2}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold text-foreground/40">{artist.name.charAt(0)}</span>
      )}
    </span>
  );
}
