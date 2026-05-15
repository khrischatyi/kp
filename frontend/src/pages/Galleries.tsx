import * as React from "react";
import { useSearchParams } from "react-router-dom";

import { Lightbox } from "@/components/gallery/Lightbox";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { Reveal } from "@/components/shared/Reveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { useGallery } from "@/hooks/useGallery";
import type { Project } from "@/types/api";

export default function Galleries() {
  const { projects, loading, hasMore, loadMore, total } = useGallery(4);
  const [activeProject, setActiveProject] = React.useState<Project | null>(null);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [searchParams] = useSearchParams();
  const requestedSlug = searchParams.get("project");

  // Scroll to a project anchor if requested via ?project=slug
  React.useEffect(() => {
    if (!requestedSlug || projects.length === 0) return;
    // Delay a tick so the DOM has the section rendered
    const t = setTimeout(() => {
      const el = document.getElementById(requestedSlug);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(t);
  }, [requestedSlug, projects]);

  const handlePhotoClick = React.useCallback((p: Project, idx: number) => {
    setActiveProject(p);
    setActiveIdx(idx);
  }, []);

  return (
    <>
      <section className="container relative pb-6 pt-32 md:pt-44">
        <SectionLabel index="◆">The Portfolio</SectionLabel>
        <Reveal className="mt-6">
          <h1 className="font-display text-display-lg text-balance">
            Every kitchen we've built — in order.
          </h1>
        </Reveal>
        <Reveal delay={0.05} className="mt-6 max-w-2xl">
          <p className="text-pretty text-foreground/70 md:text-lg">
            Scroll to wander. Click any image to view it full-screen.
            {total > 0 && (
              <>
                {" "}
                <span className="text-foreground">{total}</span> projects, presented in the order
                they were made.
              </>
            )}
          </p>
        </Reveal>
      </section>

      <MasonryGallery
        projects={projects}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onPhotoClick={handlePhotoClick}
      />

      <Lightbox
        photos={activeProject?.photos ?? []}
        projectName={activeProject?.name ?? ""}
        index={activeIdx}
        open={!!activeProject}
        onClose={() => setActiveProject(null)}
        onIndexChange={setActiveIdx}
      />
    </>
  );
}
