"use client";

import { useState, useEffect, useRef } from "react";
import { PrizeSelectionScreen } from "./prize-selection";
import { GatchaReveal } from "./gatcha-reveal";
import {
  getAvailableStands,
  redeemStandCards,
  restoreStandCards,
  drawGatchaPrizes,
  type StandInfo,
  type GatchaResult,
} from "@/app/actions/stand-inventory";

type SelectedCard = {
  artist_id: string;
  name: string;
  prize_image_url?: string | null;
};

interface RedeemFlowProps {
  extraCount: number;
  gatchaCount: number;
  userId: string;
  nickname: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type Step = "loading" | "select" | "drawing" | "gatcha" | "done";

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
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const completedRef = useRef(false);
  const subtractedIdsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      if (!completedRef.current && subtractedIdsRef.current.length > 0) {
        restoreStandCards(subtractedIdsRef.current);
      }
    };
  }, []);

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
    const data = await getAvailableStands();
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

  const handleSelectConfirm = async (ids: string[], selectedStandInfos: StandInfo[]) => {
    setSelectedIds(ids);
    setSelectedCards(selectedStandInfos.map((s) => ({
      artist_id: s.artist_id,
      name: s.name,
      prize_image_url: s.prize_image_url,
    })));
    setIsLoading(true);
    setError(null);

    try {
      // 1. Sottrae card extra dal DB
      if (ids.length > 0) {
        const result = await redeemStandCards(ids);
        if (!result.success) {
          throw new Error(result.error ?? "Errore sottrazione card");
        }
        subtractedIdsRef.current = [...subtractedIdsRef.current, ...ids];
      }

      // 2. Estrai gatcha
      if (gatchaCount > 0) {
        setStep("drawing");
        const prizes = await drawGatchaPrizes(gatchaCount);
        setGatchaPrizes(prizes);
        setStep("gatcha");
      } else {
        setStep("done");
        completedRef.current = true;
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il riscatto");
      setStep("select");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGatchaDone = async () => {
    // Sottrai le card gatcha dal DB
    if (gatchaPrizes.length > 0) {
      const gatchaIds = gatchaPrizes.map((p) => p.artist_id);
      const result = await redeemStandCards(gatchaIds);
      if (!result.success) {
        setError(result.error ?? "Errore sottrazione card gatcha");
        return;
      }
      subtractedIdsRef.current = [...subtractedIdsRef.current, ...gatchaIds];
    }
    completedRef.current = true;
    setStep("done");
    onSuccess();
  };

  if (step === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-[#5a3d60]">Caricamento...</div>
      </div>
    );
  }

  if (step === "select") {
    return (
      <PrizeSelectionScreen
        stands={stands}
        requiredCount={extraCount}
        nickname={nickname}
        onConfirm={handleSelectConfirm}
        onCancel={onCancel}
      />
    );
  }

  if (step === "drawing") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-[#5a3d60] animate-pulse">
          Estrazione in corso...
        </div>
      </div>
    );
  }

  if (step === "gatcha") {
    return <GatchaReveal prizes={gatchaPrizes} selectedCards={selectedCards} nickname={nickname} onDone={handleGatchaDone} />;
  }

  return null;
}
