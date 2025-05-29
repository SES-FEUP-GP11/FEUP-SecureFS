export interface User {
  id: number | string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  // This might be where a 'public_username_slug' could be added if different from email prefix
}

/**
 * Represents a node in the main file system.
 */
export interface FileNode {
  id: string;
  name: string;
  is_directory: boolean;
  logical_path: string;
  path: string;
  size_bytes?: number | null;
  mime_type?: string | null;
  is_public_root?: boolean;
  created_at: string;
  updated_at: string;
  owner_username?: string;
  is_public?: boolean;
}

/**
 * Represents a user's publicly published HTML page.
 * Aligns with backend PublicPage model and API responses.
 */
export interface PublicPageNode {
  id: string; // UUID of the PublicPage record
  name: string; // User-facing filename from backend, e.g., "index.html", "about.html"
  // public_url is constructed on the frontend based on convention or a field from backend
  created_at: string;
  updated_at: string;
  // The backend GET list response for public pages might not include owner details
  // as it's scoped to the authenticated user.
}

/**
 * Represents sharing permission.
 */
export interface SharePermission {
  id: string;
  node: string;
  shared_with_user: number;
  permission_level: "view" | "edit";
  created_at: string;
  updated_at?: string;
}

/**
 * Standard structure for API error responses.
 */
export interface ApiError {
  message: string;
  detail?: string | Record<string, any>;
  statusCode?: number;
}
