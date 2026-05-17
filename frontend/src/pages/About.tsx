import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";

export default function About() {
  return (
    <main className="container pb-24 pt-36 md:pt-44">
      <Reveal>
        <SectionLabel>About Us</SectionLabel>
      </Reveal>

      <Reveal>
        <h1 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">
          Crafting Spaces,<br />Building Trust
        </h1>
      </Reveal>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <Reveal>
          <div className="space-y-6 text-muted-foreground">
            <p>
              SCI Seattle Cabinets &amp; Interiors has been serving the greater
              Seattle area with bespoke cabinetry and interior solutions for
              years. Our team of skilled craftsmen combines traditional
              woodworking techniques with modern design sensibilities.
            </p>
            <p>
              From custom kitchen cabinets to complete interior renovations, we
              take pride in every project we deliver. Our commitment to quality
              materials and meticulous attention to detail ensures results that
              stand the test of time.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="space-y-6 text-muted-foreground">
            <p>
              We believe that great design should be accessible. That's why we
              work closely with each client to understand their vision, lifestyle,
              and budget — creating solutions that are both beautiful and
              practical.
            </p>
            <p>
              Based in Monroe, Snohomish County, we proudly serve clients
              throughout the greater Seattle metropolitan area, bringing expert
              craftsmanship to homes across the Pacific Northwest.
            </p>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
