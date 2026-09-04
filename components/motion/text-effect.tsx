"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import type { ElementType } from "react";

type TextEffectProps = {
  children: string;
  per?: "word" | "char" | "line";
  as?: ElementType;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  className?: string;
  preset?: "blur-sm" | "fade-in-blur" | "scale" | "fade" | "slide";
  delay?: number;
  trigger?: boolean;
  speedReveal?: number;
  speedSegment?: number;
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const presetVariants: Record<string, { container: Variants; item: Variants }> = {
  "fade-in-blur": {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
    },
    item: {
      hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
      visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3 } },
    },
  },
  fade: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
    },
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
    },
  },
  scale: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
    },
    item: {
      hidden: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    },
  },
  slide: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    },
  },
  "blur-sm": {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
    },
    item: {
      hidden: { opacity: 0, filter: "blur(2px)" },
      visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.3 } },
    },
  },
};

function splitText(text: string, per: "word" | "char" | "line"): string[] {
  if (per === "char") return text.split("");
  if (per === "line") return text.split("\n");
  return text.split(" ");
}

export function TextEffect({
  children,
  per = "word",
  as: Tag = "p",
  variants,
  className,
  preset = "fade-in-blur",
  delay = 0,
  trigger = true,
  speedReveal = 1,
  speedSegment = 1,
}: TextEffectProps) {
  const segments = splitText(children, per);
  const presetVar = presetVariants[preset] ?? presetVariants["fade-in-blur"];

  const containerVariants = variants?.container ?? presetVar.container;
  const itemVariants = variants?.item ?? presetVar.item;

  const MotionTag = motion.create(Tag as never) as typeof motion.div;

  return (
    <MotionTag
      className={cn("flex flex-wrap", per === "char" && "gap-[0.01em]", className)}
      initial="hidden"
      animate={trigger ? "visible" : "hidden"}
      variants={{
        ...containerVariants,
        visible: {
          ...(containerVariants?.visible as Record<string, unknown>),
          transition: {
            staggerChildren: 0.04 / speedReveal,
          },
        },
      }}
      transition={{ delay }}
    >
      {segments.map((segment, i) => (
        <motion.span
          key={`${segment}-${i}`}
          variants={{
            ...itemVariants,
            visible: {
              ...(itemVariants?.visible as Record<string, unknown>),
              transition: {
                duration: (itemVariants?.visible as Record<string, unknown>)?.duration
                  ? ((itemVariants?.visible as Record<string, unknown>).duration as number) / speedSegment
                  : 0.3 / speedSegment,
              },
            },
          }}
          className={cn(per === "word" && "mr-[0.25em]", per === "char" && "")}
        >
          {segment}
        </motion.span>
      ))}
    </MotionTag>
  );
}
