// src/components/Common/PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Import the custom hook

interface PrivateRouteProps {
  children: React.ReactNode; // The component/elements to render if authenticated
}

/**
 * A component that wraps routes requiring authentication.
 * It checks the authentication status from AuthContext.
 * If authenticated, it renders the child components.
 * If not authenticated, it redirects the user to the login page,
 * preserving the intended destination path.
 * It also handles the initial loading state of the auth check.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth(); // Get auth state and loading status
  const location = useLocation(); // Get current location to redirect back after login

  // While checking auth status, show a loading indicator (optional)
  if (isLoading) {
    // You can replace this with a more sophisticated loading spinner/component
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading authentication...</p>
      </div>
    );
  }

  // If authenticated, render the requested child component/route
  if (isAuthenticated) {
    return <>{children}</>; // Render the children passed to PrivateRoute
  }

  // If not authenticated and not loading, redirect to login page
  // Pass the current location state so we can redirect back after login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;