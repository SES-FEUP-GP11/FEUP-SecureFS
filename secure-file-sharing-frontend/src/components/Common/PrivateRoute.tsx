// src/components/Common/PrivateRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ---------- DEBUG LOGS ----------
  console.log("[PrivateRoute] Status Check:", {
    isLoading,
    isAuthenticated,
    path: location.pathname,
  });
  // ---------------------------------

  /* 1. While we’re still checking the token, show a splash */
  if (isLoading) {
    console.log("[PrivateRoute] Rendering Loading Indicator");
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Checking session…</p>
      </div>
    );
  }

  /* 2. If the user isn’t logged in, bounce them to /login */
  if (!isAuthenticated) {
    console.log(
      "[PrivateRoute] Redirecting to Login from path:",
      location.pathname
    );
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  /* 3. User is authenticated → render the branch below this route */
  console.log(
    "[PrivateRoute] Authenticated, rendering outlet for path:",
    location.pathname
  );
  return <Outlet />;
};

export default PrivateRoute;
