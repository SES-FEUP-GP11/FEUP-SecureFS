export interface User {
  id: number | string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
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
 * Aligns with backend PublicPageSerializer.
 */
export interface PublicPageNode {
  id: string; // UUID of the PublicPage record
  filename: string; // User-facing filename, e.g., "index.html", "about.html"
  public_url: string; // Full public URL, e.g., "/published/username/index"
  created_at: string;
  updated_at: string;
  // owner field is usually not needed on the frontend list for "My" public pages
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