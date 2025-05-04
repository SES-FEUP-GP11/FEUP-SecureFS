// src/layouts/MainLayout.tsx

import React from 'react';
import { Outlet, Link } from 'react-router-dom'; // Import Link for navigation
import { useAuth } from '../hooks/useAuth'; // Import useAuth hook
import { LogOut, Files, Share2, Settings, Home } from 'lucide-react'; // Import icons

/**
 * Main application layout wrapper.
 * Includes Navbar, Sidebar, and renders the main page content via Outlet.
 * Displays user information and provides a logout button.
 */
const MainLayout: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth(); // Get user and logout function

  // Handle logout click
  const handleLogout = async () => {
    try {
      await logout();
      // No need to navigate here, PrivateRoute will handle redirection
      console.log('MainLayout: Logout initiated successfully.');
    } catch (error) {
      console.error('MainLayout: Error during logout:', error);
      // Maybe show an error notification to the user
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans"> {/* Changed font */}
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg hidden md:flex md:flex-col"> {/* Ensure flex column */}
        {/* Logo/Brand */}
        <div className="p-5 border-b h-16 flex items-center">
          {/* Placeholder for a logo icon */}
          {/* <Home className="h-6 w-6 mr-2 text-indigo-600" />  */}
          <h2 className="text-xl font-bold text-gray-800">FEUP SecureFS</h2>
        </div>
        {/* Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1"> {/* flex-1 to take remaining space */}
          <Link
            to="/files"
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
          >
            <Files className="mr-3 h-5 w-5 text-gray-500 group-hover:text-indigo-600" />
            My Files
          </Link>
          <Link
            to="/shared" // Assuming a future route for shared files
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
          >
            <Share2 className="mr-3 h-5 w-5 text-gray-500 group-hover:text-indigo-600" />
            Shared with me
          </Link>
          <Link
            to="/settings" // Assuming a future route for settings
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-500 group-hover:text-indigo-600" />
            Settings
          </Link>
        </nav>
        {/* Optional Footer in Sidebar */}
        {/* <div className="p-4 border-t"> ... </div> */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow-sm border-b z-10"> {/* Added z-index */}
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Left side - Placeholder for search or breadcrumbs */}
            <div>
              {/* <button className="md:hidden p-2 text-gray-500 hover:text-gray-700"> Menu </button> */}
              <span className="text-gray-600"></span> {/* Placeholder */}
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              {isAuthLoading ? (
                <span className="text-sm text-gray-500">Loading...</span>
              ) : user ? (
                <>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block"> {/* Hide on small screens */}
                    Welcome, {user.username}!
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={isAuthLoading} // Disable while auth state is changing
                    className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <LogOut className="h-5 w-5 mr-1 text-gray-500" />
                    Logout
                  </button>
                </>
              ) : (
                // Should not happen if PrivateRoute works, but good fallback
                <span className="text-sm text-red-500">Not logged in</span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet /> {/* Child routes render here */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
