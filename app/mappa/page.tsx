"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export default function MappaPage() {
  const { t } = useI18n();
  const [mapPath, setMapPath] = useState("/mappa.webp");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("app_config")
      .select("value")
      .eq("key", "edition_current_map")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setMapPath(data.value);
      });
  }, []);

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <div className="px-4 pt-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl"></div>
      </div>
      <div className="flex-1 mt-4 mx-auto w-full max-w-5xl px-4 sm:px-6 min-h-0">
        <TransformWrapper
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
                <img src="/map-icon.svg" alt="Mappa" width={24} height={24} className="h-6 w-6" />
                <span className="text-xl font-bold tracking-tight">{t("map")}</span>
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
              <div className="relative overflow-hidden rounded-xl border border-foreground/10 flex-1 min-h-0 mb-2" style={{ background: "#FBCFE8" }}>
                <TransformComponent wrapperClass="!w-full !h-full">
                  <div className="relative" style={{ width: 1600 }}>
                    <img
                      src={mapPath}
                      alt="Mappa"
                      className="max-w-none block"
                      style={{ width: 1600, height: "auto" }}
                      draggable={false}
                    />
                  </div>
                </TransformComponent>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl flex justify-center">
          <Link
            href="/protected"
            className="w-full min-h-12 rounded-md bg-foreground px-5 py-4 text-center text-sm font-medium text-background transition-opacity hover:opacity-90 flex items-center justify-center gap-3 sm:w-auto sm:min-w-[340px]"
            style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            <span>{t("back_to_my_area")}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
