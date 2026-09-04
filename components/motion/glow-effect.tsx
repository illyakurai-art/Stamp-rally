"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type GlowEffectProps = {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
  mode?: "rotate" | "pulse" | "breathe" | "colorShift" | "flowHorizontal" | "static";
  blur?: number | "softest" | "soft" | "medium" | "strong" | "stronger" | "strongest" | "none";
  scale?: number;
  duration?: number;
};

const blurMap: Record<string, number> = {
  softest: 40,
  soft: 30,
  medium: 20,
  strong: 15,
  stronger: 10,
  strongest: 5,
  none: 0,
};

const modeVariants = {
  rotate: (duration: number) => ({
    rotate: [0, 360],
    transition: { duration, repeat: Infinity, ease: "linear" },
  }),
  pulse: (duration: number) => ({
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: { duration, repeat: Infinity, ease: "easeInOut" },
  }),
  breathe: (duration: number) => ({
    scale: [1, 1.1, 1],
    transition: { duration, repeat: Infinity, ease: "easeInOut" },
  }),
  colorShift: (duration: number) => ({
    filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"],
    transition: { duration, repeat: Infinity, ease: "linear" },
  }),
  flowHorizontal: (duration: number) => ({
    x: ["-50%", "50%", "-50%"],
    transition: { duration, repeat: Infinity, ease: "easeInOut" },
  }),
  static: () => ({}),
};

export function GlowEffect({
  className,
  style,
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  mode = "rotate",
  blur = "medium",
  scale = 1,
  duration = 5,
}: GlowEffectProps) {
  const blurValue = typeof blur === "number" ? blur : (blurMap[blur] ?? 20);

  const gradientColors = colors.map((c, i) => {
    const angle = (360 / colors.length) * i;
    return `${c} ${angle}deg`;
  }).join(", ");

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} style={style}>
      <motion.div
        className="absolute inset-[-50%] h-[200%] w-[200%]"
        style={{
          background: `conic-gradient(from 0deg, ${gradientColors}, ${colors[0]})`,
          filter: `blur(${blurValue}px)`,
        }}
        animate={modeVariants[mode](duration)}
        initial={{ scale }}
      />
    </div>
  );
}
