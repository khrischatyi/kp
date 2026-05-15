import * as React from "react";
import { motion, type Variants } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** translate distance in px */
  y?: number;
  once?: boolean;
}

const variants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i,
      duration: 0.95,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/**
 * Editorial scroll-reveal — gentle slide + de-blur on viewport entry.
 * Triggered via IntersectionObserver under the hood via framer-motion's whileInView.
 */
export function Reveal({ children, delay = 0, y = 24, once = true, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2, margin: "0px 0px -80px 0px" }}
      custom={delay}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {React.Children.map(children, (c) =>
        typeof y === "number" ? c : c,
      )}
    </motion.div>
  );
}
