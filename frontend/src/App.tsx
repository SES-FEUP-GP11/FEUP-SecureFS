import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import PrivateRoute from "./components/Common/PrivateRoute";
import FilesPage from "./pages/FilesPage";
import PublicFilesPage from "./pages/PublicFilesPage.tsx";

export default function App() {
  console.log("[App.tsx] Rendering App component");

  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- PUBLIC ---------- */}
        <Route path="/login" element={<LoginPage />} />

        <Route path="/public/*" element={<PublicFilesPage />} />

        {/* ---------- PROTECTED ---------- */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            {/* Use a splat route for files to capture nested paths */}
            <Route path="files/*" element={<FilesPage />} />

            {/* Default route after login redirects to the base files path */}
            <Route index element={<Navigate to="/files" replace />} />
          </Route>
        </Route>

        {/* ---------- FALLBACK ---------- */}
        {/* Consider a dedicated 404 component later */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
