import { motion } from "framer-motion";

import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";

const PILLARS = [
  {
    n: "01",
    title: "Joinery",
    body:
      "Mortise-and-tenon frames. Dovetailed drawer boxes. Conversion-varnish or oil finishes — depending on the wood, never the trend.",
  },
  {
    n: "02",
    title: "Material",
    body:
      "Domestic hardwoods, milled and acclimated in-shop. White oak, walnut, rift cherry, maple — chosen one board at a time.",
  },
  {
    n: "03",
    title: "Proportion",
    body:
      "Every reveal, every face frame, every door style is drawn to the room. We design in the language of architecture, not catalog.",
  },
];

export function Philosophy() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-surface/60">
      <div className="container grid grid-cols-12 gap-y-10 py-24 md:py-32">
        <div className="col-span-12 md:col-span-4">
          <SectionLabel index="02">Philosophy</SectionLabel>
          <Reveal className="mt-6">
            <h2 className="font-display text-display-md text-balance">
              Three things, taken seriously.
            </h2>
          </Reveal>
        </div>

        <div className="col-span-12 grid grid-cols-1 gap-10 md:col-span-8 md:grid-cols-3">
          {PILLARS.map((p, idx) => (
            <Reveal key={p.n} delay={idx * 0.08}>
              <div className="group relative flex flex-col gap-4">
                <span className="font-display text-5xl text-accent/70 md:text-6xl">
                  {p.n}
                </span>
                <h3 className="font-display text-2xl">{p.title}</h3>
                <p className="text-pretty text-sm leading-relaxed text-foreground/70">
                  {p.body}
                </p>
                <motion.div
                  className="absolute inset-x-0 -bottom-1 h-px origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1, delay: 0.3 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    background:
                      "linear-gradient(to right, hsl(var(--accent) / 0.7), hsl(var(--accent) / 0.05))",
                  }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
