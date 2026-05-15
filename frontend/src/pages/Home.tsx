import * as React from "react";

import { CTA } from "@/components/home/CTA";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Hero } from "@/components/home/Hero";
import { Philosophy } from "@/components/home/Philosophy";
import { Process } from "@/components/home/Process";
import { Marquee } from "@/components/shared/Marquee";
import { api } from "@/lib/api";
import type { Project } from "@/types/api";

export default function Home() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    api
      .allProjects()
      .then((data) => !cancelled && setProjects(data))
      .catch(() => !cancelled && setProjects([]))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const cover = projects[0]?.cover ?? null;
  const secondary = projects[1]?.cover ?? null;
  const cta = projects[Math.min(4, projects.length - 1)]?.cover ?? null;

  return (
    <>
      <Hero cover={cover} secondaryCover={secondary} />
      <div className="py-10 md:py-16">
        <Marquee
          items={[
            "Bespoke",
            "Heirloom",
            "Hand-Joined",
            "Pacific Northwest",
            "Solid Wood",
            "Made in Ballard",
          ]}
        />
      </div>
      {!loading && projects.length > 0 && <FeaturedProjects projects={projects} />}
      <Philosophy />
      <Process />
      <CTA background={cta} />
    </>
  );
}
