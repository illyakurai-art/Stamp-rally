"use client";

import { useState, useEffect } from "react";
import { PrizeSelectionScreen } from "./prize-selection";
import { GatchaReveal } from "./gatcha-reveal";
import {
  getAvailableStands,
  redeemStandCards,
  drawGatchaPrizes,
  type StandInfo,
  type GatchaResult,
} from "@/app/actions/stand-inventory";

interface RedeemFlowProps {
  extraCount: number;
  gatchaCount: number;
  userId: string;
  nickname: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type Step = "loading" | "select" | "confirm" | "drawing" | "gatcha" | "done";

export function RedeemFlow({
  extraCount,
  gatchaCount,
  userId,
  nickname,
  onSuccess,
  onCancel,
}: RedeemFlowProps) {
  const [step, setStep] = useState<Step>("loading");
  const [stands, setStands] = useState<StandInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [gatchaPrizes, setGatchaPrizes] = useState<GatchaResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (extraCount === 0) {
      // Solo gatcha, niente selezione
      handleJustGatcha();
    } else {
      loadStands();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStands = async () => {
    console.log("[RedeemFlow] loading stands...");
    const data = await getAvailableStands();
    console.log("[RedeemFlow] stands loaded:", data.length, data);
    setStands(data);
    setStep("select");
  };

  const handleJustGatcha = async () => {
    setStep("drawing");
    try {
      // Sottrai card per gatcha direttamente
      const prizes = await drawGatchaPrizes(gatchaCount);
      setGatchaPrizes(prizes);
      setStep("gatcha");
    } catch {
      setError("Errore nell'estrazione gatcha");
      setStep("select");
    }
  };

  const handleSelectConfirm = async (ids: string[]) => {
    setSelectedIds(ids);
    setStep("confirm");
  };

  const handleConfirmRedeem = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Sottrae card extra dal DB
      if (selectedIds.length > 0) {
        const result = await redeemStandCards(selectedIds);
        if (!result.success) {
          throw new Error(result.error ?? "Errore sottrazione card");
        }
      }

      // 2. Estrai gatcha
      if (gatchaCount > 0) {
        setStep("drawing");
        const prizes = await drawGatchaPrizes(gatchaCount);
        setGatchaPrizes(prizes);
        setStep("gatcha");
      } else {
        setStep("done");
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il riscatto");
      setStep("confirm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGatchaDone = () => {
    setStep("done");
    onSuccess();
  };

  if (step === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-white/60">Caricamento...</div>
      </div>
    );
  }

  if (step === "select") {
    return (
      <PrizeSelectionScreen
        stands={stands}
        requiredCount={extraCount}
        onConfirm={handleSelectConfirm}
        onCancel={onCancel}
      />
    );
  }

  if (step === "confirm") {
    const selectedStands = stands.filter((s) =>
      selectedIds.includes(s.artist_id)
    );

    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white text-center">
          Conferma riscatto
        </h3>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/70 mb-2">
            <span className="font-semibold text-white">{nickname}</span> riscuote:
          </p>
          {selectedStands.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-white/50 mb-1">Extra ({selectedStands.length} card):</p>
              {selectedStands.map((s) => (
                <p key={s.artist_id} className="text-sm text-white pl-2">
                  • {s.name} <span className="text-white/50">({s.artist_id})</span>
                </p>
              ))}
            </div>
          )}
          {gatchaCount > 0 && (
            <p className="text-xs text-white/50">
              Gatcha: {gatchaCount} card da estrarre
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep("select")}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5"
          >
            Indietro
          </button>
          <button
            type="button"
            onClick={handleConfirmRedeem}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-[#996C9E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8a5f8e] disabled:opacity-40"
          >
            {isLoading ? "Elaborazione..." : "Conferma e procedi"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "drawing") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-white/60 animate-pulse">
          Estrazione in corso...
        </div>
      </div>
    );
  }

  if (step === "gatcha") {
    return <GatchaReveal prizes={gatchaPrizes} onDone={handleGatchaDone} />;
  }

  return null;
}
