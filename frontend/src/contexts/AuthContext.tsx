import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import type { User, ApiError } from "../types";
import * as authService from "../services/authService";
import { tokenService } from "../services/tokenService"; // Import tokenService

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // True during login process or initial auth check
  isAuthenticating: boolean; // True only during initial auth check or token refresh attempt
  error: ApiError | null;
  login: (email?: string, password?: string) => Promise<void>; // Changed username to email
  logout: () => Promise<void>;
  // checkAuthStatus: () => Promise<void>; // We'll call fetchUserDetails directly on mount
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For login/logout operations
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true); // For initial load/token check
  const [error, setError] = useState<ApiError | null>(null);

  console.log(
    "[AuthProvider] Instance evaluating. User:",
    user,
    "IsLoading:",
    isLoading,
    "IsAuthenticating:",
    isAuthenticating
  );

  useEffect(() => {
    console.log("[AuthContext] User state DID CHANGE to:", user);
  }, [user]);
  useEffect(() => {
    console.log("[AuthContext] isLoading state DID CHANGE to:", isLoading);
  }, [isLoading]);
  useEffect(() => {
    console.log(
      "[AuthContext] isAuthenticating state DID CHANGE to:",
      isAuthenticating
    );
  }, [isAuthenticating]);

  const fetchUserDetails = useCallback(async () => {
    console.log("[AuthProvider] fetchUserDetails called.");
    if (!tokenService.getAccessToken()) {
      console.log(
        "[AuthProvider] fetchUserDetails: No access token, skipping user fetch."
      );
      setUser(null);
      setIsAuthenticating(false);
      return;
    }
    setIsAuthenticating(true); // Indicate we are trying to authenticate with a token
    setError(null);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      console.log(
        "[AuthProvider] fetchUserDetails: User details fetched successfully."
      );
    } catch (err) {
      console.error(
        "[AuthProvider] fetchUserDetails: Failed to fetch user details.",
        err
      );
      setUser(null); // Ensure user is null if fetching details fails (e.g., token expired)
      tokenService.clearTokens(); // Clear tokens if they are invalid
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // On initial mount, try to fetch user details if tokens exist
  useEffect(() => {
    console.log("[AuthProvider] Mount effect: Calling fetchUserDetails.");
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Login function now accepts email
  const login = useCallback(
    async (email?: string, password?: string) => {
      console.log("[AuthProvider] login called with email:", email);
      setIsLoading(true); // For the login operation itself
      setError(null);
      try {
        await authService.login(email, password); // This now stores tokens via tokenService
        // After tokens are stored, fetch user details
        await fetchUserDetails(); // This will set the user and isAuthenticating to false
        console.log(
          "[AuthProvider] login process: Success (tokens stored, user details fetched)."
        );
      } catch (err) {
        console.error("[AuthProvider] login process: Failed.", err);
        setError(err as ApiError);
        setUser(null);
        tokenService.clearTokens(); // Clear any potentially stored tokens on login failure
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUserDetails]
  ); // fetchUserDetails is stable due to its own useCallback

  const logout = useCallback(async () => {
    console.log("[AuthProvider] logout called.");
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout(); // This clears tokens via tokenService
      setUser(null);
      console.log("[AuthProvider] logout: Success.");
    } catch (err) {
      console.error("[AuthProvider] logout: Failed.", err);
      setError(err as ApiError);
      // Still clear user and tokens from frontend even if backend call fails
      setUser(null);
      tokenService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => {
    console.log(
      "[AuthContext] useMemo for contextValue re-evaluating. User:",
      user,
      "IsLoading:",
      isLoading,
      "IsAuthenticating:",
      isAuthenticating
    );
    return {
      user,
      isAuthenticated: !!user,
      isLoading, // For general operations like login/logout button state
      isAuthenticating, // Specifically for initial load/token validation state
      error,
      login,
      logout,
    };
  }, [user, isLoading, isAuthenticating, error, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
