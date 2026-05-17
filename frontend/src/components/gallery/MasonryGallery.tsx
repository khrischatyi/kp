import * as React from "react";
import { motion } from "framer-motion";

import { SmartImage } from "@/components/shared/SmartImage";
import { useInfiniteSentinel } from "@/hooks/useInfiniteSentinel";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/api";

interface MasonryGalleryProps {
  projects: Project[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onPhotoClick: (project: Project, photoIdx: number) => void;
}

/**
 * Mosaic gallery. Distributes each project's photos across 1/2/3-column layouts
 * with varied aspect ratios for editorial rhythm. Triggers infinite scroll via
 * IntersectionObserver sentinel.
 */
export function MasonryGallery({
  projects,
  loading,
  hasMore,
  onLoadMore,
  onPhotoClick,
}: MasonryGalleryProps) {
  const sentinelRef = useInfiniteSentinel(onLoadMore, { enabled: hasMore && !loading });

  return (
    <div className="container py-12 md:py-20">
      <div className="flex flex-col gap-20 md:gap-32">
        {projects.map((project, projectIdx) => (
          <ProjectBlock
            key={project.slug}
            project={project}
            projectIdx={projectIdx}
            onPhotoClick={onPhotoClick}
          />
        ))}
      </div>

      <div ref={sentinelRef} aria-hidden className="h-1" />

      {loading && (
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-shimmer rounded-md bg-[linear-gradient(110deg,hsl(var(--muted)),45%,hsl(var(--muted)/0.55),55%,hsl(var(--muted)))] bg-[length:200%_100%]"
            />
          ))}
        </div>
      )}

      {!hasMore && !loading && projects.length > 0 && (
        <div className="mt-24 flex items-center justify-center gap-4 text-xs uppercase tracking-widest2 text-muted-foreground">
          <span className="h-px w-12 bg-foreground/20" />
          End of portfolio
          <span className="h-px w-12 bg-foreground/20" />
        </div>
      )}
    </div>
  );
}

function ProjectBlock({
  project,
  projectIdx,
  onPhotoClick,
}: {
  project: Project;
  projectIdx: number;
  onPhotoClick: (p: Project, idx: number) => void;
}) {
  const photos = project.photos;
  if (photos.length === 0) return null;

  // Editorial layout patterns rotate by project to keep visual rhythm
  const layout = LAYOUTS[projectIdx % LAYOUTS.length];

  return (
    <article id={project.slug} className="scroll-mt-28">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 flex flex-col gap-2 md:mb-12 md:flex-row md:items-end md:justify-between"
      >
        <div className="flex items-end gap-4">
          <h2 className="font-display text-3xl text-balance md:text-5xl">
            {project.name}
          </h2>
        </div>
        <span className="text-xs uppercase tracking-widest2 text-muted-foreground">
          {photos.length} {photos.length === 1 ? "image" : "images"}
        </span>
      </motion.header>

      <div className="grid grid-cols-12 gap-3 md:gap-5">
        {photos.map((photo, idx) => {
          const cell = layout[idx % layout.length];
          return (
            <motion.button
              key={photo.url}
              type="button"
              onClick={() => onPhotoClick(project, idx)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.9,
                delay: Math.min(idx * 0.04, 0.3),
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "group relative overflow-hidden rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring",
                cell.span,
              )}
              aria-label={`Open photo ${idx + 1} of ${project.name}`}
            >
              <SmartImage
                src={photo.url}
                alt={`${project.name} — image ${idx + 1}`}
                aspect={cell.aspect}
                className="ring-1 ring-border/40 transition-transform duration-700 ease-editorial group-hover:scale-[1.012]"
              />
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </article>
  );
}

/** Layout grammar — each "scene" is a 12-col grid with varied spans + ratios. */
type Cell = { span: string; aspect: string };
const LAYOUTS: Cell[][] = [
  // Cinematic wide → portrait pair
  [
    { span: "col-span-12", aspect: "16 / 9" },
    { span: "col-span-12 md:col-span-6", aspect: "4 / 5" },
    { span: "col-span-12 md:col-span-6", aspect: "4 / 5" },
    { span: "col-span-12 md:col-span-7", aspect: "16 / 11" },
    { span: "col-span-12 md:col-span-5", aspect: "4 / 5" },
  ],
  // Asymmetric trio
  [
    { span: "col-span-12 md:col-span-7", aspect: "5 / 4" },
    { span: "col-span-12 md:col-span-5", aspect: "4 / 5" },
    { span: "col-span-12 md:col-span-5", aspect: "4 / 5" },
    { span: "col-span-12 md:col-span-7", aspect: "5 / 4" },
    { span: "col-span-12", aspect: "21 / 9" },
  ],
  // Editorial split
  [
    { span: "col-span-12 md:col-span-8", aspect: "16 / 10" },
    { span: "col-span-12 md:col-span-4", aspect: "4 / 5" },
    { span: "col-span-6 md:col-span-4", aspect: "1 / 1" },
    { span: "col-span-6 md:col-span-4", aspect: "1 / 1" },
    { span: "col-span-12 md:col-span-4", aspect: "1 / 1" },
  ],
];
