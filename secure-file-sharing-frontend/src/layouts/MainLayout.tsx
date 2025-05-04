import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Main application layout wrapper.
 * Will include Navbar, Sidebar, and render the main page content via Outlet.
 */
const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Placeholder */}
      <div className="w-64 bg-white shadow-md hidden md:block"> {/* Hidden on small screens */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">FEUP SecureFS</h2> {/* Placeholder Name */}
        </div>
        <nav className="mt-4">
          {/* Sidebar navigation links will go here */}
          <p className="p-4 text-gray-500">Sidebar Nav</p>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar Placeholder */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <p className="text-gray-500">Navbar Placeholder</p>
            {/* User menu, search etc. will go here */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet /> {/* Child routes (like FilesPage) will be rendered here */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;