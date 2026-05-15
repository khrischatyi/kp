import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import * as React from "react";

import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { SmartImage } from "@/components/shared/SmartImage";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/api";

interface Props {
  projects: Project[];
}

/**
 * Selected Works — a scroll-driven stack of full-viewport panels. Each
 * project takes one screen; image and copy sit side-by-side, alternating
 * orientation per project. `scroll-snap-align: start` on each panel
 * combined with `scroll-snap-type: y proximity` on <html> gives the page
 * a gentle magnetism so the eye lands on one project at a time.
 */
export function FeaturedProjects({ projects }: Props) {
  const featured = projects.slice(0, 6);
  if (featured.length === 0) return null;

  return (
    <section className="relative">
      {/* Intro */}
      <div className="container pt-4 pb-12 md:pt-10 md:pb-20">
        <div className="grid grid-cols-12 gap-y-8 md:gap-x-12">
          <div className="col-span-12 md:col-span-5">
            <SectionLabel>Selected Works</SectionLabel>
            <Reveal className="mt-6">
              <h2 className="font-display text-display-md text-balance">
                Each project, its own architecture.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.05} className="col-span-12 md:col-span-6 md:col-start-7">
            <p className="text-pretty text-foreground/70 md:text-lg">
              We design from the site outward — the geometry of the room, the
              quality of light, the way a family lives — and let the cabinetry
              follow. No two kitchens repeat. Scroll through a few favourites.
            </p>
            <Link
              to="/galleries"
              className="group mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-widest2 text-foreground hover:text-accent"
            >
              All projects
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>
      </div>

      {/* The scroll-snap panels */}
      <div className="relative">
        {featured.map((p, idx) => (
          <ProjectPanel key={p.slug} project={p} index={idx} />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel
// ─────────────────────────────────────────────────────────────────────────────

interface PanelProps {
  project: Project;
  index: number;
}

function ProjectPanel({ project, index }: PanelProps) {
  const ref = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reversed = index % 2 === 1;

  // Parallax only fires on desktop. On touch devices the y-transforms fight
  // the user's finger and make scroll feel sluggish.
  const enableParallax = isDesktop && !reduced;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imgY = useTransform(
    scrollYProgress,
    [0, 1],
    enableParallax ? ["-6%", "6%"] : ["0%", "0%"],
  );
  const textY = useTransform(
    scrollYProgress,
    [0, 1],
    enableParallax ? ["8%", "-8%"] : ["0%", "0%"],
  );

  return (
    <article
      ref={ref}
      className={cn(
        "relative scroll-mt-20 py-10",
        // Desktop: full viewport panel + gentle snap. Mobile: natural flow.
        "md:flex md:min-h-svh md:snap-start md:items-center md:py-0",
      )}
    >
      <div className="container">
        <div className="grid grid-cols-12 items-center gap-6 md:gap-12">
          {/* Image */}
          <motion.div
            style={{ y: imgY }}
            className={cn(
              "col-span-12 md:col-span-7",
              reversed && "md:order-2",
            )}
          >
            <Link
              to={`/galleries?project=${project.slug}`}
              aria-label={`View the ${project.name} project`}
              className="group block overflow-hidden rounded-md"
            >
              {project.cover && (
                <SmartImage
                  src={project.cover}
                  alt={project.name}
                  aspect="3 / 2"
                  className="ring-1 ring-border/40 transition-transform duration-[1400ms] ease-editorial group-hover:scale-[1.012]"
                />
              )}
            </Link>
          </motion.div>

          {/* Copy */}
          <motion.div
            style={{ y: textY }}
            className={cn(
              "col-span-12 md:col-span-5",
              reversed && "md:order-1",
            )}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md"
            >
              <p className="text-xs uppercase tracking-widest2 text-accent">
                {kindLabel(project.name)}
              </p>
              <h3 className="mt-4 font-display text-display-md text-balance leading-[0.95]">
                {project.name}
              </h3>
              <div className="mt-6 h-px w-12 bg-foreground/30" />
              <p className="mt-6 text-pretty text-base leading-relaxed text-foreground/75 md:text-lg">
                {copyFor(project)}
              </p>
              <Link
                to={`/galleries?project=${project.slug}`}
                className="group mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-widest2 text-foreground hover:text-accent"
              >
                View project
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Copy heuristics — text alongside each photo. Kept atmospheric, not specific
// to materials we can't verify.
// ─────────────────────────────────────────────────────────────────────────────

function copyFor(p: Project): string {
  const n = p.photo_count;
  const series = n > 1
    ? `A ${n}-photograph study of the project — `
    : `A single, considered frame of the project — `;
  const body = atmosphericLine(p.name);
  return series + body;
}

function atmosphericLine(name: string): string {
  if (/inset/i.test(name)) {
    return "an inset face-frame build, every door fitted flush with the cabinet beyond.";
  }
  if (/modern|mid century/i.test(name)) {
    return "quiet, contemporary cabinetry — slab fronts, integrated pulls, restrained palette.";
  }
  if (/shaker/i.test(name)) {
    return "classical Shaker frames in painted poplar — calm, exacting, made to last.";
  }
  if (/lake|island|hill|alki|mercer|beaver/i.test(name)) {
    return "designed for the room and the view, built in solid hardwood from our Monroe workshop.";
  }
  return "solid-wood cabinetry, drawn for the room and joined by hand.";
}

function kindLabel(name: string): string {
  if (/modern|mid century/i.test(name)) return "Modern · Solid Wood";
  if (/inset/i.test(name)) return "Inset · Face Frame";
  if (/shaker/i.test(name)) return "Shaker · Painted";
  return "Bespoke · Solid Wood";
}
