import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Custom hook to easily access the Authentication context.
 * Provides type checking and throws an error if used outside of an AuthProvider.
 * @returns The authentication context data (user, isAuthenticated, login, logout, etc.).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
