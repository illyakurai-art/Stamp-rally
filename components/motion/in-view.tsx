"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type InViewProps = {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  viewOptions?: {
    once?: boolean;
    margin?: string;
  };
};

export function InView({
  children,
  className,
  variants,
  viewOptions = {},
}: InViewProps) {
  const { once = true, margin = "0px 0px -100px 0px" } = viewOptions;
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: margin as never, once });

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants ?? {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
    >
      {children}
    </motion.div>
  );
}
