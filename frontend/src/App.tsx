import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import PrivateRoute from "./components/Common/PrivateRoute";
import FilesPage from "./pages/FilesPage";
import PublicFilesPage from "./pages/PublicFilesPage";
import ShellPage from "./pages/ShellPage"; 
import MyPublicPage from "./pages/MyPublicPage";
import SharedWithMePage from "./pages/SharedWithMePage"; 
import PublicPagePreview from "./pages/PublicPagePreview"; 

export default function App() {
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
            <Route path="shared" element={<SharedWithMePage />} /> 
            <Route path="my-public-page" element={<MyPublicPage />} /> 
            <Route index element={<Navigate to="/files" replace />} />
          </Route>
          
          {/* Fullscreen Preview Route - :pageId removed from path */}
          <Route path="/preview-public-page" element={<PublicPagePreview />} />
        </Route>

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}