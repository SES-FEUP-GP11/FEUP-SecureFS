/**
 * Represents a user account in the system.
 */
export interface User {
  id: number | string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

/**
 * Represents a node in the file system (can be a file or a directory).
 * Aligned with the backend response structure for /api/files/ endpoint.
 */
export interface FileNode {
  id: string;                 // UUID from backend
  name: string;               // Filename or folder name
  is_directory: boolean;
  logical_path: string;       // Full logical path from user's root, e.g., "/Documents/report.txt"
  size_bytes?: number | null;  // Size in bytes, null for directories
  mime_type?: string | null;   // MIME type for files, null for directories
  is_public_root?: boolean;    // True if this folder is the root of the user's public page
  created_at: string;         // ISO 8601 datetime string
  updated_at: string;         // ISO 8601 datetime string
  
  // Optional fields that your frontend simulation used,
  // include them if your backend serializer for listFiles will provide them.
  owner_username?: string; 
  is_public?: boolean;      // This can be derived client-side based on logical_path,
                            // is_public_root, or explicitly provided by backend.
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