import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { SmartImage } from "@/components/shared/SmartImage";
import { api } from "@/lib/api";
import type { Project } from "@/types/api";

const STYLES = [
  {
    title: "Inset & Beaded Frame",
    body:
      "The most exacting kind of cabinetry — every door fits flush with the face frame, joinery revealed. Built to last lifetimes.",
  },
  {
    title: "Modern Shaker",
    body:
      "Quiet, clean-lined cabinetry in painted poplar or rift-cut white oak. Considered hardware, perfect reveals.",
  },
  {
    title: "Walnut & Oak",
    body:
      "Solid hardwood throughout — never veneered substrates. The wood grain becomes the design.",
  },
  {
    title: "Architectural Modern",
    body:
      "Slab fronts, integrated pulls, mitered corners. Quiet luxury for contemporary homes.",
  },
];

export default function Kitchens() {
  const [projects, setProjects] = React.useState<Project[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    api.allProjects().then((d) => !cancelled && setProjects(d)).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const showcase = projects.slice(0, 6);

  return (
    <>
      {/* Header */}
      <section className="container pb-12 pt-32 md:pt-44">
        <SectionLabel index="◆">The Work</SectionLabel>
        <Reveal className="mt-6 max-w-5xl">
          <h1 className="font-display text-display-lg text-balance">
            Kitchens designed to live with — for the way a family actually cooks.
          </h1>
        </Reveal>
        <Reveal delay={0.06} className="mt-8 max-w-2xl">
          <p className="text-pretty text-base leading-relaxed text-foreground/75 md:text-lg">
            A small selection of styles we return to often — though every
            project starts from the room and the people in it, not a template.
          </p>
        </Reveal>
      </section>

      {/* Style grid */}
      <section className="border-y border-border/60 bg-surface/60">
        <div className="container py-16 md:py-24">
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {STYLES.map((s, idx) => (
              <Reveal key={s.title} delay={idx * 0.05}>
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest2 text-accent">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-2xl">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-foreground/70">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="container py-24 md:py-36">
        <SectionLabel index="01">Selected Kitchens</SectionLabel>
        <Reveal className="mt-6 max-w-3xl">
          <h2 className="font-display text-display-md text-balance">
            A few favorites from the last decade.
          </h2>
        </Reveal>

        <div className="mt-14 space-y-20 md:space-y-32">
          {showcase.map((p, idx) => {
            const reversed = idx % 2 === 1;
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-12 gap-6 md:gap-12"
              >
                <div className={`col-span-12 md:col-span-8 ${reversed ? "md:order-2" : ""}`}>
                  {p.cover && (
                    <SmartImage
                      src={p.cover}
                      alt={p.name}
                      aspect="3 / 2"
                      rounded
                      className="ring-1 ring-border/40"
                    />
                  )}
                </div>
                <div className={`col-span-12 flex flex-col justify-end md:col-span-4 ${reversed ? "md:order-1" : ""}`}>
                  <span className="font-display text-3xl text-accent md:text-4xl">
                    {String(p.order).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-3xl md:text-4xl">{p.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/70">
                    {p.photo_count} photographs — design, build, and install by our studio.
                  </p>
                  <Link
                    to={`/galleries?project=${p.slug}`}
                    className="group mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-widest2 text-foreground hover:text-accent"
                  >
                    View the project
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
