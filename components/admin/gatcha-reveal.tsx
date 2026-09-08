"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { GatchaResult } from "@/app/actions/stand-inventory";
import { ScrollProgress } from "@/components/ui/scroll-progress";

interface GatchaRevealProps {
  prizes: GatchaResult[];
  nickname: string;
  onDone: () => void;
}

export function GatchaReveal({ prizes, nickname, onDone }: GatchaRevealProps) {
  const [flipped, setFlipped] = useState<boolean[]>(
    () => new Array(prizes.length).fill(false)
  );
  const [allDone, setAllDone] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    prizes.forEach((_, i) => {
      setTimeout(() => {
        setFlipped((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 600 + i * 400);
    });

    const total = 600 + prizes.length * 400 + 600;
    const timer = setTimeout(() => setAllDone(true), total);
    return () => clearTimeout(timer);
  }, [prizes]);

  return (
    <div className="flex flex-col items-center gap-6">
      <h3 className="text-lg font-bold text-[#2D1B33]">
        Estrazione Gatcha di {nickname}
      </h3>

      <div
        ref={listRef}
        className="relative w-full max-h-[50vh] overflow-y-auto scrollbar-hide"
      >
        <div className="sticky top-0 left-0 w-full z-10">
          <ScrollProgress containerRef={listRef} className="w-full" />
        </div>
        <div className="flex flex-wrap justify-center gap-4 p-4">
          {prizes.map((prize, i) => (
            <div key={prize.artist_id} className="gatcha-card-wrapper">
              <div className={`gatcha-card ${flipped[i] ? "flipped" : ""}`}>
                {/* Front — coperta */}
                <div className="gatcha-card-face gatcha-card-front">
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-4xl">?</span>
                    <span className="text-xs text-white/50 mt-1">???</span>
                  </div>
                </div>
                {/* Back — premio */}
                <div className="gatcha-card-face gatcha-card-back">
                  {prize.prize_image_url ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={prize.prize_image_url}
                        alt={prize.name ?? prize.artist_id}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-6">
                        <span className="text-xs font-bold text-white text-center leading-tight block">
                          {prize.name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <span className="text-lg font-bold text-white text-center leading-tight">
                        {prize.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {allDone && (
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <p className="text-sm text-emerald-600 font-medium">
            Riscatto completato!
          </p>
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg bg-[#996C9E] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8a5f8e]"
          >
            Cards Consegnate
          </button>
        </div>
      )}

      <style jsx>{`
        .gatcha-card-wrapper {
          perspective: 1000px;
          width: 120px;
          height: 160px;
        }
        .gatcha-card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s ease;
        }
        .gatcha-card.flipped {
          transform: rotateY(180deg);
        }
        .gatcha-card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          border-radius: 16px;
          overflow: hidden;
        }
        .gatcha-card-front {
          background: linear-gradient(135deg, #996C9E 0%, #7d4d7f 100%);
          border: 2px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gatcha-card-front::before {
          content: '';
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
        }
        .gatcha-card-back {
          background: linear-gradient(135deg, #3D2545 0%, #2D1B33 100%);
          border: 2px solid rgba(153, 108, 158, 0.5);
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
