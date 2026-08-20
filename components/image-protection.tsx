"use client";

import { useEffect } from "react";

export function ImageProtection() {
  useEffect(() => {
    const blockContext = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "IMG" || t.closest("img"))) {
        e.preventDefault();
      }
    };
    const blockDrag = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.tagName === "IMG") {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("dragstart", blockDrag);
    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("dragstart", blockDrag);
    };
  }, []);

  return null;
}