"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ElementType } from "react";

type TextShimmerProps = {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

export function TextShimmer({
  children,
  as: Tag = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  return (
    <Tag className={cn("relative inline-block", className)}>
      <span className="relative z-10 bg-[linear-gradient(90deg,var(--base-color)_0%,var(--base-gradient-color)_50%,var(--base-color)_100%)] bg-[length:200%_100%] bg-clip-text text-transparent [background-clip:text] [-webkit-background-clip:text]">
        {children}
      </span>
      <motion.span
        className="absolute inset-0 z-20 bg-[linear-gradient(90deg,transparent_0%,var(--base-gradient-color)_50%,transparent_100%)] bg-[length:200%_100%] bg-clip-text text-transparent [background-clip:text] [-webkit-background-clip:text]"
        style={{ "--spread": spread } as React.CSSProperties}
        animate={{
          backgroundPosition: ["200% center", "-200% center"],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}
