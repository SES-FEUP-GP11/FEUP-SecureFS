import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { FileNode, ApiError } from "../types";
import { listFiles } from "../services/fileService";
import { Folder, File as FileIcon, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * Page component for browsing files and folders.
 * Fetches and displays the contents of the current directory path from the URL.
 * Handles navigation into subfolders.
 */
const FilesPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { isAuthenticated } = useAuth();

  // The '*' in the route path captures everything after '/files'
  // params['*'] might be 'Documents' or 'Documents/Archive' or undefined for root
  const splatPath = params["*"] || "";
  // currentDirectoryPath should represent the logical path from the user's root, e.g., '/', '/Documents', '/Documents/Archive'
  const currentDirectoryPath = `/${splatPath}`;

  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      // Normalize path for the listFiles service: remove trailing slash unless it's the root '/'
      let servicePath = currentDirectoryPath;
      if (servicePath !== "/" && servicePath.endsWith("/")) {
        servicePath = servicePath.slice(0, -1);
      }
      console.log(`FilesPage: Fetching files for servicePath: ${servicePath}`);
      setIsLoading(true);
      setError(null);
      setFiles([]);

      try {
        const fetchedFiles = await listFiles(servicePath);
        setFiles(fetchedFiles);
        console.log("FilesPage: Files fetched successfully");
      } catch (err) {
        console.error("FilesPage: Error fetching files:", err);
        setError(err as ApiError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [currentDirectoryPath]); // Re-run effect if the captured path changes

  const handleItemClick = (item: FileNode) => {
    if (item.is_directory) {
      // item.path from simulation is the full logical path (e.g., "/Documents", "/Documents/Archive")
      // We want the browser URL to be /files/Documents or /files/Documents/Archive
      // The leading '/' in item.path is correct here.
      const navigateTo = `/files${item.path}`; // Corrected: use item.path directly

      console.log(
        `FilesPage: Attempting navigation to ${navigateTo}. Current auth state: ${isAuthenticated}`
      );
      navigate(navigateTo);
    } else {
      console.log(`FilesPage: Clicked on file: ${item.path}`);
      // TODO: Implement file preview or download logic later
    }
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    if (sizeInBytes < 1024 * 1024 * 1024)
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center"
        role="alert"
      >
        <AlertCircle className="h-5 w-5 mr-2" />
        <strong className="font-bold mr-1">Error:</strong>
        <span className="block sm:inline">{error.message}</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
          Current Folder:{" "}
          <span className="font-mono text-indigo-700">
            {currentDirectoryPath}
          </span>
        </h1>
        {/* TODO: Add Breadcrumbs component here later */}
      </div>
      <div className="mb-4"></div> {/* Placeholder for action buttons */}
      {files.length === 0 ? (
        <div className="text-center py-10">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-500">
            This folder is empty.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between px-2 py-3 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-150"
              onClick={() => handleItemClick(file)}
            >
              <div className="flex items-center min-w-0 flex-1 mr-4">
                {file.is_directory ? (
                  <Folder className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                ) : (
                  <FileIcon className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0" />
                )}
                <span className="text-gray-800 truncate font-medium text-sm">
                  {file.name}
                </span>
              </div>
              <div className="flex items-center space-x-4 flex-shrink-0">
                {!file.is_directory && file.size !== undefined && (
                  <span className="text-xs text-gray-500 hidden md:block">
                    {formatFileSize(file.size)}
                  </span>
                )}
                <span className="text-xs text-gray-500 hidden sm:block">
                  {new Date(file.updated_at).toLocaleDateString()}
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600 opacity-50 cursor-not-allowed">
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
