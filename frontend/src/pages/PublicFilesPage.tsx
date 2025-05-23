import React, {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import type {ApiError, FileNode} from "../types";
import {listPublicFiles} from "../services/fileService";
import {AlertCircle, ArrowLeft, File as FileIcon, Folder, Loader2, User,} from "lucide-react";

const PublicFilesPage: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams();

    const splatPath = params["*"] || "";
    const currentPath = `/${splatPath}`;

    const [files, setFiles] = useState<FileNode[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<ApiError | null>(null);

    const fetchPublicFiles = useCallback(async () => {
        let servicePath = currentPath;
        if (servicePath !== "/" && servicePath.endsWith("/")) {
            servicePath = servicePath.slice(0, -1);
        }

        console.log(`PublicFilesPage: Fetching public files for path: ${servicePath}`);
        setIsLoading(true);
        setError(null);

        try {
            const fetchedFiles = await listPublicFiles(servicePath);
            setFiles(fetchedFiles);
        } catch (err) {
            setError(err as ApiError);
        } finally {
            setIsLoading(false);
        }
    }, [currentPath]);

    useEffect(() => {
        fetchPublicFiles();
    }, [fetchPublicFiles]);

    const handleItemClick = (item: FileNode) => {
        if (item.is_directory) {
            const navigateTo = `/public${item.path}`;
            navigate(navigateTo);
        } else {
            console.log(`PublicFilesPage: Clicked on public file: ${item.path}`);
            // Future: open file preview or download
        }
    };

    const handleBackClick = () => {
        if (currentPath === "/") {
            navigate("/files");
            return;
        }

        const pathParts = currentPath.split("/").filter(Boolean);
        pathParts.pop(); // Remove last part

        const parentPath = pathParts.length === 0 ? "/" : `/${pathParts.join("/")}`;
        navigate(`/public${parentPath}`);
    };

    const formatFileSize = (sizeInBytes: number): string => {
        if (sizeInBytes < 1024) return `${sizeInBytes} B`;
        if (sizeInBytes < 1024 * 1024)
            return `${(sizeInBytes / 1024).toFixed(1)} KB`;
        if (sizeInBytes < 1024 * 1024 * 1024)
            return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    const getBreadcrumbs = () => {
        const parts = currentPath === "/" ? [] : currentPath.split("/").filter(Boolean);
        const breadcrumbs = [{name: "Public Files", path: "/"}];

        let accumPath = "";
        parts.forEach((part, index) => {
            accumPath += `/${part}`;
            breadcrumbs.push({
                name: index === 0 ? `👤 ${part}` : part,
                path: accumPath,
            });
        });

        return breadcrumbs;
    };

    const canGoBack = true;

    if (isLoading && files.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600"/>
                <span className="ml-2 text-gray-600">Loading public files...</span>
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

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center mb-3">
                    {canGoBack && (
                        <button
                            onClick={handleBackClick}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-gray-800 transition-colors duration-150 mr-4"
                            aria-label={currentPath === "/" ? "Go back to My Files" : "Go back to parent directory"}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1"/>
                            {currentPath === "/" ? "My Files" : "Back"}
                        </button>
                    )}

                    <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                        Public Files
                        {currentPath !== "/" && (
                            <span className="font-mono text-indigo-700 ml-2">
                                {currentPath}
                            </span>
                        )}
                    </h1>
                </div>

                {/* Custom Breadcrumbs */}
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                        {breadcrumbs.map((crumb, index) => (
                            <li key={index} className="flex items-center">
                                {index > 0 && (
                                    <span className="text-gray-400 mx-2">/</span>
                                )}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="text-gray-700 font-medium">{crumb.name}</span>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/public${crumb.path}`)}
                                        className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                                    >
                                        {crumb.name}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                {currentPath === "/" && (
                    <p className="text-sm text-gray-600 mt-2">
                        Browse files and folders that users have made publicly accessible.
                    </p>
                )}
            </div>

            {/* Inline loading/error for subsequent loads */}
            {isLoading && files.length > 0 && (
                <div className="text-center py-4 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin inline mr-2"/> Loading more...
                </div>
            )}

            {error && files.length > 0 && (
                <div className="my-2 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
                    Error refreshing content: {error.message}
                </div>
            )}

            {!isLoading && files.length === 0 && !error && (
                <div className="text-center py-10">
                    <p className="mt-2 text-sm font-medium text-gray-500">
                        {currentPath === "/"
                            ? "No public files available yet."
                            : "This public folder is empty."
                        }
                    </p>
                    {currentPath === "/" && (
                        <p className="mt-1 text-xs text-gray-400">
                            Users can share files by placing them in their 'public' folder.
                        </p>
                    )}
                </div>
            )}

            {files.length > 0 && (
                <ul className="divide-y divide-gray-200">
                    {files.map((file) => (
                        <li
                            key={file.id}
                            className="flex items-center justify-between px-2 py-3 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-150"
                            onClick={() => handleItemClick(file)}
                        >
                            <div className="flex items-center min-w-0 flex-1 mr-4">
                                {file.is_directory ? (
                                    currentPath === "/" ? (
                                        <User className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0"/>
                                    ) : (
                                        <Folder className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0"/>
                                    )
                                ) : (
                                    <FileIcon className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0"/>
                                )}
                                <div className="min-w-0">
                                    <span className="text-gray-800 truncate font-medium text-sm block">
                                        {file.name}
                                    </span>
                                    {currentPath === "/" && (
                                        <span className="text-xs text-gray-500">
                                            Public files from {file.owner_username}
                                        </span>
                                    )}
                                </div>
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
                                {file.owner_username && currentPath !== "/" && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        by {file.owner_username}
                                    </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PublicFilesPage;