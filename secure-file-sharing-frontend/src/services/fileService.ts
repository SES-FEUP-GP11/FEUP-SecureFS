import type { FileNode, ApiError } from "../types";
import apiClient from "./apiClient";

// --- Mock File System Data (FOR SIMULATION ONLY) ---
// This data will be replaced by actual backend responses.
const mockFileSystem: Record<string, FileNode[]> = {
  "/": [
    {
      id: "sim-folder-public",
      name: "public",
      is_directory: true,
      path: "/public",
      owner_username: "testuser",
      is_public: true, // Mark as public folder
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "sim-folder-docs",
      name: "Docs",
      is_directory: true,
      path: "/Docs",
      owner_username: "testuser",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "sim-folder-pics",
      name: "Pictures",
      is_directory: true,
      path: "/Pictures",
      owner_username: "testuser",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "sim-file-report",
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
  // Public folder contents for testuser
  "/public": [
    {
      id: "sim-file-public-readme",
      name: "README.md",
      is_directory: false,
      path: "/public/README.md",
      size: 2048,
      mime_type: "text/markdown",
      owner_username: "testuser",
      is_public: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "sim-file-public-portfolio",
      name: "portfolio.html",
      is_directory: false,
      path: "/public/portfolio.html",
      size: 5120,
      mime_type: "text/html",
      owner_username: "testuser",
      is_public: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "sim-folder-public-assets",
      name: "assets",
      is_directory: true,
      path: "/public/assets",
      owner_username: "testuser",
      is_public: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],

  "/public/assets": [
    {
      id: "sim-file-public-logo",
      name: "logo.png",
      is_directory: false,
      path: "/public/assets/logo.png",
      size: 10240,
      mime_type: "image/png",
      owner_username: "testuser",
      is_public: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  "/Docs": [
    {
      id: "sim-file-plan",
      name: "project_plan.docx",
      is_directory: false,
      path: "/Docs/project_plan.docx",
      size: 51200,
      mime_type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "sim-folder-archive",
      name: "Archive",
      is_directory: true,
      path: "/Docs/Archive",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "sim-folder-test",
      name: "Test",
      is_directory: true,
      path: "/Docs/Test",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  "/Docs/Test": [
    {
      id: "sim-file-subtest",
      name: "subtest.txt",
      is_directory: false,
      path: "/Docs/Test/subtest.txt",
      size: 50,
      mime_type: "text/plain",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  "/Pictures": [
    {
      id: "sim-file-vacation",
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
  "/Docs/Archive": [], // Empty directory
};
// --- END SIMULATION DATA ---

// Helper function for renameNode simulation to recursively update paths
const recursivelyUpdatePathsAndMoveChildren = (
  oldDirKey: string,
  newDirKey: string
) => {
  if (!mockFileSystem.hasOwnProperty(oldDirKey)) {
    return; // Source directory doesn't exist in mock, nothing to do
  }

  const childrenToMove = mockFileSystem[oldDirKey]!;
  delete mockFileSystem[oldDirKey]; // Remove old directory entry

  mockFileSystem[newDirKey] = []; // Create new directory entry

  for (const child of childrenToMove) {
    const oldChildPath = child.path;
    // Replace only the beginning of the path that matches oldDirKey
    const newChildPath = oldChildPath.startsWith(oldDirKey + "/")
      ? newDirKey + oldChildPath.substring(oldDirKey.length)
      : newDirKey + "/" + child.name; // Fallback for direct children if path was just oldDirKey

    const updatedChild = { ...child, path: newChildPath };
    mockFileSystem[newDirKey].push(updatedChild);

    if (updatedChild.is_directory) {
      // Recursively call for subdirectories, using their original old path and new path
      recursivelyUpdatePathsAndMoveChildren(oldChildPath, newChildPath);
    }
  }
  console.log(
    `[SIMULATION Helper] Moved children from ${oldDirKey} to ${newDirKey} and updated paths.`
  );
};

export const listFiles = async (path: string): Promise<FileNode[]> => {
  // ... (listFiles implementation remains the same)
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
    }, 300); // Reduced delay for faster testing
  });
};

export const listPublicFiles = async (path: string = "/"): Promise<FileNode[]> => {
  console.log(`[SIMULATION] listPublicFiles for path: ${path}`);
  return listFiles(path, true);
};


export const createFolder = async (
  parentPath: string,
  name: string
): Promise<FileNode> => {
  // ... (createFolder implementation remains the same)
  const fullPath = `${parentPath === "/" ? "" : parentPath}/${name}`;
  console.log(`[SIMULATION] createFolder: ${fullPath}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!mockFileSystem[parentPath]) {
        reject({
          message: `Parent path not found: ${parentPath}`,
          statusCode: 404,
        });
        return;
      }
      if (
        mockFileSystem[parentPath]?.some(
          (node) => node.name === name && node.is_directory
        )
      ) {
        reject({ message: `Folder already exists: ${name}`, statusCode: 409 });
        return;
      }
      const newFolder: FileNode = {
        id: `sim-folder-${Date.now()}`,
        name: name,
        is_directory: true,
        path: fullPath,
        owner_username: "testuser",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockFileSystem[parentPath]?.push(newFolder);
      mockFileSystem[fullPath] = [];
      console.log("[SIMULATION] createFolder successful:", newFolder);
      resolve(newFolder);
    }, 300);
  });
};

export const deleteNode = async (nodePath: string): Promise<void> => {
  // ... (deleteNode implementation remains the same)
  console.log(`[SIMULATION] deleteNode: ${nodePath}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const parentPath =
        nodePath.substring(0, nodePath.lastIndexOf("/")) || "/";
      const nodeExistsInParent = mockFileSystem[parentPath]?.some(
        (node) => node.path === nodePath
      );

      if (!nodeExistsInParent && !mockFileSystem.hasOwnProperty(nodePath)) {
        reject({ message: `Node not found: ${nodePath}`, statusCode: 404 });
        return;
      }
      if (mockFileSystem[parentPath]) {
        mockFileSystem[parentPath] =
          mockFileSystem[parentPath]?.filter(
            (node) => node.path !== nodePath
          ) ?? [];
      }
      if (mockFileSystem.hasOwnProperty(nodePath)) {
        // For simulation, if it's a directory, we also need to remove its children's entries if they were flat
        // This simple delete won't handle deep recursive deletes of mockFileSystem keys.
        delete mockFileSystem[nodePath];
      }
      console.log("[SIMULATION] deleteNode successful.");
      resolve();
    }, 300);
  });
};

/**
 * Renames a file or folder.
 *
 * **Integration Notes:** (comments remain the same)
 *
 * @param oldPath - The current full path of the item.
 * @param newName - The desired new name (not the full path).
 * @returns A Promise resolving with the updated FileNode or rejecting with an ApiError.
 */
export const renameNode = async (
  oldPath: string,
  newName: string
): Promise<FileNode> => {
  console.log(
    `[SIMULATION] renameNode: from "${oldPath}" to new name "${newName}"`
  );
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf("/")) || "/";
      const nodeIndex = mockFileSystem[parentPath]?.findIndex(
        (node) => node.path === oldPath
      );

      if (
        nodeIndex === undefined ||
        nodeIndex === -1 ||
        !mockFileSystem[parentPath]
      ) {
        console.error(
          `[SIMULATION] renameNode: Node not found in parent list: ${oldPath}`
        );
        reject({ message: `Node not found: ${oldPath}`, statusCode: 404 });
        return;
      }

      const itemToUpdate = mockFileSystem[parentPath]![nodeIndex]!;
      const newFullPath = `${parentPath === "/" ? "" : parentPath}/${newName}`;

      // Check for name conflict in the same directory
      if (
        mockFileSystem[parentPath]!.some(
          (node) => node.name === newName && node.path !== oldPath
        )
      ) {
        console.error(
          `[SIMULATION] renameNode: Name conflict for "${newName}" in "${parentPath}"`
        );
        reject({
          message: `An item named "${newName}" already exists in this location.`,
          statusCode: 409,
        });
        return;
      }

      // Update the item in its parent's list
      const updatedItemInParentList: FileNode = {
        ...itemToUpdate,
        name: newName,
        path: newFullPath,
        updated_at: new Date().toISOString(),
      };
      mockFileSystem[parentPath]![nodeIndex] = updatedItemInParentList;
      console.log(
        `[SIMULATION] renameNode: Updated item in parent list. New path: ${newFullPath}`
      );

      // If it was a directory, handle its children and its own entry in mockFileSystem
      if (itemToUpdate.is_directory) {
        console.log(
          `[SIMULATION] renameNode: Item is a directory. Old key: ${oldPath}, New key: ${newFullPath}`
        );
        recursivelyUpdatePathsAndMoveChildren(oldPath, newFullPath);
      }

      console.log(
        "[SIMULATION] renameNode successful, returning:",
        updatedItemInParentList
      );
      resolve(updatedItemInParentList); // Return the updated node as it appears in its parent's list
    }, 300);
  });
};
