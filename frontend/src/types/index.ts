export interface User {
  id: number | string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

/**
 * Represents a node in the file system (can be a file or a directory).
 */
export interface FileNode {
  id: string;
  name: string;
  is_directory: boolean;
  logical_path: string; // Canonical logical path from backend
  path: string; // Kept for frontend consistency, should mirror logical_path
  size_bytes?: number | null;
  mime_type?: string | null;
  is_public_root?: boolean;
  created_at: string;
  updated_at: string;
  
  owner_username?: string; 
  is_public?: boolean; // Derived or set based on sharing settings
}

/**
 * Represents sharing permission granted on a FileSystemNode.
 * Aligned with the backend response for POST /api/sharing/
 */
export interface SharePermission {
  id: string;                 // UUID of the permission record itself
  node: string;               // UUID of the FileNode being shared
  shared_with_user: number;   // Integer ID of the user it's shared with
  // shared_with_username?: string; // Optional: if backend provides for display
  // shared_with_email?: string; // Optional: if backend provides for display
  permission_level: "view" | "edit";
  created_at: string;
  updated_at?: string; // Backend response includes this
  // granted_by_user_id might also be useful if backend sends it
}

/**
 * Standard structure for API error responses.
 */
export interface ApiError {
  message: string; 
  detail?: string | Record<string, any>; 
  statusCode?: number;
}