import * as React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ParallaxImage } from "@/components/shared/ParallaxImage";

interface HeroProps {
  cover: string | null;
  secondaryCover?: string | null;
  tertiaryCover?: string | null;
}

export function Hero({ cover, secondaryCover, tertiaryCover }: HeroProps) {
  const ref = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY  = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -90]);
  const subY    = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -50]);
  const fade    = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const imageY  = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 140]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden bg-background pt-20"
    >
      {/* Background gradient + grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(70% 60% at 80% 30%, hsl(var(--accent) / 0.10), transparent 70%), radial-gradient(80% 60% at 10% 90%, hsl(var(--accent) / 0.06), transparent 70%)",
        }}
      />

      <div className="container relative grid min-h-[88svh] grid-cols-12 items-end gap-y-12 pb-12 pt-10 md:pt-20">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-12 flex items-center gap-3 text-xs uppercase tracking-widest2 text-muted-foreground md:col-span-6"
        >
          <span className="size-1.5 rounded-full bg-accent" />
          <span>Seattle · Est. 2008</span>
          <span className="h-px w-10 bg-foreground/30" />
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
            className="font-display text-display-xl text-balance text-foreground"
          >
            <span className="block">A kitchen, drawn</span>
            <span className="block italic text-foreground/80">
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
          <p className="col-span-12 max-w-md text-pretty text-base leading-relaxed text-foreground/75 md:col-span-5">
            Designing and building kitchens for homes across the Greater Seattle
            area — every piece joined, sanded, and finished by hand in our Monroe
            workshop.
          </p>
          <div className="col-span-12 flex flex-wrap items-center gap-4 md:col-span-7 md:justify-end">
            <Button asChild size="lg" variant="primary">
              <Link to="/galleries">
                View the Portfolio
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contacts">Begin a Project</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Cinematic feature composition — main image + two stacked landscape
          companions. All ratios match the source photos so no awkward cropping. */}
      {cover && (
        <motion.div
          style={{ y: imageY }}
          className="relative mx-auto w-full max-w-[1500px] px-4 md:px-10"
        >
          <div className="grid grid-cols-12 gap-3 md:gap-5">
            {/* Main image */}
            <div className="relative col-span-12 overflow-hidden rounded-md md:col-span-8">
              <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[3/2]">
                <ParallaxImage
                  src={cover}
                  alt="Featured kitchen — Woodmore Kitchens portfolio"
                  priority
                  strength={0.3}
                  className="size-full"
                />
              </div>
            </div>

            {/* Side stack — two stacked landscape companions, total height
                matches the main image. */}
            <div className="col-span-12 grid grid-cols-2 gap-3 md:col-span-4 md:grid-cols-1 md:gap-5">
              {secondaryCover && (
                <div className="relative overflow-hidden rounded-md">
                  <div className="relative aspect-[16/10] w-full">
                    <ParallaxImage
                      src={secondaryCover}
                      alt="A second kitchen from the portfolio"
                      strength={0.4}
                      className="size-full"
                    />
                  </div>
                </div>
              )}
              {tertiaryCover && (
                <div className="relative overflow-hidden rounded-md">
                  <div className="relative aspect-[16/10] w-full">
                    <ParallaxImage
                      src={tertiaryCover}
                      alt="A third kitchen from the portfolio"
                      strength={0.5}
                      className="size-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Caption row — subtle, no numbering */}
          <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-widest2 text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ArrowDownRight className="size-4 text-accent" />
              Scroll for more
            </span>
            <span>Made in Monroe, Washington</span>
          </div>
        </motion.div>
      )}
    </section>
  );
}
