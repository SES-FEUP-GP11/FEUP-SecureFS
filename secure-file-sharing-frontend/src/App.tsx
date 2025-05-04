import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import PrivateRoute from "./components/Common/PrivateRoute";
import FilesPage from "./pages/FilesPage";

export default function App() {
  console.log("[App.tsx] Rendering App component");

  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- PUBLIC ---------- */}
        <Route path="/login" element={<LoginPage />} />

        {/* ---------- PROTECTED ---------- */}
        <Route element={<PrivateRoute />}>
          {/* layout route — MUST contain an <Outlet/> */}
          <Route element={<MainLayout />}>
            <Route path="files">
              {/* index renders on “/files” */}
              <Route index element={<FilesPage />} />

              {/* star (“splat”) captures everything under /files/... */}
              <Route path="*" element={<FilesPage />} />
            </Route>

            {/* default after login → /files */}
            <Route index element={<Navigate to="files" replace />} />
          </Route>
        </Route>

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
