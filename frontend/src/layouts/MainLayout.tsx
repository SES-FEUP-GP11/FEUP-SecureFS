import React, { ReactNode } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LogOut,
  Files,
  Share2,
  Settings,
  TerminalSquare,
  Globe as PublicPageIcon,
} from "lucide-react";

interface MainLayoutProps {
  children?: ReactNode;
}
const MainLayout: React.FC<MainLayoutProps> = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("MainLayout: Error during logout:", error);
    }
  };
  const isNavLinkActive = (path: string) => {
    if (
      path === "/files" &&
      (location.pathname === "/files" ||
        location.pathname.startsWith("/files/"))
    )
      return true;
    return location.pathname.startsWith(path);
  };
  const displayName = user?.first_name || user?.email || "User";
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-white shadow-lg hidden md:flex md:flex-col">
        <div className="p-5 border-b h-16 flex items-center">
          <h2 className="text-xl font-bold text-gray-800">FEUP SecureFS</h2>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          <Link
            to="/files"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:text-indigo-700 hover:bg-indigo-50 ${
              isNavLinkActive("/files")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700"
            }`}
          >
            <Files
              className={`mr-3 h-5 w-5 ${
                isNavLinkActive("/files")
                  ? "text-indigo-600"
                  : "text-gray-500 group-hover:text-indigo-600"
              }`}
            />
            My Files
          </Link>
          <Link
            to="/shell"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:text-indigo-700 hover:bg-indigo-50 ${
              isNavLinkActive("/shell")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700"
            }`}
          >
            <TerminalSquare
              className={`mr-3 h-5 w-5 ${
                isNavLinkActive("/shell")
                  ? "text-indigo-600"
                  : "text-gray-500 group-hover:text-indigo-600"
              }`}
            />
            Shell
          </Link>
          <Link
            to="/shared"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:text-indigo-700 hover:bg-indigo-50 ${
              isNavLinkActive("/shared")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700"
            }`}
          >
            <Share2
              className={`mr-3 h-5 w-5 ${
                isNavLinkActive("/shared")
                  ? "text-indigo-600"
                  : "text-gray-500 group-hover:text-indigo-600"
              }`}
            />
            Shared with me
          </Link>
          <Link
            to="/my-public-page"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:text-indigo-700 hover:bg-indigo-50 ${
              isNavLinkActive("/my-public-page")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700"
            }`}
          >
            <PublicPageIcon
              className={`mr-3 h-5 w-5 ${
                isNavLinkActive("/my-public-page")
                  ? "text-indigo-600"
                  : "text-gray-500 group-hover:text-indigo-600"
              }`}
            />
            My Public Page
          </Link>
          <Link
            to="/settings"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:text-indigo-700 hover:bg-indigo-50 ${
              isNavLinkActive("/settings")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700"
            }`}
          >
            <Settings
              className={`mr-3 h-5 w-5 ${
                isNavLinkActive("/settings")
                  ? "text-indigo-600"
                  : "text-gray-500 group-hover:text-indigo-600"
              }`}
            />
            Settings
          </Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b z-10">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div>
              <span className="text-gray-600"></span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthLoading ? (
                <span className="text-sm text-gray-500">Loading...</span>
              ) : user ? (
                <>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    Welcome, {displayName}!
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={isAuthLoading}
                    className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <LogOut className="h-5 w-5 mr-1 text-gray-500" />
                    Logout
                  </button>
                </>
              ) : (
                <span className="text-sm text-red-500">Not logged in</span>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default MainLayout;
