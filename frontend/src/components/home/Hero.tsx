import * as React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const HERO_IMAGES = [
  "/photos/2 Clide Hill/CLYDE HILL1.jpg",
  "/photos/4 beaver lake/Kitchen Modified Shaker Island with Walnut Butcher Block.jpg",
  "/photos/19 mid century/MID CENTUREY 2.jpg",
  "/photos/15 edmonds/Edmonds_House_13D.jpg",
  "/photos/18 jouce/Kitchen Bridal Trails 1.jpg",
];

const SLIDE_DURATION = 6000;

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [current, setCurrent] = React.useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -90]);
  const subY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -50]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  React.useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % HERO_IMAGES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [reduced]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden bg-background"
    >
      {/* Fullscreen background slideshow */}
      <div className="absolute inset-0" aria-hidden>
        <AnimatePresence initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.img
              src={HERO_IMAGES[current]}
              alt=""
              initial={{ scale: 1 }}
              animate={{ scale: reduced ? 1 : 1.08 }}
              transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
              className="size-full object-cover"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Content */}
      <div className="container relative z-10 grid min-h-[100svh] grid-cols-12 items-end gap-y-12 pb-12 pt-20 md:pt-20">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-12 flex items-center gap-3 text-xs uppercase tracking-widest2 text-white/60 md:col-span-6"
        >
          <span className="size-1.5 rounded-full bg-accent" />
          <span>Seattle · Est. 2008</span>
          <span className="h-px w-10 bg-white/30" />
          <span>Bespoke kitchens · Heirloom cabinetry</span>
        </motion.div>

        {/* Title */}
        <motion.div
          className="col-span-12 md:col-span-9"
          style={{ y: titleY, opacity: fade }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-display-xl text-balance text-white"
          >
            <span className="block">A kitchen, drawn</span>
            <span className="block italic text-white/80">
              from the grain of the&nbsp;
              <span className="text-accent">wood</span>.
            </span>
          </motion.h1>
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
            Designing and building kitchens for homes across the Greater Seattle
            area — every piece joined, sanded, and finished by hand in our Monroe
            workshop.
          </p>
          <div className="col-span-12 flex flex-wrap items-center gap-4 md:col-span-7 md:justify-end">
            <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]">
              <Link to="/galleries">
                View the Portfolio
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
            </Button>
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
