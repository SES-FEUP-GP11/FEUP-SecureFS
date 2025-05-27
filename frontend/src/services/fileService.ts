import type { FileNode, ApiError } from "../types";
import apiClient from "./apiClient";

// --- Mock File System Data (FOR SIMULATION of non-listFiles operations ONLY) ---
// This is the version you provided earlier.
const mockFileSystem_for_simulations: Record<string, FileNode[]> = {
  "/": [
    {
      id: "sim-folder-public",
      name: "public",
      is_directory: true,
      path: "/public",
      logical_path: "/public",
      owner_username: "testuser",
      is_public: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      is_public_root: true,
    },
    {
      id: "sim-folder-docs",
      name: "Docs",
      is_directory: true,
      path: "/Docs",
      logical_path: "/Docs",
      owner_username: "testuser",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "sim-folder-pics",
      name: "Pictures",
      is_directory: true,
      path: "/Pictures",
      logical_path: "/Pictures",
      owner_username: "testuser",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "sim-file-report",
      name: "report.txt",
      is_directory: false,
      path: "/report.txt",
      logical_path: "/report.txt",
      size_bytes: 1024,
      mime_type: "text/plain",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  "/public": [
    {
      id: "sim-file-public-readme",
      name: "README.md",
      is_directory: false,
      path: "/public/README.md",
      logical_path: "/public/README.md",
      size_bytes: 2048,
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
      logical_path: "/public/portfolio.html",
      size_bytes: 5120,
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
      logical_path: "/public/assets",
      owner_username: "testuser",
      is_public: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      is_public_root: false,
    },
  ],
  "/public/assets": [
    {
      id: "sim-file-public-logo",
      name: "logo.png",
      is_directory: false,
      path: "/public/assets/logo.png",
      logical_path: "/public/assets/logo.png",
      size_bytes: 10240,
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
      logical_path: "/Docs/project_plan.docx",
      size_bytes: 51200,
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
      logical_path: "/Docs/Archive",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "sim-folder-test",
      name: "Test",
      is_directory: true,
      path: "/Docs/Test",
      logical_path: "/Docs/Test",
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
      logical_path: "/Docs/Test/subtest.txt",
      size_bytes: 50,
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
      logical_path: "/Pictures/vacation.jpg",
      size_bytes: 204800,
      mime_type: "image/jpeg",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  "/Docs/Archive": [],
};
// --- END SIMULATION DATA for other functions ---

const recursivelyUpdatePathsAndMoveChildren_sim = (
  oldDirKey: string,
  newDirKey: string
) => {
  if (!mockFileSystem_for_simulations.hasOwnProperty(oldDirKey)) return;
  const childrenToMove = mockFileSystem_for_simulations[oldDirKey]!;
  delete mockFileSystem_for_simulations[oldDirKey];
  mockFileSystem_for_simulations[newDirKey] = [];
  for (const child of childrenToMove) {
    const oldChildPath = child.logical_path; // Use logical_path for consistency
    const newChildPath = oldChildPath.startsWith(oldDirKey + "/")
      ? newDirKey + oldChildPath.substring(oldDirKey.length)
      : newDirKey + "/" + child.name;
    const updatedChild = {
      ...child,
      path: newChildPath,
      logical_path: newChildPath,
    };
    mockFileSystem_for_simulations[newDirKey].push(updatedChild);
    if (updatedChild.is_directory) {
      recursivelyUpdatePathsAndMoveChildren_sim(oldChildPath, newChildPath);
    }
  }
};

/**
 * Fetches the list of files and folders for a given path from the backend.
 */
export const listFiles = async (
  path: string,
  isPublicContext: boolean = false // Used by FilesPage to indicate context
): Promise<FileNode[]> => {
  const requestPath = path || "/"; // Ensure path is at least "/" for the service call
  console.log(
    `[API] listFiles for path: ${requestPath}${
      isPublicContext ? " (Public Context)" : ""
    }`
  );

  const params: { path?: string } = {};
  // Only add path parameter if it's not the root, as backend defaults to root if param is absent.
  if (requestPath !== "/") {
    params.path = requestPath;
  }

  // Determine the API endpoint.
  // For now, assume the same '/files/' endpoint is used, and backend distinguishes
  // public if the path itself indicates it (e.g., starts with '/public')
  // or if additional query params (not shown here) were used.
  const endpoint = "/files/";

  try {
    console.log(
      `[API] Calling: GET ${apiClient.defaults.baseURL}${endpoint.substring(
        1
      )}`,
      { params }
    );
    // Backend is expected to return an array of objects matching FileNode structure.
    // Fields like 'logical_path' and 'size_bytes' should come from backend.
    const response = await apiClient.get<FileNode[]>(endpoint, { params });

    console.log(
      `[API] listFiles successful for ${requestPath}. Received ${response.data.length} items.`
    );
    // Map backend response to ensure frontend FileNode structure is met,
    // especially if there are minor differences or fields to derive client-side.
    // The updated FileNode type in types/index.ts now uses 'logical_path' and 'size_bytes'.
    return response.data.map((node) => {
      // The 'path' property was used in simulation, ensure it's consistent with logical_path
      // If backend sends 'logical_path', it's already on our FileNode type.
      // If frontend components specifically use 'path', ensure it's logical_path.
      // For safety, we can ensure our 'path' is the same as 'logical_path'.
      const frontendNode: FileNode = {
        ...node,
        path: node.logical_path, // Ensure 'path' is always the logical_path for frontend use
        is_public:
          node.is_public_root || node.logical_path.startsWith("/public/"), // Example derivation
      };
      return frontendNode;
    });
  } catch (error: any) {
    console.error(`[API] listFiles failed for ${requestPath}:`, error);
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch files.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};

/**
 * Lists public files. This now calls the main listFiles with a flag,
 * assuming the backend /api/files/ endpoint can differentiate access
 * or the path itself dictates public visibility.
 */
export const listPublicFiles = async (
  path: string = "/"
): Promise<FileNode[]> => {
  console.log(`[API] listPublicFiles for path: ${path}`);
  // The path here should be relative to the public root if that's how backend handles it
  // e.g. if public root is /public, path "/" here means "/public" to listFiles
  let effectivePath = path;
  if (path === "/") {
    // Root of public files
    effectivePath = "/public"; // Assuming "/public" is the designated root public folder name
  } else if (!path.startsWith("/public")) {
    effectivePath = `/public${path.startsWith("/") ? "" : "/"}${path}`;
  }
  return listFiles(effectivePath, true);
};

// --- SIMULATED FUNCTIONS for other operations ---
const MOCK_DELAY = 300;

export const createFolder = async (
  parentPath: string,
  name: string
): Promise<FileNode> => {
  const fullPath = `${parentPath === "/" ? "" : parentPath}/${name}`;
  console.log(`[SIMULATION] createFolder: ${fullPath}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockFS = mockFileSystem_for_simulations;
      if (!mockFS[parentPath]) {
        reject({
          message: `Parent path not found: ${parentPath}`,
          statusCode: 404,
        });
        return;
      }
      if (
        mockFS[parentPath]?.some(
          (node) => node.name === name && node.is_directory
        )
      ) {
        reject({ message: `Folder already exists: ${name}`, statusCode: 409 });
        return;
      }
      const newFolder: FileNode = {
        id: `sim-folder-${Date.now()}`,
        name,
        is_directory: true,
        path: fullPath,
        logical_path: fullPath,
        owner_username: "testuser",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_public: parentPath.startsWith("/public"),
      };
      mockFS[parentPath] = [...(mockFS[parentPath] || []), newFolder];
      mockFS[fullPath] = [];
      resolve(newFolder);
    }, MOCK_DELAY);
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
      const mockFS = mockFileSystem_for_simulations;
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf("/")) || "/";
      const nodeIndex = mockFS[parentPath]?.findIndex(
        (node) => node.logical_path === oldPath
      ); // Use logical_path
      if (nodeIndex === undefined || nodeIndex === -1 || !mockFS[parentPath]) {
        reject({ message: `Node not found: ${oldPath}`, statusCode: 404 });
        return;
      }
      const itemToUpdate = mockFS[parentPath]![nodeIndex]!;
      const newFullPath = `${parentPath === "/" ? "" : parentPath}/${newName}`;
      if (
        mockFS[parentPath]!.some(
          (node) => node.name === newName && node.logical_path !== oldPath
        )
      ) {
        reject({
          message: `An item named "${newName}" already exists.`,
          statusCode: 409,
        });
        return;
      }
      const updatedItemInParentList: FileNode = {
        ...itemToUpdate,
        name: newName,
        path: newFullPath,
        logical_path: newFullPath,
        updated_at: new Date().toISOString(),
      };
      mockFS[parentPath]![nodeIndex] = updatedItemInParentList;
      if (itemToUpdate.is_directory)
        recursivelyUpdatePathsAndMoveChildren_sim(oldPath, newFullPath);
      resolve(updatedItemInParentList);
    }, MOCK_DELAY);
  });
};

export const deleteNode = async (nodePath: string): Promise<void> => {
  console.log(`[SIMULATION] deleteNode: ${nodePath}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockFS = mockFileSystem_for_simulations;
      const parentPath =
        nodePath.substring(0, nodePath.lastIndexOf("/")) || "/";
      const nodeExistsInParent = mockFS[parentPath]?.some(
        (node) => node.logical_path === nodePath
      );
      if (!nodeExistsInParent && !mockFS.hasOwnProperty(nodePath)) {
        reject({ message: `Node not found: ${nodePath}`, statusCode: 404 });
        return;
      }
      if (mockFS[parentPath])
        mockFS[parentPath] =
          mockFS[parentPath]?.filter(
            (node) => node.logical_path !== nodePath
          ) ?? [];
      if (mockFS.hasOwnProperty(nodePath)) delete mockFS[nodePath];
      resolve();
    }, MOCK_DELAY);
  });
};

export const uploadFile = async (
  file: File,
  targetPath: string
): Promise<FileNode> => {
  const fullPath = `${targetPath === "/" ? "" : targetPath}/${file.name}`;
  console.log(`[SIMULATION] uploadFile: "${file.name}" to "${targetPath}"`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockFS = mockFileSystem_for_simulations;
      if (!mockFS.hasOwnProperty(targetPath)) {
        reject({
          message: `Target directory not found: ${targetPath}`,
          statusCode: 404,
        });
        return;
      }
      if (
        mockFS[targetPath]?.some(
          (node) => node.name === file.name && !node.is_directory
        )
      ) {
        mockFS[targetPath] = mockFS[targetPath]!.filter(
          (node) => node.name !== file.name
        );
      }
      const newFileNode: FileNode = {
        id: `sim-file-${Date.now()}`,
        name: file.name,
        is_directory: false,
        path: fullPath,
        logical_path: fullPath,
        size_bytes: file.size,
        mime_type: file.type || "application/octet-stream",
        owner_username: "testuser",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_public: targetPath.startsWith("/public"),
      };
      mockFS[targetPath]?.push(newFileNode);
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
  return new Promise((resolve) => {
    setTimeout(() => {
      const [command, ...args] = commandLine.trim().split(/\s+/);
      let output: string | null = null;
      let error: string | null = null;
      let newPath: string | undefined = undefined;
      const mockFS = mockFileSystem_for_simulations;
      switch (command.toLowerCase()) {
        case "ls":
          const p = args[0] ? resolvePath(currentPath, args[0]) : currentPath;
          if (mockFS[p])
            output =
              mockFS[p]
                .map((i) => i.name + (i.is_directory ? "/" : ""))
                .join("\n") || "(empty)";
          else
            error = `ls: cannot access '${
              args[0] || p
            }': No such file or directory`;
          break;
        case "cd":
          if (!args[0]) {
            error = "cd: missing operand";
            break;
          }
          const np = resolvePath(currentPath, args[0]);
          const tn = Object.values(mockFS)
            .flat()
            .find((n) => n.logical_path === np);
          if (tn && tn.is_directory) newPath = np;
          else if (tn && !tn.is_directory)
            error = `cd: ${args[0]}: Not a directory`;
          else error = `cd: ${args[0]}: No such file or directory`;
          break;
        case "pwd":
          output = currentPath;
          break;
        case "mkdir":
          if (!args[0]) {
            error = "mkdir: missing operand";
            break;
          }
          const dN = args[0];
          if (!mockFS[currentPath]) {
            error = `mkdir: cannot create directory '${dN}': Current path '${currentPath}' does not exist`;
            break;
          }
          const dP = resolvePath(currentPath, dN);
          if (mockFS[currentPath]?.some((n) => n.name === dN) || mockFS[dP]) {
            error = `mkdir: cannot create directory '${dN}': File exists`;
          } else {
            const nF: FileNode = {
              id: `sS${Date.now()}`,
              name: dN,
              is_directory: true,
              path: dP,
              logical_path: dP,
              created_at: "",
              updated_at: "",
            };
            mockFS[currentPath]?.push(nF);
            mockFS[dP] = [];
            output = `Directory '${dN}' created.`;
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
    }, MOCK_DELAY);
  });
};

const resolvePath = (current: string, target: string): string => {
  if (target.startsWith("/")) {
    if (target !== "/" && target.endsWith("/")) return target.slice(0, -1);
    return target;
  }
  const currentParts = current.split("/").filter((p) => p);
  const targetParts = target.split("/").filter((p) => p);
  for (const part of targetParts) {
    if (part === "..") {
      if (currentParts.length > 0) currentParts.pop();
    } else if (part !== "." && part !== "") currentParts.push(part);
  }
  const resolved = `/${currentParts.join("/")}`;
  return resolved === "//" ? "/" : resolved || "/";
};
