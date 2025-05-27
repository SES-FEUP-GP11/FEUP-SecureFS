import axios from "axios";
import { tokenService } from "./tokenService"; // Import tokenService

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Default Content-Type is application/json.
  // For file uploads, we'll override this in the specific request.
});

// Request Interceptor: Adds the Authorization header if an access token exists
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("[apiClient] Token added to request headers.");
    }
    // For multipart/form-data, axios handles Content-Type if data is FormData
    // We set it to application/json by default, but it can be overridden
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor (Placeholder for future token refresh logic) ---
// apiClient.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const newAccessToken = await tokenService.refreshAccessToken(); // You'd implement this
//         if (newAccessToken) {
//           tokenService.setTokens(newAccessToken, tokenService.getRefreshToken() || ''); // Update access token
//           apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
//           originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
//           return apiClient(originalRequest);
//         }
//       } catch (refreshError) {
//         // Logout user if refresh fails
//         tokenService.clearTokens();
//         // window.location.href = '/login'; // Or use context to trigger logout
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
