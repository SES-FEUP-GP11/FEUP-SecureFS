import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import PrivateRoute from "./components/Common/PrivateRoute";
import FilesPage from "./pages/FilesPage";
import PublicFilesPage from "./pages/PublicFilesPage";
import ShellPage from "./pages/ShellPage";
import SharedWithMePage from "./pages/SharedWithMePage"; // Import the new page

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
            <Route path="files/*" element={<FilesPage />} />
            <Route path="shell" element={<ShellPage />} />
            <Route path="shared" element={<SharedWithMePage />} />{" "}
            {/* ADDED SharedWithMePage Route */}
            {/* Default route after login redirects to the base files path */}
            <Route index element={<Navigate to="/files" replace />} />
          </Route>
        </Route>

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
