// src/types/index.ts

/**
 * Represents a user account in the system.
 */
export interface User {
  id: number | string; // Unique identifier (could be number or UUID string)
  username: string;
  email?: string; // Optional email address
  // Add other relevant user fields later (e.g., name)
}

/**
 * Represents a node in the file system (can be a file or a directory).
 */
export interface FileNode {
  id: string; // Unique identifier for the node (e.g., UUID)
  name: string; // Name of the file or directory
  is_directory: boolean; // True if it's a directory, false if it's a file
  path: string; // Logical path within the user's structure (e.g., "/documents/report.txt")
  size?: number; // Size in bytes (for files)
  mime_type?: string; // MIME type (for files, e.g., "text/plain", "image/jpeg")
  owner_username?: string; // Username of the owner
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  // Permissions specific to the *requesting* user might be added by the backend later
  // e.g., permissions?: 'view' | 'edit' | 'own';
}

/**
 * Represents sharing permission granted on a FileNode.
 */
export interface SharePermission {
  id: string; // Unique ID for the permission entry
  node_id: string; // ID of the FileNode being shared
  shared_with_username: string; // Username of the user it's shared with
  permission_level: "view" | "edit"; // Type of permission granted
  granted_by_username: string; // Username of the user who granted the permission
  created_at: string; // ISO 8601 date string
}

/**
 * Standard structure for API error responses.
 */
export interface ApiError {
  message: string; // User-friendly error message
  detail?: string | Record<string, any>; // More specific details (optional)
  statusCode?: number; // HTTP status code (optional)
}
