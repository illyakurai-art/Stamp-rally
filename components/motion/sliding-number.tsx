"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SlidingNumberProps = {
  value: number;
  padStart?: boolean;
  decimalSeparator?: string;
  className?: string;
};

function AnimatedDigit({ digit, className }: { digit: string; className?: string }) {
  const spring = useSpring(0, { stiffness: 300, damping: 30 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    spring.set(Number(digit));
  }, [digit, spring]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => setCurrent(v));
    return unsubscribe;
  }, [display]);

  if (digit === ":") {
    return <span className={cn("inline-block", className)}>:</span>;
  }

  return (
    <span className={cn("relative inline-block overflow-hidden", className)}>
      <span className="invisible">0</span>
      <motion.span className="absolute inset-0 flex items-center justify-center">
        {current}
      </motion.span>
    </span>
  );
}

export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = ".",
  className,
}: SlidingNumberProps) {
  const str = String(value);
  const [intPart, decPart] = str.split(decimalSeparator);
  const paddedInt = padStart && intPart.length < 2 ? intPart.padStart(2, "0") : intPart;

  return (
    <span className={cn("inline-flex items-center", className)}>
      {paddedInt.split("").map((char, i) => (
        <AnimatedDigit key={`int-${i}`} digit={char} />
      ))}
      {decPart && (
        <>
          <AnimatedDigit digit={decimalSeparator} />
          {decPart.split("").map((char, i) => (
            <AnimatedDigit key={`dec-${i}`} digit={char} />
          ))}
        </>
      )}
    </span>
  );
}
