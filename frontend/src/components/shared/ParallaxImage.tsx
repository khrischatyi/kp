import * as React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  /** 0–1; how strongly the image shifts on scroll */
  strength?: number;
  priority?: boolean;
}

/**
 * Scroll-linked parallax image. Uses transform/translate3d only — no layout
 * thrash. Respects prefers-reduced-motion.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  strength = 0.25,
  priority,
}: ParallaxImageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const distance = 70 * strength;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [-distance, distance],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [1, 1, 1] : [1.08, 1.02, 1.08],
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={{ y, scale }}
        className="absolute inset-0 -top-[10%] -bottom-[10%] h-[120%] w-full object-cover will-change-transform"
      />
    </div>
  );
}
