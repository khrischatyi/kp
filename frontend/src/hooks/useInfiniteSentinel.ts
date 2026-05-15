import * as React from "react";

/**
 * Calls `onIntersect` whenever the returned ref enters the viewport.
 * Used to drive infinite scrolling without a library.
 */
export function useInfiniteSentinel(
  onIntersect: () => void,
  options?: { enabled?: boolean; rootMargin?: string },
) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { enabled = true, rootMargin = "600px 0px" } = options ?? {};

  React.useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect();
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect, enabled, rootMargin]);

  return ref;
}
