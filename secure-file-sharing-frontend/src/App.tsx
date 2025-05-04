// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import FilesPage from "./pages/FilesPage";
import MainLayout from "./layouts/MainLayout";
import PrivateRoute from "./components/Common/PrivateRoute"; // Import PrivateRoute

/**
 * Main application component responsible for routing.
 * Uses PrivateRoute to protect authenticated routes.
 */
function App() {
  // No longer need the temporary isAuthenticated variable here
  // The check is now handled by PrivateRoute using the AuthContext

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route - Publicly accessible */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/*" // Match all routes starting from root (except /login)
          element={
            // Wrap the entire protected section with PrivateRoute
            <PrivateRoute>
              <MainLayout>
                {/* Nested routes within the main layout */}
                <Routes>
                  <Route path="/files/*" element={<FilesPage />} />{" "}
                  {/* Example main page */}
                  {/* Add other protected routes here later (e.g., /shared, /settings) */}
                  {/* Default route for authenticated users */}
                  <Route index element={<Navigate to="/files" replace />} />
                  {/* Catch-all for protected routes not found */}
                  {/* <Route path="*" element={<NotFoundPage />} /> */}
                </Routes>
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Optional: Add a global 404 Not Found route if needed,
             but often handled within the protected/public sections */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
