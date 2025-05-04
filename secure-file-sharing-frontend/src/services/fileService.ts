// src/services/fileService.ts
import type { FileNode, ApiError } from "../types";
import apiClient from "./apiClient"; // Import the actual API client

// --- Mock File System Data (FOR SIMULATION ONLY) ---
// This data will be replaced by actual backend responses.
const mockFileSystem: Record<string, FileNode[]> = {
  "/": [
    {
      id: "sim-folder-1",
      name: "Documents",
      is_directory: true,
      path: "/Documents",
      owner_username: "testuser",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "sim-folder-2",
      name: "Pictures",
      is_directory: true,
      path: "/Pictures",
      owner_username: "testuser",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "sim-file-1",
      name: "report.txt",
      is_directory: false,
      path: "/report.txt",
      size: 1024,
      mime_type: "text/plain",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  "/Documents": [
    {
      id: "sim-file-2",
      name: "project_plan.docx",
      is_directory: false,
      path: "/Documents/project_plan.docx",
      size: 51200,
      mime_type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "sim-folder-3",
      name: "Archive",
      is_directory: true,
      path: "/Documents/Archive",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  "/Pictures": [
    {
      id: "sim-file-3",
      name: "vacation.jpg",
      is_directory: false,
      path: "/Pictures/vacation.jpg",
      size: 204800,
      mime_type: "image/jpeg",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  "/Documents/Archive": [], // Empty directory
};
// --- END SIMULATION DATA ---

/**
 * Fetches the list of files and folders for a given path from the backend.
 *
 * **Integration Notes:**
 * - **Backend Endpoint:** GET /api/files/
 * - **Request Parameters:** Expects a 'path' query parameter (e.g., /api/files/?path=/Documents).
 * - **Authentication:** Requires user to be authenticated (handled by apiClient interceptor later).
 * - **Success Response:** 200 OK with JSON body: `FileNode[]`
 * - **Error Responses:**
 * - 404 Not Found: If the path doesn't exist or user doesn't have access.
 * - 401 Unauthorized: If the user is not logged in.
 * - 403 Forbidden: If the user is logged in but lacks permission for the path.
 * - 500 Internal Server Error: For general server issues.
 *
 * @param path - The directory path to list (e.g., '/', '/Documents').
 * @returns A Promise resolving with an array of FileNode objects or rejecting with an ApiError.
 */
export const listFiles = async (path: string): Promise<FileNode[]> => {
  // --- SIMULATION CODE START ---
  // This block simulates the API call and will be replaced.
  console.log(`[SIMULATION] listFiles for path: ${path}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const normalizedPath = path || "/";
      if (mockFileSystem.hasOwnProperty(normalizedPath)) {
        console.log(
          `[SIMULATION] listFiles successful for ${normalizedPath}:`,
          mockFileSystem[normalizedPath]
        );
        resolve([...mockFileSystem[normalizedPath]]); // Return a copy
      } else {
        const error: ApiError = {
          message: `Directory not found: ${normalizedPath}`,
          statusCode: 404,
        };
        console.error(
          `[SIMULATION] listFiles failed for ${normalizedPath}:`,
          error
        );
        reject(error);
      }
    }, 800);
  });
  // --- SIMULATION CODE END ---

  // --- REAL API CALL (Replace simulation block with this) ---
  /*
  try {
    console.log(`[API] Fetching files for path: ${path}`);
    const response = await apiClient.get<FileNode[]>('/files/', {
      params: { path: path || '/' } // Ensure root path is sent correctly
    });
    console.log(`[API] Files fetched successfully for ${path}:`, response.data);
    return response.data; // Axios nests the actual data in the 'data' property
  } catch (error: any) {
    console.error(`[API] Error fetching files for ${path}:`, error);
    // Basic error transformation (can be enhanced in apiClient interceptor)
    const apiError: ApiError = {
      message: error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch files',
      statusCode: error.response?.status,
      detail: error.response?.data // Include full backend error detail if available
    };
    throw apiError; // Re-throw the structured error
  }
  */
  // --- END REAL API CALL ---
};

/**
 * Creates a new folder at the specified path.
 *
 * **Integration Notes:**
 * - **Backend Endpoint:** POST /api/files/mkdir/
 * - **Request Body:** JSON `{ "path": "/path/to/new_folder" }` (full path of the folder to create)
 * - **Authentication:** Required.
 * - **Success Response:** 201 Created with JSON body: `FileNode` (representing the newly created folder).
 * - **Error Responses:** 400 Bad Request (invalid path/name), 409 Conflict (folder exists), 401/403, 500.
 *
 * @param parentPath - The path of the parent directory.
 * @param name - The name of the new folder.
 * @returns A Promise resolving with the created FileNode or rejecting with an ApiError.
 */
export const createFolder = async (
  parentPath: string,
  name: string
): Promise<FileNode> => {
  const fullPath = `${parentPath === "/" ? "" : parentPath}/${name}`; // Construct full path
  // --- SIMULATION CODE START ---
  console.log(`[SIMULATION] createFolder: ${fullPath}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Basic simulation: Assume success, add to mock data (very simplified)
      if (!mockFileSystem[parentPath]) {
        // Reject if parent doesn't exist in mock data (basic check)
        reject({
          message: `Parent path not found: ${parentPath}`,
          statusCode: 404,
        });
        return;
      }
      const newFolder: FileNode = {
        id: `sim-folder-${Date.now()}`,
        name: name,
        is_directory: true,
        path: fullPath,
        owner_username: "testuser", // Assuming current user
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Add to parent listing & create entry for the folder itself
      mockFileSystem[parentPath]?.push(newFolder);
      mockFileSystem[fullPath] = [];
      console.log("[SIMULATION] createFolder successful:", newFolder);
      resolve(newFolder);
    }, 500);
  });
  // --- SIMULATION CODE END ---

  // --- REAL API CALL (Replace simulation block with this) ---
  /*
  try {
    console.log(`[API] Creating folder: ${fullPath}`);
    const response = await apiClient.post<FileNode>('/files/mkdir/', { path: fullPath });
    console.log('[API] Folder created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[API] Error creating folder ${fullPath}:`, error);
    const apiError: ApiError = {
      message: error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to create folder',
      statusCode: error.response?.status,
      detail: error.response?.data
    };
    throw apiError;
  }
  */
  // --- END REAL API CALL ---
};

/**
 * Deletes a file or folder at the specified path.
 *
 * **Integration Notes:**
 * - **Backend Endpoint:** DELETE /api/files/
 * - **Request Body:** JSON `{ "path": "/path/to/delete" }`
 * - **Authentication:** Required.
 * - **Success Response:** 204 No Content.
 * - **Error Responses:** 404 Not Found, 400 Bad Request (e.g., trying to delete root), 401/403, 500.
 *
 * @param nodePath - The full path of the file or folder to delete.
 * @returns A Promise resolving on success or rejecting with an ApiError.
 */
export const deleteNode = async (nodePath: string): Promise<void> => {
  // --- SIMULATION CODE START ---
  console.log(`[SIMULATION] deleteNode: ${nodePath}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Basic simulation: Remove from mock data (very simplified)
      const parentPath =
        nodePath.substring(0, nodePath.lastIndexOf("/")) || "/";
      if (mockFileSystem[parentPath]) {
        mockFileSystem[parentPath] =
          mockFileSystem[parentPath]?.filter(
            (node) => node.path !== nodePath
          ) ?? [];
      }
      // Also remove the entry for the directory itself if it was one
      if (mockFileSystem.hasOwnProperty(nodePath)) {
        delete mockFileSystem[nodePath];
      }
      console.log("[SIMULATION] deleteNode successful.");
      resolve();
    }, 500);
  });
  // --- SIMULATION CODE END ---

  // --- REAL API CALL (Replace simulation block with this) ---
  /*
  try {
    console.log(`[API] Deleting node: ${nodePath}`);
    await apiClient.delete('/files/', { data: { path: nodePath } }); // DELETE uses 'data' for body
    console.log('[API] Node deleted successfully.');
  } catch (error: any) {
    console.error(`[API] Error deleting node ${nodePath}:`, error);
    const apiError: ApiError = {
      message: error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to delete item',
      statusCode: error.response?.status,
      detail: error.response?.data
    };
    throw apiError;
  }
  */
  // --- END REAL API CALL ---
};

/**
 * Renames a file or folder.
 *
 * **Integration Notes:**
 * - **Backend Endpoint:** PATCH /api/files/rename/ (or PUT)
 * - **Request Body:** JSON `{ "path": "/path/to/old_item", "new_name": "new_item_name" }`
 * - **Authentication:** Required.
 * - **Success Response:** 200 OK with JSON body: `FileNode` (representing the renamed item with its new path).
 * - **Error Responses:** 404 Not Found, 400 Bad Request (invalid name), 409 Conflict (name exists), 401/403, 500.
 *
 * @param oldPath - The current full path of the item.
 * @param newName - The desired new name (not the full path).
 * @returns A Promise resolving with the updated FileNode or rejecting with an ApiError.
 */
export const renameNode = async (
  oldPath: string,
  newName: string
): Promise<FileNode> => {
  // --- SIMULATION CODE START ---
  console.log(`[SIMULATION] renameNode: ${oldPath} to ${newName}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Basic simulation: Update mock data (very simplified)
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf("/")) || "/";
      const nodeIndex = mockFileSystem[parentPath]?.findIndex(
        (node) => node.path === oldPath
      );

      if (
        nodeIndex !== undefined &&
        nodeIndex !== -1 &&
        mockFileSystem[parentPath]
      ) {
        const nodeToUpdate = mockFileSystem[parentPath]![nodeIndex]!;
        const newPath = `${parentPath === "/" ? "" : parentPath}/${newName}`;
        nodeToUpdate.name = newName;
        nodeToUpdate.path = newPath;
        nodeToUpdate.updated_at = new Date().toISOString();

        // If it was a directory, update its key in mockFileSystem
        if (
          nodeToUpdate.is_directory &&
          mockFileSystem.hasOwnProperty(oldPath)
        ) {
          mockFileSystem[newPath] = mockFileSystem[oldPath]!;
          delete mockFileSystem[oldPath];
          // TODO: Recursively update paths of children in simulation (complex)
        }
        console.log("[SIMULATION] renameNode successful:", nodeToUpdate);
        resolve(nodeToUpdate);
      } else {
        reject({ message: `Node not found: ${oldPath}`, statusCode: 404 });
      }
    }, 500);
  });
  // --- SIMULATION CODE END ---

  // --- REAL API CALL (Replace simulation block with this) ---
  /*
    try {
      console.log(`[API] Renaming node: ${oldPath} to ${newName}`);
      const response = await apiClient.patch<FileNode>('/files/rename/', { path: oldPath, new_name: newName });
      console.log('[API] Node renamed successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[API] Error renaming node ${oldPath}:`, error);
      const apiError: ApiError = {
        message: error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to rename item',
        statusCode: error.response?.status,
        detail: error.response?.data
      };
      throw apiError;
    }
    */
  // --- END REAL API CALL ---
};

// Add other simulated functions (upload, download, share, etc.) later with similar integration comments...
