import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom"; // Use hooks for path handling later
import type { FileNode, ApiError } from "../types";
import { listFiles } from "../services/fileService"; // Import the service function (currently simulated)
import { Folder, File as FileIcon, AlertCircle, Loader2 } from "lucide-react"; // Icons

/**
 * Page component for browsing files and folders.
 * Fetches and displays the contents of the current directory path using fileService.
 */
const FilesPage: React.FC = () => {
  // TODO: Use useParams or location.pathname to get the actual path from the URL later
  // For now, we simulate browsing the root directory.
  const currentPath = "/";

  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Effect to fetch files when the component mounts or the currentPath changes.
  useEffect(() => {
    const fetchFiles = async () => {
      console.log(`FilesPage: Fetching files for path: ${currentPath}`);
      setIsLoading(true);
      setError(null);
      setFiles([]); // Clear previous files before fetching new ones

      try {
        // --- Integration Point ---
        // This call uses the listFiles function from fileService.
        // Whether it's the simulation or the real API call depends on
        // the implementation inside fileService.ts.
        // The component itself doesn't need to change much here.
        const fetchedFiles = await listFiles(currentPath);
        setFiles(fetchedFiles);
        console.log("FilesPage: Files fetched successfully");
      } catch (err) {
        // Handles errors from both simulation and the real API call (if it throws ApiError)
        console.error("FilesPage: Error fetching files:", err);
        setError(err as ApiError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [currentPath]); // Dependency array ensures this runs when currentPath changes

  // --- Render Logic ---

  // Display Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading files...</span>
      </div>
    );
  }

  // Display Error State
  // Assumes the error object has a 'message' property, matching our ApiError type.
  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center"
        role="alert"
      >
        <AlertCircle className="h-5 w-5 mr-2" />
        <strong className="font-bold mr-1">Error:</strong>
        <span className="block sm:inline">{error.message}</span>
        {/* Optionally display more details if available: {error.detail && ...} */}
      </div>
    );
  }

  // Format file size for display
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    if (sizeInBytes < 1024 * 1024 * 1024)
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Display File List (or empty state)
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header Section */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
          Current Folder:{" "}
          <span className="font-mono text-indigo-700">{currentPath}</span>
        </h1>
        {/* TODO: Add Breadcrumbs component here later */}
      </div>

      {/* TODO: Add Action buttons (Upload, Create Folder) section here later */}
      <div className="mb-4">{/* Placeholder for action buttons */}</div>

      {/* File Listing Area */}
      {files.length === 0 ? (
        <div className="text-center py-10">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-500">
            This folder is empty.
          </p>
          {/* Optional: Add an Upload button here? */}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {" "}
          {/* Use divide for separators */}
          {files.map((file) => (
            // Renders each file/folder item. Assumes 'file' object matches FileNode type.
            <li
              key={file.id} // Expect unique ID from backend
              className="flex items-center justify-between px-2 py-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors duration-150"
              // TODO: Add onClick handler for navigation/opening files later
              // onClick={() => handleItemClick(file)}
            >
              <div className="flex items-center min-w-0 flex-1 mr-4">
                {" "}
                {/* Ensure flex-1 takes space */}
                {/* Display icon based on is_directory (expected boolean from backend) */}
                {file.is_directory ? (
                  <Folder className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                ) : (
                  <FileIcon className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0" />
                )}
                {/* Display name (expected string from backend) */}
                <span className="text-gray-800 truncate font-medium text-sm">
                  {file.name}
                </span>
              </div>

              <div className="flex items-center space-x-4 flex-shrink-0">
                {/* Display size if it's a file (expected number | undefined from backend) */}
                {!file.is_directory && file.size !== undefined && (
                  <span className="text-xs text-gray-500 hidden md:block">
                    {" "}
                    {/* Hide size on small screens */}
                    {formatFileSize(file.size)}
                  </span>
                )}
                {/* Display last modified date (expected ISO string from backend) */}
                <span className="text-xs text-gray-500 hidden sm:block">
                  {" "}
                  {/* Hide date on very small screens */}
                  {new Date(file.updated_at).toLocaleDateString()}
                </span>
                {/* TODO: Add actions menu (Rename, Delete, Share...) later */}
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  {/* Placeholder for actions icon (e.g., MoreVertical) */}
                  <span className="text-xs">...</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilesPage;
