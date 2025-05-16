import type { FileNode, ApiError } from "../types";
import apiClient from "./apiClient";

const mockFileSystem: Record<string, FileNode[]> = {
  "/": [
    {
      id: "sim-folder-public",
      name: "public",
      is_directory: true,
      path: "/public",
      owner_username: "testuser",
      is_public: true,
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
  "/Docs/Archive": [],
};

const recursivelyUpdatePathsAndMoveChildren = (
  oldDirKey: string,
  newDirKey: string
) => {
  if (!mockFileSystem.hasOwnProperty(oldDirKey)) return;
  const childrenToMove = mockFileSystem[oldDirKey]!;
  delete mockFileSystem[oldDirKey];
  mockFileSystem[newDirKey] = [];
  for (const child of childrenToMove) {
    const oldChildPath = child.path;
    const newChildPath = oldChildPath.startsWith(oldDirKey + "/")
      ? newDirKey + oldChildPath.substring(oldDirKey.length)
      : newDirKey + "/" + child.name;
      : newDirKey + "/" + child.name;
    const updatedChild = { ...child, path: newChildPath };
    mockFileSystem[newDirKey].push(updatedChild);
    if (updatedChild.is_directory)
      recursivelyUpdatePathsAndMoveChildren(oldChildPath, newChildPath);
  }
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
            )
          : [...mockFileSystem[normalizedPath]!];
        resolve(items);
      } else {
        reject({
          message: `Directory not found: ${normalizedPath}`,
          statusCode: 404,
        });
      }
    }, 300);
  });
};

export const listPublicFiles = async (
  path: string = "/"
): Promise<FileNode[]> => {
  console.log(`[SIMULATION] listPublicFiles for path: ${path}`);
  if (!path.startsWith("/public") && path !== "/")
    return listFiles("/public", true);
  return listFiles(path, true);
};

export const createFolder = async (
  parentPath: string,
  name: string
): Promise<FileNode> => {
  const fullPath = `${parentPath === "/" ? "" : parentPath}/${name}`;
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
        is_public: parentPath.startsWith("/public"),
      };
      mockFileSystem[parentPath]?.push(newFolder);
      mockFileSystem[fullPath] = [];
      resolve(newFolder);
    }, 300);
  });
};

export const renameNode = async (
  oldPath: string,
  newName: string
): Promise<FileNode> => {
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
        reject({
          message: `Target directory not found: ${targetPath}`,
          statusCode: 404,
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
      if (itemToUpdate.is_directory)
        recursivelyUpdatePathsAndMoveChildren(oldPath, newFullPath);
      resolve(updatedItemInParentList);
    }, 300);
  });
};

export const deleteNode = async (nodePath: string): Promise<void> => {
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
      if (mockFileSystem[parentPath])
        mockFileSystem[parentPath] =
          mockFileSystem[parentPath]?.filter(
            (node) => node.path !== nodePath
          ) ?? [];
      if (mockFileSystem.hasOwnProperty(nodePath))
        delete mockFileSystem[nodePath];
      resolve();
    }, 300);
  });
};

export const uploadFile = async (
  file: File,
  targetPath: string
): Promise<FileNode> => {
  const fullPath = `${targetPath === "/" ? "" : targetPath}/${file.name}`;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!mockFileSystem.hasOwnProperty(targetPath)) {
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
        is_public: targetPath.startsWith("/public"),
      };
      mockFileSystem[targetPath]?.push(newFileNode);
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
          const targetNode = Object.values(mockFileSystem)
            .flat()
            .find((n) => n.path === targetCdPath);
          if (targetNode && targetNode.is_directory) newPath = targetCdPath;
          else if (targetNode && !targetNode.is_directory)
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
          const newDirName = args[0];
          // Ensure currentPath is valid before trying to create a directory in it
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
            mockFileSystem[newDirPath] = [];
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
  if (target.startsWith("/")) return target;
  const parts = current.split("/").filter((p) => p);
  const targetParts = target.split("/").filter((p) => p);
  for (const part of targetParts) {
    if (part === "..") {
      if (parts.length > 0) parts.pop();
    } else if (part !== "." && part !== "") parts.push(part);
  }
  const resolved = `/${parts.join("/")}`;
  return resolved === "//" ? "/" : resolved || "/"; // Handle edge cases like cd .. from root
};
