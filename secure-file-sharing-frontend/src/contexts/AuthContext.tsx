import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { User, ApiError } from '../types';
import * as authService from '../services/authService'; // Use the simulated service

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // To track loading state during auth checks/login
  error: ApiError | null; // To store login/auth errors
  login: (username?: string, password?: string) => Promise<void>; // Made async void for easier handling in components
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>; // Function to check auth on app load
}

// Create the context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define props for the provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provides authentication state and actions to the application.
 * Manages user data, loading states, errors, and interacts with the authService.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially for auth check
  const [error, setError] = useState<ApiError | null>(null);

  // Function to check authentication status (e.g., on app load)
  // Uses the simulated getCurrentUser for now
  const checkAuthStatus = useCallback(async () => {
    console.log('AuthProvider: Checking auth status...');
    setIsLoading(true);
    setError(null);
    try {
      // In simulation, getCurrentUser likely fails by default.
      // We'll rely on login setting the user for now.
      // In a real app with tokens/sessions, this would attempt to fetch the user.
      // const currentUser = await authService.getCurrentUser();
      // setUser(currentUser);
      // console.log('AuthProvider: Auth status check successful (simulated - likely no user found yet)');
      // For simulation purposes, let's assume not logged in initially
       setUser(null);
       console.log('AuthProvider: Auth status check complete (simulated - user not logged in)');
    } catch (err) {
      console.error('AuthProvider: Auth status check failed (simulated)', err);
      setUser(null); // Ensure user is null on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to run checkAuthStatus on initial mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login function
  const login = useCallback(async (username?: string, password?: string) => {
    console.log('AuthProvider: Attempting login...');
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await authService.login(username, password);
      setUser(loggedInUser);
      console.log('AuthProvider: Login successful');
    } catch (err) {
      console.error('AuthProvider: Login failed', err);
      setError(err as ApiError); // Assume error is ApiError
      setUser(null); // Ensure user is null on login failure
      // Re-throw the error if components need to react to the specific failure
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    console.log('AuthProvider: Attempting logout...');
    setIsLoading(true); // Optional: show loading during logout
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      console.log('AuthProvider: Logout successful');
      // Optionally redirect or clear other state here
    } catch (err) {
      console.error('AuthProvider: Logout failed', err);
      setError(err as ApiError); // Store logout error if needed
      // Decide if user should remain partially logged in on logout failure? Usually no.
      // setUser(null); // Probably still clear user state
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user, // True if user object exists
    isLoading,
    error,
    login,
    logout,
    checkAuthStatus,
  }), [user, isLoading, error, login, logout, checkAuthStatus]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
