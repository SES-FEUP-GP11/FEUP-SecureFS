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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiError | null;
  login: (username?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initial auth check is loading
  const [error, setError] = useState<ApiError | null>(null);

  // --- ADDED LOG: Track AuthProvider re-renders and its current state ---
  console.log(
    "[AuthProvider] Instance evaluating. User:",
    user,
    "IsLoading:",
    isLoading,
    "Error:",
    error
  );

  // --- ADDED LOG: Track user state changes ---
  useEffect(() => {
    console.log("[AuthContext] User state DID CHANGE to:", user);
  }, [user]);

  // --- ADDED LOG: Track isLoading state changes ---
  useEffect(() => {
    console.log("[AuthContext] isLoading state DID CHANGE to:", isLoading);
  }, [isLoading]);

  const checkAuthStatus = useCallback(async () => {
    console.log("[AuthProvider] checkAuthStatus called.");
    setIsLoading(true); // Set loading true for the duration of the check
    setError(null);
    try {
      // SIMULATION: On initial load, user is not logged in.
      // This function should ideally only run once on app mount.
      // If 'user' state is already populated, this simulation shouldn't clear it.
      // However, for a strict initial check, we start with no user.
      // This was identified as problematic if checkAuthStatus runs again later.
      // For now, let's keep it as is to see if it's being called unexpectedly.
      if (user === null) {
        // Only set user to null if it's already null (initial state)
        console.log(
          "[AuthProvider] checkAuthStatus: No user found, ensuring user is null."
        );
      } else {
        console.log(
          "[AuthProvider] checkAuthStatus: User already exists, not changing user state."
        );
      }
      // setUser(null); // Previous problematic line
      console.log(
        "[AuthProvider] checkAuthStatus: Current simulated outcome - user remains as is or null if initial."
      );
    } catch (err) {
      console.error(
        "[AuthProvider] checkAuthStatus: Simulated error (should not happen in this sim)",
        err
      );
      setUser(null); // On error, ensure user is null
    } finally {
      setIsLoading(false); // Done with initial check
      console.log(
        "[AuthProvider] checkAuthStatus: Finished, isLoading set to false."
      );
    }
  }, [user]); // Added user to dependency to re-evaluate if it changes, though checkAuthStatus is for initial

  useEffect(() => {
    console.log("[AuthProvider] Mount effect: Calling checkAuthStatus.");
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // IMPORTANT: Keep this dependency array empty to ensure it runs only once on mount

  const login = useCallback(async (username?: string, password?: string) => {
    console.log("[AuthProvider] login called.");
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await authService.login(username, password);
      setUser(loggedInUser); // This will trigger the user state change log
      console.log("[AuthProvider] login: Success.");
    } catch (err) {
      console.error("[AuthProvider] login: Failed.", err);
      setError(err as ApiError);
      setUser(null); // Ensure user is null on login failure
      throw err;
    } finally {
      setIsLoading(false); // This will trigger the isLoading state change log
      console.log("[AuthProvider] login: Finished, isLoading set to false.");
    }
  }, []);

  const logout = useCallback(async () => {
    console.log("[AuthProvider] logout called.");
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null); // This will trigger the user state change log
      console.log("[AuthProvider] logout: Success.");
    } catch (err) {
      console.error("[AuthProvider] logout: Failed.", err);
      setError(err as ApiError);
    } finally {
      setIsLoading(false); // This will trigger the isLoading state change log
      console.log("[AuthProvider] logout: Finished, isLoading set to false.");
    }
  }, []);

  const contextValue = useMemo(() => {
    console.log(
      "[AuthContext] useMemo for contextValue re-evaluating. User:",
      user,
      "IsLoading:",
      isLoading
    );
    return {
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      logout,
      checkAuthStatus, // Though it's mainly for initial, provide it
    };
  }, [user, isLoading, error, login, logout, checkAuthStatus]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
