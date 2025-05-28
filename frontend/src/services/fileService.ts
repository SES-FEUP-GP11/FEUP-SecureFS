import type { FileNode, ApiError, SharePermission } from "../types";
import apiClient from "./apiClient";

// Connected API functions
export const listFiles = async (
  path: string,
  isPublicContext: boolean = false
): Promise<FileNode[]> => {
  const requestPath = path || "/";
  const params: { path?: string } = {};
  if (requestPath !== "/") {
    params.path = requestPath;
  }
  const endpoint =
    isPublicContext && requestPath.startsWith("/public")
      ? `/files/`
      : `/files/`;
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
export const createFolder = async (
  folderName: string,
  parentNodeId: string | null
): Promise<FileNode> => {
  const requestBody = {
    name: folderName,
    is_directory: true,
    parent: parentNodeId,
  };
  try {
    const response = await apiClient.post<FileNode>("/files/", requestBody);
    return { ...response.data, path: response.data.logical_path };
  } catch (error: any) {
    const apiError: ApiError = {
      message:
        error.response?.data?.parent?.[0] ||
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
export const uploadFile = async (
  file: File,
  parentNodeId: string | null
): Promise<FileNode> => {
  const formData = new FormData();
  formData.append("file", file);
  if (parentNodeId) {
    formData.append("parent", parentNodeId);
  }
  try {
    const response = await apiClient.post<FileNode>("/files/upload/", formData);
    return { ...response.data, path: response.data.logical_path };
  } catch (error: any) {
    const apiError: ApiError = {
      message:
        error.response?.data?.file?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.message ||
        "Failed to upload file.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};
export const deleteNode = async (nodeId: string): Promise<void> => {
  try {
    await apiClient.delete(`/files/${nodeId}/`);
  } catch (error: any) {
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.message ||
        "Failed to delete item.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};
export const renameNode = async (
  nodeId: string,
  newName: string
): Promise<FileNode> => {
  const formData = new FormData();
  formData.append("name", newName);
  try {
    const response = await apiClient.patch<FileNode>(
      `/files/${nodeId}/rename/`,
      formData
    );
    return { ...response.data, path: response.data.logical_path };
  } catch (error: any) {
    const apiError: ApiError = {
      message:
        error.response?.data?.name?.[0] ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to rename item.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};
export const createShare = async (
  nodeId: string,
  sharedWithUserId: number,
  permissionLevel: "view" | "edit"
): Promise<SharePermission> => {
  const requestBody = {
    node: nodeId,
    shared_with_user: sharedWithUserId,
    permission_level: permissionLevel,
  };
  try {
    const response = await apiClient.post<SharePermission>(
      "/sharing/",
      requestBody
    );
    return response.data;
  } catch (error: any) {
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.message ||
        "Failed to share item.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};
export const listSharedWithMe = async (): Promise<FileNode[]> => {
  try {
    const response = await apiClient.get<FileNode[]>(
      "/sharing/shared-with-me/"
    );
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
        "Failed to fetch shared items.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};

/**
 * Fetches details for a specific FileSystemNode by its logical path from the backend.
 */
export const fetchNodeDetailsByPath = async (
  logicalPath: string
): Promise<FileNode> => {
  const requestPath = logicalPath || "/";
  if (requestPath === "/") {
    throw {
      message: "Cannot get details for conceptual root '/' via this endpoint.",
      statusCode: 400,
    } as ApiError;
  }
  try {
    const response = await apiClient.get<FileNode>(`/files/details-by-path/`, {
      params: { path: requestPath },
    });
    return { ...response.data, path: response.data.logical_path };
  } catch (error: any) {
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.message ||
        `Failed to fetch details for path ${requestPath}.`,
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};
