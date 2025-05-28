import type { User, ApiError } from "../types"; // Assuming User type is defined here
import apiClient from "./apiClient";
import { tokenService } from "./tokenService";

interface LoginResponse {
  access: string;
  refresh: string;
}

export const login = async (
  email?: string,
  password?: string
): Promise<LoginResponse> => {
  if (!email || !password) {
    throw {
      message: "Email and password are required.",
      statusCode: 400,
    } as ApiError;
  }
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  try {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login/",
      formData
    );
    if (response.data && response.data.access && response.data.refresh) {
      tokenService.setTokens(response.data.access, response.data.refresh);
      return response.data;
    } else {
      throw {
        message: "Login failed: Invalid response from server.",
        statusCode: 500,
      } as ApiError;
    }
  } catch (error: any) {
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.message ||
        "Login request failed.",
      statusCode: error.response?.status || 500,
      detail: error.response?.data,
    };
    throw apiError;
  }
};

export const logout = async (): Promise<void> => {
  // Optional: Call backend to invalidate refresh token
  // await apiClient.post('/auth/logout/', { refresh: tokenService.getRefreshToken() });
  tokenService.clearTokens();
};

export const getCurrentUser = async (): Promise<User> => {
  if (!tokenService.getAccessToken()) {
    throw {
      message: "Not authenticated (no access token).",
      statusCode: 401,
    } as ApiError;
  }
  try {
    const response = await apiClient.get<User>("/auth/user/");
    if (response.data) {
      return response.data;
    } else {
      throw {
        message: "Failed to get user details: Invalid response.",
        statusCode: 500,
      } as ApiError;
    }
  } catch (error: any) {
    if (error.response?.status === 401) tokenService.clearTokens();
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch user details.",
      statusCode: error.response?.status || 500,
      detail: error.response?.data,
    };
    throw apiError;
  }
};

/**
 * Fetches a list of users from the backend, excluding the current user.
 * @returns A Promise resolving with an array of User objects.
 */
export const listUsers = async (): Promise<User[]> => {
  console.log("[authService] Attempting to fetch list of users from API.");
  if (!tokenService.getAccessToken()) {
    console.warn("[authService] No access token found for listUsers.");
    throw {
      message: "Not authenticated (no access token).",
      statusCode: 401,
    } as ApiError;
  }

  try {
    // The apiClient interceptor will add the Authorization header.
    // Backend endpoint is GET /api/auth/users/
    const response = await apiClient.get<User[]>("/auth/users/");
    if (response.data) {
      console.log(
        "[authService] Fetched user list successfully:",
        response.data.length,
        "users"
      );
      return response.data; // Backend returns an array of User objects
    } else {
      console.error(
        "[authService] List users response missing data:",
        response.data
      );
      throw {
        message: "Failed to get user list: Invalid response from server.",
        statusCode: 500,
      } as ApiError;
    }
  } catch (error: any) {
    console.error("[authService] List users error:", error);
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch user list.",
      statusCode: error.response?.status || 500,
      detail: error.response?.data,
    };
    throw apiError;
  }
};
