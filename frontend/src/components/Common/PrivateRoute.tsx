import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading, isAuthenticating } = useAuth();
  const location = useLocation();

  // console.log("[PrivateRoute] Status Check:", { isLoading, isAuthenticating, isAuthenticated, path: location.pathname });

  if (isLoading || isAuthenticating) {
    // console.log("[PrivateRoute] Rendering Loading Indicator (isLoading or isAuthenticating)");
    return (
      <div className="fixed inset-0 bg-gray-100 flex flex-col justify-center items-center text-gray-700 z-[100]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-3 text-lg">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // console.log("[PrivateRoute] Not authenticated, redirecting to Login from path:", location.pathname);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // console.log("[PrivateRoute] Authenticated, rendering outlet for path:", location.pathname);
  return <Outlet />;
};
export default PrivateRoute;
