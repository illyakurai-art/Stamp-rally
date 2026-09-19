"use client";

import { useState, useEffect, useRef } from "react";
import { PrizeSelectionScreen } from "./prize-selection";
import { GatchaReveal } from "./gatcha-reveal";
import {
  getAvailableStands,
  redeemStandCards,
  drawGatchaPrizes,
  type StandInfo,
  type GatchaResult,
} from "@/app/actions/stand-inventory";

type SelectedCard = {
  artist_id: string;
  name: string;
  prize_image_url?: string | null;
};

export type AssignedCard = {
  artist_id: string;
  source: "extra" | "gatcha";
};

interface RedeemFlowProps {
  extraCount: number;
  gatchaCount: number;
  nickname: string;
  onSuccess: () => void;
  onCancel: () => void;
  onCardsAssigned?: (cards: AssignedCard[]) => void;
  subtractedIdsRef?: React.MutableRefObject<string[]>;
  completedRef?: React.MutableRefObject<boolean>;
}

type Step = "loading" | "select" | "drawing" | "gatcha" | "done";

export function RedeemFlow({
  extraCount,
  gatchaCount,
  nickname,
  onSuccess,
  onCancel,
  onCardsAssigned,
  subtractedIdsRef: externalSubtractedIdsRef,
  completedRef: externalCompletedRef,
}: RedeemFlowProps) {
  const [step, setStep] = useState<Step>("loading");
  const [stands, setStands] = useState<StandInfo[]>([]);
  const [gatchaPrizes, setGatchaPrizes] = useState<GatchaResult[]>([]);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const internalCompletedRef = useRef(false);
  const internalSubtractedIdsRef = useRef<string[]>([]);
  const completedRef = externalCompletedRef ?? internalCompletedRef;
  const subtractedIdsRef = externalSubtractedIdsRef ?? internalSubtractedIdsRef;

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
      const prizes = await drawGatchaPrizes(gatchaCount);
      setGatchaPrizes(prizes);
      setStep("gatcha");
    } catch {
      setStep("select");
    }
  };

  const handleSelectConfirm = async (ids: string[], selectedStandInfos: StandInfo[]) => {
    setSelectedCards(selectedStandInfos.map((s) => ({
      artist_id: s.artist_id,
      name: s.name,
      prize_image_url: s.prize_image_url,
    })));

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
        // Solo extra, niente gatcha
        const assignedCards: AssignedCard[] = selectedStandInfos.map((s) => ({
          artist_id: s.artist_id,
          source: "extra",
        }));
        onCardsAssigned?.(assignedCards);
        setStep("done");
        completedRef.current = true;
        onSuccess();
      }
    } catch {
      setStep("select");
    }
  };

  const handleGatchaDone = async () => {
    if (gatchaPrizes.length > 0) {
      const gatchaIds = gatchaPrizes.map((p) => p.artist_id);
      const result = await redeemStandCards(gatchaIds);
      if (!result.success) return;
      subtractedIdsRef.current = [...subtractedIdsRef.current, ...gatchaIds];
    }

    // Raccogli tutte le card assegnate (extra + gatcha)
    const assignedCards: AssignedCard[] = [
      ...selectedCards.map((c) => ({ artist_id: c.artist_id, source: "extra" as const })),
      ...gatchaPrizes.map((p) => ({ artist_id: p.artist_id, source: "gatcha" as const })),
    ];
    onCardsAssigned?.(assignedCards);

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
