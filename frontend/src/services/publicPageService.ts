import type { PublicPageNode, ApiError } from "../types";
import apiClient from "./apiClient";

const BASE_PUBLIC_PAGES_API_URL = "/public-pages/";

export const listMyPublicPages = async (): Promise<PublicPageNode[]> => {
  try {
    const response = await apiClient.get<PublicPageNode[]>(
      BASE_PUBLIC_PAGES_API_URL
    );
    return response.data;
  } catch (error: any) {
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

export const uploadPublicHTMLFile = async (
  publicFilename: string,
  htmlFileObject: File
): Promise<PublicPageNode> => {
  const formData = new FormData();
  formData.append("name", publicFilename);
  formData.append("html_file", htmlFileObject);
  try {
    const response = await apiClient.post<PublicPageNode>(
      BASE_PUBLIC_PAGES_API_URL,
      formData,
      {}
    );
    return response.data;
  } catch (error: any) {
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.response?.data?.name?.[0] ||
        error.response?.data?.html_file?.[0] ||
        error.message ||
        "Failed to upload public HTML file.",
      statusCode: error.response?.status,
      detail: error.response?.data,
    };
    throw apiError;
  }
};

export const deletePublicPage = async (pageId: string): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_PUBLIC_PAGES_API_URL}${pageId}/`);
  } catch (error: any) {
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
