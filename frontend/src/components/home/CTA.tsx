import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import { ParallaxImage } from "@/components/shared/ParallaxImage";

export function CTA({ background }: { background: string | null }) {
  return (
    <section className="relative overflow-hidden py-24 md:py-40">
      {background && (
        <div className="absolute inset-0 -z-10">
          <ParallaxImage src={background} alt="" strength={0.5} className="size-full" />
          <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px] dark:bg-background/80" />
        </div>
      )}
      <div className="container relative grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-9">
          <Reveal>
            <p className="text-xs uppercase tracking-widest2 text-accent">A project begins with a conversation</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-display text-display-lg text-balance">
              Tell us about your home.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-foreground/75 md:text-lg">
              We take on a small number of new projects each year. If our work
              speaks to you, we'd be delighted to hear from you.
            </p>
          </Reveal>
        </div>
        <div className="col-span-12 mt-6 flex flex-wrap items-center gap-4 md:col-span-3 md:mt-0 md:justify-end">
          <Reveal delay={0.15}>
            <Button asChild size="lg" variant="primary">
              <Link to="/contacts">
                Start the conversation
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
