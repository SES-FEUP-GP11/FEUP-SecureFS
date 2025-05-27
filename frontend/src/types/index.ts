/**
 * Represents a user account in the system, aligning with backend UserDetailsSerializer.
 */
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
  path: string;
  size?: number;
  mime_type?: string;
  owner_username?: string; // Username of the owner, if provided by backend for listings
  created_at: string;
  updated_at: string;
  is_public?: boolean; // Indicates if the item itself is public or part of a public context
  is_public_root?: boolean; // Specific to a folder being the user's designated public page root
}

/**
 * Represents sharing permission granted on a FileNode.
 */
export interface SharePermission {
  id: string;
  node_id: string;
  shared_with_username: string;
  permission_level: "view" | "edit";
  granted_by_username: string;
  created_at: string;
}

/**
 * Standard structure for API error responses.
 */
export interface ApiError {
  message: string;
  detail?: string | Record<string, any>;
  statusCode?: number;
}
