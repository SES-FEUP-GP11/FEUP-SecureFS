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

export const listFiles = async (
  path: string,
  isPublicContext: boolean = false
): Promise<FileNode[]> => {
  console.log(
    `[SIMULATION] listFiles for path: ${path}${
      isPublicContext ? " (Public Context)" : ""
    }`
  );
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const normalizedPath = path || "/";
      if (mockFileSystem.hasOwnProperty(normalizedPath)) {
        const items = isPublicContext
          ? mockFileSystem[normalizedPath]!.filter(
              (item) => item.is_public || item.path.startsWith("/public/")
            ) // Simplified: check item flag or if under /public
          : [...mockFileSystem[normalizedPath]!]; // Return a copy for private context

        console.log(
          `[SIMULATION] listFiles successful for ${normalizedPath}:`,
          items
        );
        resolve(items);
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

export const listPublicFiles = async (
  path: string = "/"
): Promise<FileNode[]> => {
  console.log(`[SIMULATION] listPublicFiles for path: ${path}`);
  // For simulation, we can reuse listFiles and ensure it only returns public items.
  // This assumes listFiles can differentiate or the paths are distinct.
  // For now, we'll assume path for public files starts with '/public'
  if (!path.startsWith("/public") && path !== "/") {
    // If trying to list non-public root as public, treat as root of public
    return listFiles("/public", true);
  }
  return listFiles(path, true);
};

export const createFolder = async (
  parentPath: string,
  name: string
): Promise<FileNode> => {
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
        is_public: parentPath.startsWith("/public"), // Inherit public status if created in public folder
      };
      mockFileSystem[parentPath]?.push(newFolder);
      mockFileSystem[fullPath] = [];
      console.log("[SIMULATION] createFolder successful:", newFolder);
      resolve(newFolder);
    }, 300);
  });
};

export const deleteNode = async (nodePath: string): Promise<void> => {
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
        // Basic simulation: if it's a directory, just remove its key.
        // A real backend would handle recursive deletion of contents.
        // For a more robust simulation, we might need to recursively delete child keys from mockFileSystem.
        delete mockFileSystem[nodePath];
      }
      console.log("[SIMULATION] deleteNode successful.");
      resolve();
    }, 300);
  });
};

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
      resolve(updatedItemInParentList);
    }, 300);
  });
};

export const uploadFile = async (
  file: File,
  targetPath: string
): Promise<FileNode> => {
  const fullPath = `${targetPath === "/" ? "" : targetPath}/${file.name}`;
  console.log(
    `[SIMULATION] uploadFile: Uploading "${file.name}" to "${targetPath}" (full path: ${fullPath})`
  );

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!mockFileSystem.hasOwnProperty(targetPath)) {
        console.error(
          `[SIMULATION] uploadFile: Target directory "${targetPath}" not found.`
        );
        reject({
          message: `Target directory not found: ${targetPath}`,
          statusCode: 404,
        });
        return;
      }
      if (
        mockFileSystem[targetPath]?.some(
          (node) => node.name === file.name && !node.is_directory
        )
      ) {
        console.warn(
          `[SIMULATION] uploadFile: File "${file.name}" already exists in "${targetPath}". Overwriting.`
        );
        mockFileSystem[targetPath] = mockFileSystem[targetPath]!.filter(
          (node) => node.name !== file.name
        );
      }
      const newFileNode: FileNode = {
        id: `sim-file-${Date.now()}`,
        name: file.name,
        is_directory: false,
        path: fullPath,
        size: file.size,
        mime_type: file.type || "application/octet-stream",
        owner_username: "testuser",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_public: targetPath.startsWith("/public"), // Inherit public status
      };
      mockFileSystem[targetPath]?.push(newFileNode);
      console.log("[SIMULATION] uploadFile successful:", newFileNode);
      resolve(newFileNode);
    }, 1200);
  });
};

interface ShellCommandResult {
  output: string | null;
  error: string | null;
  newPath?: string;
}

export const executeShellCommand = async (
  commandLine: string,
  currentPath: string
): Promise<ShellCommandResult> => {
  console.log(
    `[SIMULATION] executeShellCommand: "${commandLine}" in path "${currentPath}"`
  );
  const [command, ...args] = commandLine.trim().split(/\s+/);

  return new Promise((resolve) => {
    setTimeout(() => {
      let output: string | null = null;
      let error: string | null = null;
      let newPath: string | undefined = undefined;

      switch (command.toLowerCase()) {
        case "ls":
          const targetLsPath = args[0]
            ? resolvePath(currentPath, args[0])
            : currentPath;
          if (mockFileSystem.hasOwnProperty(targetLsPath)) {
            const items = mockFileSystem[targetLsPath];
            if (items.length === 0) output = "(empty)";
            else
              output = items
                .map((item) => `${item.name}${item.is_directory ? "/" : ""}`)
                .join("\n");
          } else
            error = `ls: cannot access '${
              args[0] || targetLsPath
            }': No such file or directory`;
          break;
        case "cd":
          if (!args[0]) {
            error = "cd: missing operand";
            break;
          }
          const targetCdPath = resolvePath(currentPath, args[0]);
          // Check if targetCdPath exists as a key (for directories)
          // or if it's a path of a directory node in any listing
          const targetNode = Object.values(mockFileSystem)
            .flat()
            .find((n) => n.path === targetCdPath);
          if (targetNode && targetNode.is_directory) {
            newPath = targetCdPath;
            // Ensure the newPath also exists as a key in mockFileSystem for 'ls' to work correctly in it
            if (!mockFileSystem.hasOwnProperty(newPath) && newPath !== "/") {
              // This case might happen if we cd into a path that's valid but not explicitly a key
              // For simulation, we might need to ensure such keys exist if they represent directories
              console.warn(
                `[SIMULATION] cd: Target path ${newPath} is a directory node but not a direct key in mockFileSystem. 'ls' in this path might fail unless it's a root-level listed dir.`
              );
            }
          } else if (targetNode && !targetNode.is_directory) {
            error = `cd: ${args[0]}: Not a directory`;
          } else {
            error = `cd: ${args[0]}: No such file or directory`;
          }
          break;
        case "pwd":
          output = currentPath;
          break;
        case "mkdir":
          if (!args[0]) {
            error = "mkdir: missing operand";
            break;
          }
          const newDirName = args[0];
          if (!mockFileSystem.hasOwnProperty(currentPath)) {
            error = `mkdir: cannot create directory '${newDirName}': Current path '${currentPath}' does not exist`;
            break;
          }
          const newDirPath = resolvePath(currentPath, newDirName);
          if (
            mockFileSystem[currentPath]?.some((n) => n.name === newDirName) ||
            mockFileSystem.hasOwnProperty(newDirPath)
          ) {
            error = `mkdir: cannot create directory '${newDirName}': File exists`;
          } else {
            const newFolder: FileNode = {
              id: `sim-shell-folder-${Date.now()}`,
              name: newDirName,
              is_directory: true,
              path: newDirPath,
              owner_username: "testuser",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_public: currentPath.startsWith("/public"),
            };
            mockFileSystem[currentPath]?.push(newFolder);
            mockFileSystem[newDirPath] = []; // Ensure the new directory itself is a key
            output = `Directory '${newDirName}' created.`;
          }
          break;
        case "help":
          output =
            "Available commands:\n  ls [path]       List directory contents\n  cd <directory>  Change directory\n  pwd             Print working directory\n  mkdir <name>    Create directory\n  clear           Clear the terminal\n  help            Show this help message";
          break;
        default:
          error = `${command}: command not found`;
      }
      resolve({ output, error, newPath });
    }, 500);
  });
};

const resolvePath = (current: string, target: string): string => {
  if (target.startsWith("/")) {
    // Absolute path
    // Normalize: remove trailing slash unless it's the root
    if (target !== "/" && target.endsWith("/")) return target.slice(0, -1);
    return target;
  }

  const currentParts = current.split("/").filter((p) => p); // ['Docs', 'Test'] from '/Docs/Test'
  const targetParts = target.split("/").filter((p) => p);

  for (const part of targetParts) {
    if (part === "..") {
      if (currentParts.length > 0) {
        currentParts.pop();
      }
    } else if (part !== "." && part !== "") {
      currentParts.push(part);
    }
  }
  const resolved = `/${currentParts.join("/")}`;
  return resolved === "//" ? "/" : resolved || "/"; // Handle empty parts array or double slash at root
};
