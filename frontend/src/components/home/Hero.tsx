import * as React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

const HERO_SLIDES = [
  { src: "/photos/hero/bridal-trails.jpg",  blur: "/photos/hero/bridal-trails-blur.jpg" },
  { src: "/photos/hero/sammamish.jpg",      blur: "/photos/hero/sammamish-blur.jpg" },
  { src: "/photos/hero/madison-inset.jpg",  blur: "/photos/hero/madison-inset-blur.jpg" },
  { src: "/photos/hero/mid-century.jpg",    blur: "/photos/hero/mid-century-blur.jpg" },
  { src: "/photos/hero/finn-hill.jpg",      blur: "/photos/hero/finn-hill-blur.jpg" },
];

const SLIDE_DURATION = 6000;

/** Preload an image and resolve when decoded. */
function preload(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [current, setCurrent] = React.useState(0);
  const [loadedSet, setLoadedSet] = React.useState<Set<number>>(new Set());

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const subY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -50]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Preload first image immediately, then the rest in background
  React.useEffect(() => {
    preload(HERO_SLIDES[0].src).then(() => {
      setLoadedSet((s) => new Set(s).add(0));
    });
    // Preload remaining slides in background
    HERO_SLIDES.forEach((slide, i) => {
      if (i === 0) return;
      preload(slide.src).then(() => {
        setLoadedSet((s) => new Set(s).add(i));
      });
    });
  }, []);

  // Preload link for first image in <head>
  React.useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = HERO_SLIDES[0].src;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  React.useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [reduced]);

  const slide = HERO_SLIDES[current];
  const isLoaded = loadedSet.has(current);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden bg-background"
    >
      {/* Fullscreen background slideshow */}
      <div className="absolute inset-0" aria-hidden>
        {/* Blurred placeholder — always visible instantly */}
        <img
          src={slide.blur}
          alt=""
          className="absolute inset-0 size-full scale-105 object-cover blur-sm"
          draggable={false}
        />

        <AnimatePresence>
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.img
              src={slide.src}
              alt=""
              initial={{ scale: 1 }}
              animate={{ scale: reduced ? 1 : 1.08 }}
              transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
              className="size-full object-cover"
              draggable={false}
              onLoad={() => setLoadedSet((s) => new Set(s).add(current))}
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Content */}
      <div className="container relative z-10 grid min-h-[100svh] grid-cols-12 items-end gap-y-12 pb-12 pt-20 md:pt-20">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-12 mt-32 flex items-center gap-3 self-start text-xs uppercase tracking-widest2 text-white/60 md:col-span-6 md:mt-40"
        >
          <span className="size-1.5 rounded-full bg-accent" />
          <span>Seattle · Est. 1996</span>
        </motion.div>

        {/* Subtitle + CTA */}
        <motion.div
          className="col-span-12 grid grid-cols-12 items-end gap-8 md:gap-12"
          style={{ y: subY, opacity: fade }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <p className="col-span-12 max-w-md text-pretty text-base leading-relaxed text-white/70 md:col-span-5">
            Your Vision — Hand Crafted
          </p>
          <div className="col-span-12 flex flex-wrap items-center gap-4 md:col-span-7 md:justify-end">
            <Button asChild size="lg" variant="outline" className="border-white/25 text-white hover:border-white/50 hover:bg-white/[0.08]">
              <Link to="/contacts">
                Begin a Project
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
