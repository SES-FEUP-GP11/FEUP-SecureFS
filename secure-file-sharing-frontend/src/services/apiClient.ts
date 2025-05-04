// src/services/apiClient.ts
import axios from 'axios';

// Retrieve the API base URL from environment variables
// Fallback to a default localhost URL if not set
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Axios instance configured for making API requests.
 * Sets the base URL and default headers.
 * Later, we'll add interceptors for auth tokens and error handling.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Uncomment if using session cookies later
});

// --- Interceptors (Add later in Phase 6: Backend Integration) ---
// apiClient.interceptors.request.use(config => {
//   // Logic to add Authorization header (e.g., Bearer token)
//   return config;
// });

// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     // Global error handling (e.g., for 401 Unauthorized)
//     return Promise.reject(error);
//   }
// );

export default apiClient;