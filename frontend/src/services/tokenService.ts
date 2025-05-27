const ACCESS_TOKEN_KEY = 'accessToken'; // In-memory storage for access token
const REFRESH_TOKEN_KEY = 'refreshToken_feupfs'; // localStorage key for refresh token

let inMemoryAccessToken: string | null = null;

export const tokenService = {
  setTokens: (access: string, refresh: string): void => {
    inMemoryAccessToken = access;
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      console.log('TokenService: Tokens stored (access in memory, refresh in localStorage).');
    } catch (e) {
      console.error('TokenService: Failed to store refresh token in localStorage.', e);
    }
  },

  getAccessToken: (): string | null => {
    return inMemoryAccessToken;
  },

  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.error('TokenService: Failed to retrieve refresh token from localStorage.', e);
      return null;
    }
  },

  clearTokens: (): void => {
    inMemoryAccessToken = null;
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      console.log('TokenService: Tokens cleared.');
    } catch (e) {
      console.error('TokenService: Failed to clear refresh token from localStorage.', e);
    }
  },

  // Future: add logic for refreshing access token using the refresh token
  // refreshAccessToken: async (): Promise<string | null> => { ... }
};