import type { FileNode, ApiError } from "../types";
import apiClient from "./apiClient";

// Mock data only for functions NOT YET connected to backend
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_public_root: true,
    },
    {
      id: "sim-folder-docs",
      name: "Docs",
      is_directory: true,
      path: "/Docs",
      logical_path: "/Docs",
      owner_username: "testuser",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  "/public": [
    {
      id: "sim-file-readme",
      name: "README.md",
      is_directory: false,
      path: "/public/README.md",
      logical_path: "/public/README.md",
      size_bytes: 100,
      mime_type: "text/markdown",
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  "/Docs": [
    {
      id: "sim-file-plan",
      name: "plan.txt",
      is_directory: false,
      path: "/Docs/plan.txt",
      logical_path: "/Docs/plan.txt",
      size_bytes: 200,
      mime_type: "text/plain",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};
const recursivelyUpdatePathsAndMoveChildren_sim = (
  oldDirKey: string,
  newDirKey: string
) => {
  /* ... simulation helper ... */
};

export const listFiles = async (
  path: string,
  isPublicContext: boolean = false
): Promise<FileNode[]> => {
  const requestPath = path || "/";
  const params: { path?: string } = {};
  if (requestPath !== "/") {
    params.path = requestPath;
  }
  const endpoint = isPublicContext ? `/public-files/` : `/files/`;

  try {
    const response = await apiClient.get<FileNode[]>(endpoint, { params });
    return response.data.map((node) => ({
      ...node,
      path: node.logical_path,
      is_public:
        node.is_public_root || node.logical_path.startsWith("/public/"),
    }));
  } catch (error: any) {
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch files.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};

export const listPublicFiles = async (
  path: string = "/"
): Promise<FileNode[]> => {
  let effectivePath = path;
  if (path === "/") {
    effectivePath = "/public";
  } else if (!path.startsWith("/public")) {
    effectivePath = `/public${path.startsWith("/") ? "" : "/"}${path}`;
  }
  return listFiles(effectivePath, true);
};

/**
 * Creates a new folder on the backend.
 * @param folderName - The name for the new folder.
 * @param parentNodeId - The UUID of the parent folder, or null if creating in root.
 * @returns A Promise resolving with the created FileNode or rejecting with an ApiError.
 */
export const createFolder = async (
  folderName: string,
  parentNodeId: string | null // Changed from parentLogicalPath
): Promise<FileNode> => {
  console.log(
    `[API] createFolder: creating "${folderName}" under parent ID: ${parentNodeId}`
  );

  const requestBody = {
    name: folderName,
    is_directory: true,
    parent: parentNodeId, // Send 'parent' with ID or null, as expected by backend
  };

  try {
    // Backend POST /api/files/ endpoint expects 'parent' (ID or null)
    const response = await apiClient.post<FileNode>("/files/", requestBody);

    console.log("[API] createFolder successful:", response.data);
    return {
      ...response.data,
      path: response.data.logical_path,
    };
  } catch (error: any) {
    console.error("[API] createFolder failed:", error);
    const apiError: ApiError = {
      // Try to get a more specific error message from Django REST Framework validation errors
      message:
        error.response?.data?.parent?.[0] || // Check for parent field error
        error.response?.data?.name?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.message ||
        "Failed to create folder.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};

// --- Remaining SIMULATED FUNCTIONS ---
const MOCK_DELAY = 300;

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
      );
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
