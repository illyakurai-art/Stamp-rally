"use client";

import { useRef, useState, useEffect } from "react";

interface ScrollProgressProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export function ScrollProgress({ containerRef, className }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) {
        setProgress(0);
        return;
      }
      setProgress((scrollTop / maxScroll) * 100);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  return (
    <div
      className={`h-1 bg-[#996C9E]/20 ${className ?? ""}`}
      style={{ width: `${progress}%` }}
    />
  );
}
