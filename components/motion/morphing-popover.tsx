"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const MorphingPopover = PopoverPrimitive.Root;

const MorphingPopoverTrigger = PopoverPrimitive.Trigger;

const MorphingPopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-[9999] w-72 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
      >
        {children}
      </motion.div>
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
));
MorphingPopoverContent.displayName = "MorphingPopoverContent";

export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent };
