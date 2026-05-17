import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";

export default function Careers() {
  return (
    <main className="container pb-24 pt-36 md:pt-44">
      <Reveal>
        <SectionLabel>Careers</SectionLabel>
      </Reveal>

      <Reveal>
        <h1 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">
          Join Our Team
        </h1>
      </Reveal>

      <Reveal>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
          We're always looking for talented craftsmen, designers, and project
          managers who share our passion for quality and craftsmanship. If you're
          interested in joining SCI Seattle Cabinets &amp; Interiors, we'd love
          to hear from you.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Reveal>
          <div className="rounded-2xl border border-border/60 p-8">
            <h3 className="font-display text-xl tracking-tight">
              Cabinet Maker
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Full-time &middot; Monroe, WA
            </p>
            <p className="mt-4 text-muted-foreground">
              Experienced woodworker with expertise in custom cabinetry
              construction, finishing, and installation.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl border border-border/60 p-8">
            <h3 className="font-display text-xl tracking-tight">
              Interior Designer
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Full-time &middot; Seattle, WA
            </p>
            <p className="mt-4 text-muted-foreground">
              Creative designer with a strong portfolio in residential kitchen
              and interior design projects.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl border border-border/60 p-8">
            <h3 className="font-display text-xl tracking-tight">
              Project Manager
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Full-time &middot; Monroe, WA
            </p>
            <p className="mt-4 text-muted-foreground">
              Organized leader to coordinate between clients, designers, and
              craftsmen to deliver projects on time.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="mt-16 rounded-2xl border border-border/60 p-8 md:p-12">
          <h2 className="font-display text-2xl tracking-tight">
            Don't see your role?
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            We're always interested in meeting talented people. Send us your
            resume and a brief introduction — we'll keep you in mind for future
            openings.
          </p>
        </div>
      </Reveal>
    </main>
  );
}
