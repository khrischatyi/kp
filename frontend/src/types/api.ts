export interface Photo {
  filename: string;
  url: string;
  width?: number | null;
  height?: number | null;
  order: number;
}

export interface Project {
  slug: string;
  name: string;
  folder: string;
  order: number;
  photo_count: number;
  cover: string | null;
  photos: Photo[];
}

export interface ProjectsPage {
  total: number;
  items: Project[];
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactResponse {
  id: number;
  created_at: string;
  message: string;
}
