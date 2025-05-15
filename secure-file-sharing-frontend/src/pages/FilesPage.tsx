import React, {useCallback, useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import type {ApiError, FileNode} from "../types";
import {
    createFolder as createFolderService,
    listFiles,
    renameNode as renameNodeService,
} from "../services/fileService";
import {
    AlertCircle,
    Edit3,
    File as FileIcon,
    Folder,
    Globe,
    Loader2,
    Lock,
    MoreVertical,
    PlusCircle,
} from "lucide-react";
import Breadcrumbs from "../components/files/Breadcrumbs";
import CreateFolderModal from "../components/files/CreateFolderModal";
import RenameModal from "../components/files/RenameModal";

/**
 * Page component for browsing files and folders.
 * Includes functionality to create and rename folders/files.
 */
const FilesPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  // const { isAuthenticated } = useAuth(); // Not directly used in rendering, but good for debug

  const splatPath = params["*"] || "";
  const currentDirectoryPath = `/${splatPath}`;

  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Modal States
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileNode | null>(null);
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(
    null
  ); // For item ID

  const fetchFiles = useCallback(async () => {
    let servicePath = currentDirectoryPath;
    if (servicePath !== "/" && servicePath.endsWith("/")) {
      servicePath = servicePath.slice(0, -1);
    }
    console.log(`FilesPage: Fetching files for servicePath: ${servicePath}`);
    setIsLoading(true);
    setError(null);
    try {
      const fetchedFiles = await listFiles(servicePath);
      setFiles(fetchedFiles);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [currentDirectoryPath]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleItemClick = (item: FileNode, event?: React.MouseEvent) => {
    // Prevent navigation if clicking on the context menu button itself
    if (
      event &&
      (event.target as HTMLElement).closest(".context-menu-button")
    ) {
      return;
    }
    if (item.is_directory) {
      const navigateTo = `/files${item.path}`;
      navigate(navigateTo);
    } else {
      console.log(`FilesPage: Clicked on file: ${item.path}`);
      // Future: open file preview
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    let servicePath = currentDirectoryPath;
    if (servicePath !== "/" && servicePath.endsWith("/")) {
      servicePath = servicePath.slice(0, -1);
    }
    try {
      await createFolderService(servicePath, folderName);
      await fetchFiles();
    } catch (err) {
      console.error(`FilesPage: Failed to create folder "${folderName}"`, err);
      throw err;
    }
  };

  const handleRenameItem = async (item: FileNode, newName: string) => {
    console.log(
      `FilesPage: Attempting to rename "${item.path}" to "${newName}"`
    );
    try {
      await renameNodeService(item.path, newName);
      console.log(
        `FilesPage: Item renamed successfully (simulated). Refreshing list.`
      );
      setItemToRename(null); // Clear selected item
      setIsRenameModalOpen(false); // Close modal
      await fetchFiles(); // Refresh the file list
    } catch (err) {
      console.error(`FilesPage: Failed to rename item`, err);
      throw err; // Let modal display the error
    }
  };

  const openRenameModal = (item: FileNode) => {
    setItemToRename(item);
    setIsRenameModalOpen(true);
    setActiveContextMenu(null); // Close context menu
  };

  // Toggle context menu for an item
  const toggleContextMenu = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent li onClick from firing
    setActiveContextMenu((prev) => (prev === itemId ? null : itemId));
  };

  // Close context menu if clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveContextMenu(null);
    };
    if (activeContextMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeContextMenu]);

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    if (sizeInBytes < 1024 * 1024 * 1024)
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

    // Check if we're currently in the public folder
    const isInPublicFolder = currentDirectoryPath.startsWith('/public');

    // --- Render Logic ---
    // FIXED: Replaced comments with actual JSX for loading and error states
    if (isLoading && files.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600"/>
                <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
        );
    }

    if (error && files.length === 0) {
        return (
            <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center"
                role="alert"
            >
                <AlertCircle className="h-5 w-5 mr-2"/>
                <strong className="font-bold mr-1">Error:</strong>
                <span className="block sm:inline">{error.message}</span>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            {/* Header and Breadcrumbs */}
            <div className="mb-4 pb-4 border-b border-gray-200">
                <Breadcrumbs currentPath={currentDirectoryPath}/>
                <div className="flex justify-between items-center mt-2">
                    <div>
                        <div className="flex items-center">
                            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                                Contents of:{" "}
                                <span className="font-mono text-indigo-700">
                  {currentDirectoryPath === "/" ? "Root" : currentDirectoryPath}
                </span>
                            </h1>

                        </div>
                        {isInPublicFolder && (
                            <p className="text-sm text-green-700 mt-1">
                                Files in this folder are publicly accessible to everyone
                            </p>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        {/* Link to browse public files */}
                        <Link
                            to="/public"
                            className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Globe size={18} className="mr-2"/>
                            Browse Public Files
                        </Link>
                        <button
                            onClick={() => setIsCreateFolderModalOpen(true)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PlusCircle size={18} className="mr-2"/>
                            Create Folder
                        </button>
                    </div>
                </div>
            </div>

            {/* Inline loading/error for subsequent loads */}
            {isLoading && files.length > 0 && (
                <div className="text-center py-4 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin inline mr-2"/> Loading
                    more...
                </div>
            )}
            {error && files.length > 0 && (
                <div className="my-2 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
                    Error refreshing content: {error.message}
                </div>
            )}

      {/* File Listing Area */}
      {/* FIXED: Replaced comment with actual JSX for empty folder state */}
      {!isLoading && files.length === 0 && !error && (
        <div className="text-center py-10">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-500">
            This folder is empty.
          </p>
        </div>
      )}

            {files.length > 0 && (
                <ul className="divide-y divide-gray-200">
                    {files.map((file) => (
                        <li
                            key={file.id}
                            className="flex items-center justify-between px-2 py-3 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-150 group relative"
                            onClick={(e) => handleItemClick(file, e)}
                        >
                            <div className="flex items-center min-w-0 flex-1 mr-4">
                                <div className="flex items-center">
                                    {file.is_directory ? (
                                        <Folder className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0"/>
                                    ) : (
                                        <FileIcon className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0"/>
                                    )}
                                    {/* Public/Private indicator */}
                                    {file.is_public || file.name === 'public' ? (
                                        <Globe className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" title="Public"/>
                                    ) : (
                                        <Lock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" title="Private"/>
                                    )}
                                </div>
                                <div className="min-w-0">
                  <span className="text-gray-800 truncate font-medium text-sm block">
                    {file.name}
                  </span>
                                    {file.name === 'public' && (
                                        <span className="text-xs text-green-600">
                      Files here are visible to everyone
                    </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0">
                                {!file.is_directory && file.size !== undefined && (
                                    <span className="text-xs text-gray-500 hidden md:block">
                    {formatFileSize(file.size)}
                  </span>
                                )}
                                <span className="text-xs text-gray-500 hidden sm:block">
                  {new Date(file.updated_at).toLocaleDateString()}
                </span>
                                {/* Context Menu Button */}
                                <button
                                    onClick={(e) => toggleContextMenu(file.id, e)}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 context-menu-button"
                                    aria-label="More options"
                                >
                                    <MoreVertical size={18}/>
                                </button>
                                {/* Context Menu Dropdown */}
                                {activeContextMenu === file.id && (
                                    <div
                                        className="absolute right-0 top-8 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => openRenameModal(file)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                                        >
                                            <Edit3 size={16} className="mr-2"/> Rename
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Modals */}
            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onCreate={handleCreateFolder}
                parentPath={currentDirectoryPath}
            />
            <RenameModal
                isOpen={isRenameModalOpen}
                onClose={() => {
                    setIsRenameModalOpen(false);
                    setItemToRename(null);
                }}
                onRename={handleRenameItem}
                itemToRename={itemToRename}
            />
        </div>
    );
};

export default FilesPage;