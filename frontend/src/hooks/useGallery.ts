import * as React from "react";
import { api } from "@/lib/api";
import type { Project, ProjectsPage } from "@/types/api";

interface UseGalleryState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  total: number;
}

const PER_PAGE = 6;

/**
 * Paginated, infinite-scroll-friendly gallery loader. Backed by IntersectionObserver-
 * driven `loadMore` calls from the consumer.
 */
export function useGallery(perPage: number = PER_PAGE): UseGalleryState {
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<ProjectsPage | null>(null);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listProjects(page, perPage)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setProjects((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
        setError(null);
      })
      .catch((err) => !cancelled && setError(err.message ?? "Failed to load gallery"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, perPage]);

  const loadMore = React.useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  return {
    projects,
    loading,
    error,
    hasMore: data?.has_more ?? false,
    loadMore,
    total: data?.total ?? 0,
  };
}
