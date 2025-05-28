import React, { useEffect, useState } from "react";
import { listSharedWithMe } from "../services/fileService"; // Assuming this calls GET /api/sharing/shared-with-me/
import type { FileNode, ApiError } from "../types";
import {
  File as FileIcon,
  User as UserIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

interface GroupedSharedFiles {
  [ownerUsername: string]: FileNode[];
}

const SharedWithMePage: React.FC = () => {
  console.log("[SharedWithMePage] Rendering page.");
  const [groupedFiles, setGroupedFiles] = useState<GroupedSharedFiles>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchSharedFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const files = await listSharedWithMe();
        // Group files by owner_username
        const grouped = files.reduce((acc, file) => {
          const owner = file.owner_username || "Unknown Sharer"; // Fallback if owner_username is not present
          if (!acc[owner]) {
            acc[owner] = [];
          }
          acc[owner].push(file);
          return acc;
        }, {} as GroupedSharedFiles);
        setGroupedFiles(grouped);
      } catch (err) {
        console.error("[SharedWithMePage] Error fetching shared files:", err);
        setError(err as ApiError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedFiles();
  }, []);

  const formatFileSize = (sizeInBytes?: number | null): string => {
    if (sizeInBytes == null) return "";
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading shared files...</span>
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
        <span className="block sm:inline">
          {error.message || "Could not load shared files."}
        </span>
      </div>
    );
  }

  const ownerKeys = Object.keys(groupedFiles);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Shared With Me
      </h1>

      {ownerKeys.length === 0 ? (
        <p className="text-gray-500 italic">
          No files have been shared with you yet.
        </p>
      ) : (
        <div className="space-y-8">
          {ownerKeys.map((ownerUsername) => (
            <section key={ownerUsername}>
              <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-700">
                  Shared by:{" "}
                  <span className="font-semibold">{ownerUsername}</span>
                </h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {groupedFiles[ownerUsername].map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between px-2 py-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors duration-150"
                    // onClick={() => console.log("Clicked shared file:", file.logical_path)} // Placeholder for future action
                    title={`Path: ${file.logical_path}\nShared by: ${
                      file.owner_username || "Unknown"
                    }`}
                  >
                    <div className="flex items-center min-w-0 flex-1 mr-4">
                      {file.is_directory ? (
                        <Folder className="h-5 w-5 mr-3 text-blue-500 shrink-0" />
                      ) : (
                        <FileIcon className="h-5 w-5 mr-3 text-gray-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="text-gray-800 truncate font-medium text-sm block">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          {file.mime_type ||
                            (file.is_directory ? "Folder" : "File")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 shrink-0">
                      {!file.is_directory && file.size_bytes != null && (
                        <span className="text-xs text-gray-500 hidden md:block">
                          {formatFileSize(file.size_bytes)}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 hidden sm:block">
                        Modified:{" "}
                        {new Date(file.updated_at).toLocaleDateString()}
                      </span>
                      {/* Add actions like 'View' or 'Download' later if needed */}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedWithMePage;
