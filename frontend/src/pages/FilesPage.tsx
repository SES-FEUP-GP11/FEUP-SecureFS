import React, {useCallback, useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import type {ApiError, FileNode} from "../types";
import {
    createFolder as createFolderService,
    deleteNode as deleteNodeService,
    listFiles,
    renameNode as renameNodeService,
    uploadFile as uploadFileService,
} from "../services/fileService";
import {
    AlertCircle,
    Edit3,
    Eye,
    File as FileIcon,
    Folder,
    Globe,
    Loader2,
    Lock,
    MoreVertical,
    PlusCircle,
    Trash2,
    UploadCloud as UploadIcon,
} from "lucide-react";
import CreateFolderModal from "../components/files/CreateFolderModal.tsx";
import RenameModal from "../components/files/RenameModal.tsx";
import ConfirmDeleteModal from "../components/files/ConfirmDeleteModal.tsx";
import Breadcrumbs from "../components/files/Breadcrumbs.tsx";
import UploadFileModal from "../components/files/UploadFileModal.tsx";
import AccessControlModal from "../components/files/AccessControlModal.tsx"; // Import the new modal

type AccessSettings = {
    isPublic: boolean;
    publicRole: 'viewer' | 'editor' | 'none';
    shareLink: string;
    permissions: Array<{
        id: string;
        email: string;
        name: string;
        role: 'viewer' | 'editor' | 'owner';
    }>;
}

/**
 * Page component for browsing files and folders.
 * Includes functionality for CRUD operations and file uploads.
 */
const FilesPage: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams();

    const splatPath = params["*"] || "";
    const currentDirectoryPath = `/${splatPath}`;

    const [files, setFiles] = useState<FileNode[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<ApiError | null>(null);

    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [itemToRename, setItemToRename] = useState<FileNode | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<FileNode | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [itemForAccess, setItemForAccess] = useState<FileNode | null>(null);
    const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);

    const fetchFiles = useCallback(async () => {
        let servicePath = currentDirectoryPath;
        if (servicePath !== "/" && servicePath.endsWith("/")) {
            servicePath = servicePath.slice(0, -1);
        }
        console.log(`FilesPage: Fetching files for servicePath: ${servicePath}`);
        setIsLoading(true);
        setError(null);
        try {
            const fetchedFiles = await listFiles(
                servicePath,
                servicePath.startsWith("/public")
            );
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
        if (
            event &&
            (event.target as HTMLElement).closest(".context-menu-button")
        ) {
            return;
        }
        if (item.is_directory) {
            const baseNavPath = item.path.startsWith("/public")
                ? "/public"
                : "/files";
            const navigateTo = `${baseNavPath}${item.path}`;
            navigate(navigateTo);
        } else {
            console.log(`FilesPage: Clicked on file: ${item.path}`);
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
            setItemToRename(null);
            setIsRenameModalOpen(false);
            await fetchFiles();
        } catch (err) {
            console.error(`FilesPage: Failed to rename item`, err);
            throw err;
        }
    };

    const handleDeleteItem = async (item: FileNode) => {
        console.log(`FilesPage: Attempting to delete "${item.path}"`);
        try {
            await deleteNodeService(item.path);
            console.log(
                `FilesPage: Item deleted successfully (simulated). Refreshing list.`
            );
            setItemToDelete(null);
            setIsDeleteModalOpen(false);
            await fetchFiles();
        } catch (err) {
            console.error(`FilesPage: Failed to delete item`, err);
            throw err;
        }
    };

    const handleUploadFile = async (file: File, targetPath: string) => {
        console.log(
            `FilesPage: Attempting to upload "${file.name}" to ${targetPath}`
        );
        try {
            await uploadFileService(file, targetPath);
            console.log(
                `FilesPage: File "${file.name}" uploaded successfully (simulated). Refreshing list.`
            );
            await fetchFiles();
        } catch (err) {
            console.error(`FilesPage: Failed to upload file "${file.name}"`, err);
            throw err;
        }
    };

    const handleSaveAccess = async (itemPath: string, settings: AccessSettings) => {
        console.log(`FilesPage: Saving access settings for "${itemPath}":`, settings);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, this would make an API call to save the access settings
        // For now, just updates the local state to reflect changes
        setFiles(prevFiles =>
            prevFiles.map(file =>
                file.path === itemPath
                    ? {...file, is_public: settings.isPublic}
                    : file
            )
        );

        console.log(`FilesPage: Access settings saved successfully for "${itemPath}"`);
    };

    const openRenameModal = (item: FileNode) => {
        setItemToRename(item);
        setIsRenameModalOpen(true);
        setActiveContextMenu(null);
    };

    const openAccessModal = (item: FileNode) => {
        setItemForAccess(item);
        setIsAccessModalOpen(true);
        setActiveContextMenu(null);
    };

    const openDeleteModal = (item: FileNode) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
        setActiveContextMenu(null);
    };

    const toggleContextMenu = (itemId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setActiveContextMenu((prev) => (prev === itemId ? null : itemId));
    };

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

    const isInPublicFolder = currentDirectoryPath.startsWith("/public");

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
            <div className="mb-4 pb-4 border-b border-gray-200">
                <Breadcrumbs currentPath={currentDirectoryPath}/>
                <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
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
                        {isInPublicFolder ? (
                            <Link
                                to="/files"
                                className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Lock size={18} className="mr-2"/>
                                Back to My Files
                            </Link>
                        ) : (
                            <Link
                                to="/public"
                                className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <Globe size={18} className="mr-2"/>
                                Browse Public Files
                            </Link>
                        )}
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <UploadIcon size={18} className="mr-2"/>
                            Upload File
                        </button>
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
            {!isLoading && files.length === 0 && !error && (
                <div className="text-center py-10">
                    <Folder className="mx-auto h-12 w-12 text-gray-400"/>
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
                                    {file.is_public || file.path.startsWith("/public/") ? (
                                        <Globe
                                            className="h-4 w-4 mr-2 text-green-600 flex-shrink-0"
                                        />
                                    ) : (
                                        <Lock
                                            className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0"
                                        />
                                    )}
                                </div>
                                <div className="min-w-0">
                  <span className="text-gray-800 truncate font-medium text-sm block">
                    {file.name}
                  </span>
                                    {file.path === "/public" && !isInPublicFolder && (
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
                                <button
                                    onClick={(e) => toggleContextMenu(file.id, e)}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 context-menu-button"
                                    aria-label="More options"
                                >
                                    <MoreVertical size={18}/>
                                </button>
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
                                        <button
                                            onClick={() => openAccessModal(file)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                                        >
                                            <Eye size={16} className="mr-2"/> Share & Access
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(file)}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center"
                                        >
                                            <Trash2 size={16} className="mr-2"/> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Existing Modals */}
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
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                onConfirmDelete={handleDeleteItem}
                itemToDelete={itemToDelete}
            />
            <UploadFileModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadFile}
                targetPath={currentDirectoryPath}
            />

            {/* New Access Control Modal */}
            <AccessControlModal
                isOpen={isAccessModalOpen}
                onClose={() => {
                    setIsAccessModalOpen(false);
                    setItemForAccess(null);
                }}
                item={itemForAccess}
                onSaveAccess={handleSaveAccess}
            />
        </div>
    );
};

export default FilesPage;