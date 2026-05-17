import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";

const STEPS = [
  {
    n: "I",
    title: "Conversation",
    body:
      "We begin in your home. We listen — to the way you cook, to the room's light, to the rituals you want to keep.",
  },
  {
    n: "II",
    title: "Drawing",
    body:
      "Hand sketches, then precise renderings. Materials, joinery, hardware — every detail specified before we cut a board.",
  },
  {
    n: "III",
    title: "Craft",
    body:
      "Eight to fourteen weeks in our Monroe workshop. Solid-wood frames, dovetailed boxes, finishes hand-rubbed to depth.",
  },
  {
    n: "IV",
    title: "Install",
    body:
      "Our own team installs every project. A final reveal, careful tuning, and a kitchen ready to serve a generation.",
  },
];

export function Process() {
  return (
    <section className="container py-24 md:py-40">
      <div className="grid grid-cols-12 gap-y-10">
        <div className="col-span-12 md:col-span-5">
          <SectionLabel index="03">Process</SectionLabel>
          <Reveal className="mt-6">
            <h2 className="font-display text-display-md text-balance">
              Four chapters, one kitchen.
            </h2>
          </Reveal>
          <Reveal delay={0.05} className="mt-6 max-w-md text-foreground/70">
            <p>
              From first conversation to install, we are the same hands. We do
              not subcontract our craft.
            </p>
          </Reveal>
        </div>

        <div className="col-span-12 md:col-span-7">
          <ol className="divide-y divide-border/60">
            {STEPS.map((s, idx) => (
              <Reveal key={s.n} delay={idx * 0.06}>
                <li className="grid grid-cols-12 gap-6 py-8">
                  <div className="col-span-2 font-display text-3xl text-accent">
                    {s.n}
                  </div>
                  <div className="col-span-10">
                    <h3 className="font-display text-2xl">{s.title}</h3>
                    <p className="mt-2 max-w-lg text-pretty text-sm leading-relaxed text-foreground/70">
                      {s.body}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
