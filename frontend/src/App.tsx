import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import PrivateRoute from "./components/Common/PrivateRoute";
import FilesPage from "./pages/FilesPage";
import PublicFilesPage from "./pages/PublicFilesPage";
import ShellPage from "./pages/ShellPage"; // Import the new ShellPage

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
            <Route path="shell" element={<ShellPage />} />{" "}
            {/* ADDED ShellPage Route */}
            <Route index element={<Navigate to="/files" replace />} />
          </Route>
        </Route>

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
