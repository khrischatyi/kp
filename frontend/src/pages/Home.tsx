import * as React from "react";

import { CTA } from "@/components/home/CTA";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Hero } from "@/components/home/Hero";
import { Philosophy } from "@/components/home/Philosophy";
import { Process } from "@/components/home/Process";
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

  const cta = projects[Math.min(6, projects.length - 1)]?.cover ?? null;

  return (
    <>
      <Hero />
      {!loading && projects.length > 0 && <FeaturedProjects projects={projects} />}
      <Philosophy />
      <Process />
      <CTA background={cta} />
    </>
  );
}
