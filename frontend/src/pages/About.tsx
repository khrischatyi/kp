import * as React from "react";

import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { api } from "@/lib/api";
import type { AboutContent } from "@/lib/api";

export default function About() {
  const [content, setContent] = React.useState<AboutContent | null>(null);

  React.useEffect(() => {
    api.about().then(setContent).catch(() => {});
  }, []);

  const title = content?.title ?? "Crafting Spaces, Building Trust";
  const paragraphs = (content?.body ?? "").split("\n\n").filter(Boolean);

  return (
    <main className="container pb-24 pt-36 md:pt-44">
      <Reveal>
        <SectionLabel>About Us</SectionLabel>
      </Reveal>

      <Reveal>
        <h1 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">
          {title}
        </h1>
      </Reveal>

      <div className="mt-12 max-w-3xl">
        <Reveal>
          <div className="space-y-6 text-muted-foreground">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
