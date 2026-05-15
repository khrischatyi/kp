import * as React from "react";

import { cn } from "@/lib/utils";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspect?: string; // CSS aspect-ratio value, e.g. "4 / 5"
  rounded?: boolean;
  priority?: boolean;
}

/**
 * Lazy, fade-in image with a shimmer skeleton. Reserves space via
 * aspect-ratio to avoid layout shift.
 */
export function SmartImage({
  src,
  alt,
  aspect = "4 / 5",
  rounded,
  priority,
  className,
  ...rest
}: SmartImageProps) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/60",
        rounded && "rounded-md",
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {/* Shimmer */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100",
          "bg-[linear-gradient(110deg,hsl(var(--muted)),45%,hsl(var(--muted)/0.55),55%,hsl(var(--muted)))] bg-[length:200%_100%] animate-shimmer",
        )}
      />
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "absolute inset-0 size-full object-cover transition-[opacity,transform,filter] duration-1000 ease-editorial will-change-transform",
          loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-[1.03]",
        )}
        {...rest}
      />
    </div>
  );
}
