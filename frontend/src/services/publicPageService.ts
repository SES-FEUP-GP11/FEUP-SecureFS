import type { PublicPageNode, ApiError } from "../types";
import apiClient from "./apiClient"; // Assuming apiClient is configured with Authorization interceptor

const BASE_PUBLIC_PAGES_URL = "/public-pages/manage/"; // Base for CRUD operations

/**
 * Fetches the list of the current user's public HTML pages.
 * API: GET /api/public-pages/manage/
 */
export const listMyPublicPages = async (): Promise<PublicPageNode[]> => {
  console.log("[API] listMyPublicPages: Fetching user's public pages.");
  try {
    const response = await apiClient.get<PublicPageNode[]>(
      BASE_PUBLIC_PAGES_URL
    );
    console.log(
      "[API] listMyPublicPages successful. Received items:",
      response.data.length
    );
    return response.data;
  } catch (error: any) {
    console.error("[API] listMyPublicPages failed:", error);
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch public pages.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};

/**
 * Uploads/Creates a new public HTML page for the current user.
 * API: POST /api/public-pages/manage/
 * @param filename - The desired public filename (e.g., "index.html").
 * @param htmlFile - The HTML File object to upload.
 */
export const uploadPublicHTMLFile = async (
  filename: string,
  htmlFile: File
): Promise<PublicPageNode> => {
  console.log(
    `[API] uploadPublicHTMLFile: Uploading "${htmlFile.name}" as public filename "${filename}"`
  );

  const formData = new FormData();
  formData.append("filename", filename); // User-defined public filename
  formData.append("html_file", htmlFile); // The actual file content

  try {
    const response = await apiClient.post<PublicPageNode>(
      BASE_PUBLIC_PAGES_URL,
      formData,
      {
        headers: {
          // Content-Type is set automatically by browser for FormData
        },
      }
    );
    console.log("[API] uploadPublicHTMLFile successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("[API] uploadPublicHTMLFile failed:", error);
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.response?.data?.filename?.[0] ||
        error.response?.data?.html_file?.[0] ||
        error.message ||
        "Failed to upload public HTML file.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};

/**
 * Deletes a public HTML page by its ID.
 * API: DELETE /api/public-pages/manage/{id}/
 * @param pageId - The UUID of the PublicPageNode to delete.
 */
export const deletePublicPage = async (pageId: string): Promise<void> => {
  console.log(`[API] deletePublicPage: Deleting page ID: ${pageId}`);
  try {
    await apiClient.delete(`${BASE_PUBLIC_PAGES_URL}${pageId}/`);
    console.log(`[API] deletePublicPage successful for ID: ${pageId}`);
  } catch (error: any) {
    console.error(`[API] deletePublicPage failed for ID ${pageId}:`, error);
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.message ||
        "Failed to delete public page.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};
