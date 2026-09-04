"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

type AnimatedGroupProps = {
  children: React.ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  preset?: "fade" | "slide" | "scale" | "blur-sm" | "blur-slide";
  as?: React.ElementType;
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const presetVariants: Record<string, { container: Variants; item: Variants }> = {
  fade: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    },
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.4 } },
    },
  },
  slide: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    },
  },
  scale: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    },
    item: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    },
  },
  "blur-sm": {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    },
    item: {
      hidden: { opacity: 0, filter: "blur(4px)" },
      visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.4 } },
    },
  },
  "blur-slide": {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    },
    item: {
      hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
      visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: "easeOut" } },
    },
  },
};

export function AnimatedGroup({
  children,
  className,
  variants,
  preset = "slide",
  as: Tag = "div",
}: AnimatedGroupProps) {
  const presetVar = presetVariants[preset] ?? presetVariants.slide;
  const containerVariants = variants?.container ?? presetVar.container;
  const itemVariants = variants?.item ?? presetVar.item;

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants}>{children}</motion.div>
      }
    </motion.div>
  );
}
