"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { GatchaResult } from "@/app/actions/stand-inventory";
import { ScrollProgress } from "@/components/ui/scroll-progress";

type SelectedCard = {
  artist_id: string;
  name: string;
  prize_image_url?: string | null;
};

interface GatchaRevealProps {
  prizes: GatchaResult[];
  selectedCards?: SelectedCard[];
  nickname: string;
  onDone: () => void;
}

export function GatchaReveal({ prizes, selectedCards = [], nickname, onDone }: GatchaRevealProps) {
  const [flipped, setFlipped] = useState<boolean[]>(
    () => new Array(prizes.length).fill(false)
  );
  const [allDone, setAllDone] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
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

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setScrolledToEnd(isAtBottom);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={listRef}
        className="relative w-full max-h-[50vh] overflow-y-auto scrollbar-hide"
      >
        <div className="sticky top-0 left-0 w-full z-10">
          <ScrollProgress containerRef={listRef} className="w-full" />
        </div>

        {/* Card selezionate manualmente */}
        {selectedCards.length > 0 && (
          <div className="p-4 pb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#996C9E] mb-3">Card selezionate</p>
            <div className="grid grid-cols-3 gap-1">
              {selectedCards.map((card) => (
                <div key={card.artist_id} className="gatcha-card-wrapper">
                  <div className="gatcha-card flipped">
                    <div className="gatcha-card-face gatcha-card-front">
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-4xl">?</span>
                        <span className="text-xs text-white/50 mt-1">???</span>
                      </div>
                    </div>
                    <div className="gatcha-card-face gatcha-card-back">
                      {card.prize_image_url ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={card.prize_image_url}
                            alt={card.name}
                            fill
                            className="object-cover"
                            sizes="clamp(80px, 20vw, 140px)"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-6">
                            <span className="text-[10px] font-bold text-white text-center leading-tight block line-clamp-2">
                              {card.name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                          <span className="text-lg font-bold text-white text-center leading-tight">
                            {card.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Separatore */}
        {selectedCards.length > 0 && prizes.length > 0 && (
          <div className="mx-4 border-t border-[#996C9E]/30" />
        )}

        {/* Card estratte dal gatcha */}
        {selectedCards.length > 0 && prizes.length > 0 && (
          <div className="px-4 pt-2 pb-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#996C9E] mb-3">Estrazione Gacha</p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1 px-4 pb-4">
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
                        <span className="text-[10px] font-bold text-white text-center leading-tight block line-clamp-2">
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

      <div className="h-10">
        {allDone && scrolledToEnd && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg bg-[#996C9E] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8a5f8e] animate-in fade-in duration-300"
          >
            Cards Consegnate
          </button>
        )}
      </div>

      <style jsx>{`
        .gatcha-card-wrapper {
          perspective: 1000px;
          width: clamp(80px, 20vw, 140px);
          height: clamp(107px, 26.6vw, 187px);
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
