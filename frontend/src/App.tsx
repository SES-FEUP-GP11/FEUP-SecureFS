import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import PrivateRoute from "./components/Common/PrivateRoute";
import FilesPage from "./pages/FilesPage";
import PublicFilesPage from "./pages/PublicFilesPage";
import ShellPage from "./pages/ShellPage";
import MyPublicPage from "./pages/MyPublicPage"; // Ensure this is imported
import SharedWithMePage from "./pages/SharedWithMePage"; // Assuming this exists

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/public/*" element={<PublicFilesPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="files/*" element={<FilesPage />} />
            <Route path="shell" element={<ShellPage />} />
            <Route path="shared" element={<SharedWithMePage />} />
            <Route path="my-public-page" element={<MyPublicPage />} />
            <Route index element={<Navigate to="/files" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
