/** Tiny typed API client backed by fetch. */
import type { ContactPayload, ContactResponse, ProjectsPage, Project } from "@/types/api";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const detail = await safeJson(res);
    throw new ApiError(
      typeof detail?.detail === "string" ? detail.detail : `HTTP ${res.status}`,
      res.status,
    );
  }
  return res.json() as Promise<T>;
}

async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  listProjects: (page = 1, perPage = 12) =>
    request<ProjectsPage>(`/gallery/projects?page=${page}&per_page=${perPage}`),

  allProjects: () => request<Project[]>("/gallery/projects/all"),

  project: (slug: string) => request<Project>(`/gallery/projects/${encodeURIComponent(slug)}`),

  contact: (payload: ContactPayload) =>
    request<ContactResponse>("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
