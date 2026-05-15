import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  className?: string;
  reverse?: boolean;
}

export function Marquee({ items, className, reverse }: MarqueeProps) {
  const rendered = [...items, ...items];
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max gap-16 whitespace-nowrap animate-marquee",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {rendered.map((item, idx) => (
          <span
            key={idx}
            className="font-display text-5xl text-foreground/15 md:text-7xl"
          >
            {item}
            <span className="ml-16 text-accent/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
