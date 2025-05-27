import type { User, ApiError } from "../types";
import apiClient from "./apiClient"; // Import the configured Axios instance
import { tokenService } from "./tokenService"; // Import tokenService

interface LoginResponse {
  access: string;
  refresh: string;
  // Backend might also return user details here, adjust as needed
  // user?: User;
}

/**
 * Logs in a user by making an API request.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns A Promise resolving with an object containing access and refresh tokens on success,
 * or rejecting with an ApiError.
 */
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

  console.log(`[authService] Attempting API login for email: ${email}`);

  // Backend expects multipart/form-data for this endpoint as per your curl
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  try {
    // Explicitly set Content-Type to undefined, so Axios sets the correct multipart boundary
    // Or rely on Axios to set it automatically when data is FormData instance.
    // If your apiClient has a default 'Content-Type': 'application/json', it needs to be overridden.
    // The interceptor in apiClient now handles this by not setting Content-Type if data is FormData.
    const response = await apiClient.post<LoginResponse>(
      "/auth/login/",
      formData,
      {
        // headers: { 'Content-Type': 'multipart/form-data' } // Axios typically handles this with FormData
      }
    );

    if (response.data && response.data.access && response.data.refresh) {
      tokenService.setTokens(response.data.access, response.data.refresh);
      console.log("[authService] API Login successful, tokens received.");
      // IMPORTANT: The backend login response only contains tokens.
      // We'll need a separate call to get user details, or the backend should return them.
      // For now, this function just returns the tokens. AuthContext will handle fetching user details.
      return response.data;
    } else {
      console.error(
        "[authService] API Login response missing tokens:",
        response.data
      );
      throw {
        message: "Login failed: Invalid response from server.",
        statusCode: 500,
      } as ApiError;
    }
  } catch (error: any) {
    console.error("[authService] API Login error:", error);
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Login request failed.",
      statusCode: error.response?.status || 500,
      detail: error.response?.data,
    };
    throw apiError;
  }
};

/**
 * Logs out a user.
 * In a real app, this would invalidate the token on the backend (if using refresh tokens)
 * and clear local tokens.
 * @returns A Promise resolving on successful logout.
 */
export const logout = async (): Promise<void> => {
  console.log("[authService] Attempting API logout.");
  try {
    // Optional: Call a backend endpoint to invalidate the refresh token
    // const refreshToken = tokenService.getRefreshToken();
    // if (refreshToken) {
    //   await apiClient.post('/auth/logout/', { refresh: refreshToken });
    // }
    console.log(
      "[authService] API Logout successful (simulated for now, only clearing local tokens)."
    );
  } catch (error: any) {
    console.error("[authService] API Logout error:", error);
    // Even if backend logout fails, proceed to clear local tokens
  } finally {
    tokenService.clearTokens(); // Always clear local tokens
  }
};

/**
 * Fetches the currently authenticated user's data.
 * Makes a GET request to /api/auth/user/ using the stored access token.
 * @returns A Promise resolving with the User object if authenticated, or rejecting with an ApiError.
 */
export const getCurrentUser = async (): Promise<User> => {
  console.log("[authService] Attempting to fetch current user from API.");
  if (!tokenService.getAccessToken()) {
    console.warn("[authService] No access token found for getCurrentUser.");
    throw {
      message: "Not authenticated (no access token).",
      statusCode: 401,
    } as ApiError;
  }

  try {
    // The request interceptor in apiClient will add the Authorization header
    const response = await apiClient.get<User>("/auth/user/"); // Adjust if your User type from backend differs
    if (response.data) {
      console.log(
        "[authService] Fetched current user successfully:",
        response.data
      );
      return response.data; // Assuming backend returns data matching our User type
    } else {
      console.error(
        "[authService] Get current user response missing data:",
        response.data
      );
      throw {
        message: "Failed to get user details: Invalid response from server.",
        statusCode: 500,
      } as ApiError;
    }
  } catch (error: any) {
    console.error("[authService] Get current user error:", error);
    // If token is invalid (e.g., 401), clear tokens
    if (error.response?.status === 401) {
      tokenService.clearTokens();
    }
    const apiError: ApiError = {
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch user details.",
      statusCode: error.response?.status || 500,
      detail: error.response?.data,
    };
    throw apiError;
  }
};
