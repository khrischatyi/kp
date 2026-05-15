import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { SmartImage } from "@/components/shared/SmartImage";
import type { Project } from "@/types/api";

interface Props {
  projects: Project[];
}

export function FeaturedProjects({ projects }: Props) {
  const featured = projects.slice(0, 5);

  return (
    <section className="container relative py-24 md:py-40">
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 mb-12 md:col-span-5 md:mb-0">
          <SectionLabel index="01">Selected Works</SectionLabel>
          <Reveal className="mt-6">
            <h2 className="font-display text-display-md text-balance">
              Each project, its own architecture.
            </h2>
          </Reveal>
          <Reveal delay={0.05} className="mt-6 max-w-md text-foreground/70">
            <p className="text-pretty">
              We design from the site outward — the geometry of the room, the
              quality of light, the way a family lives — and let the cabinetry
              follow. No two kitchens repeat.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8">
            <Link
              to="/galleries"
              className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest2 text-foreground hover:text-accent"
            >
              All projects
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>

        <div className="col-span-12 md:col-span-7">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5">
            {featured.map((p, idx) => (
              <Reveal
                key={p.slug}
                delay={idx * 0.06}
                className={
                  idx === 0
                    ? "col-span-2"
                    : idx === 3
                      ? "col-span-2"
                      : "col-span-1"
                }
              >
                <Link
                  to={`/galleries?project=${p.slug}`}
                  className="group block"
                  aria-label={`View project: ${p.name}`}
                >
                  <SmartImage
                    src={p.cover!}
                    alt={p.name}
                    aspect={idx === 0 || idx === 3 ? "16 / 10" : "4 / 5"}
                    rounded
                    className="ring-1 ring-border/50 transition-transform duration-700 ease-editorial group-hover:scale-[1.005]"
                  />
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="font-display text-lg leading-tight md:text-xl">
                      {p.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest2 text-muted-foreground">
                      {String(p.order).padStart(2, "0")}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
