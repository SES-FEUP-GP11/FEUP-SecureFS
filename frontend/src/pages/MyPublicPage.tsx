import React, { useState, useEffect, useCallback } from "react";
import type { PublicPageNode, ApiError } from "../types";
import {
  listMyPublicPages,
  uploadPublicHTMLFile,
  deletePublicPage,
} from "../services/publicPageService";
import {
  Globe,
  UploadCloud as UploadIcon,
  FileText,
  AlertCircle,
  Loader2,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Copy as CopyIcon,
  Check,
} from "lucide-react";
import UploadPublicHTMLModal from "../components/public_pages/UploadPublicHTMLModal";
import ConfirmDeleteModal from "../components/files/ConfirmDeleteModal";
import { useAuth } from "../hooks/useAuth"; // Import useAuth

const MyPublicPage: React.FC = () => {
  const [publicPages, setPublicPages] = useState<PublicPageNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PublicPageNode | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(
    null
  );
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const { user } = useAuth();
  const publicPageUsername =
    user?.email?.split("@")[0] || user?.first_name || "user";

  const fetchMyPublicPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pages = await listMyPublicPages();
      setPublicPages(pages);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPublicPages();
  }, [fetchMyPublicPages]);

  const handleUploadPublicHTML = async (filename: string, htmlFile: File) => {
    try {
      await uploadPublicHTMLFile(filename, htmlFile);
      await fetchMyPublicPages();
    } catch (err) {
      console.error(
        `MyPublicPage: Failed to upload HTML file "${filename}"`,
        err
      );
      throw err;
    }
  };

  const handleDeletePublicPage = async (page: PublicPageNode) => {
    try {
      await deletePublicPage(page.id);
      await fetchMyPublicPages();
    } catch (err) {
      console.error(`MyPublicPage: Failed to delete page`, err);
      throw err;
    }
  };

  const openDeleteModal = (page: PublicPageNode) => {
    setItemToDelete(page);
    setIsDeleteModalOpen(true);
    setActiveContextMenu(null);
  };
  const toggleContextMenu = (pageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveContextMenu((prev) => (prev === pageId ? null : pageId));
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveContextMenu(null);
    if (activeContextMenu)
      document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeContextMenu]);

  const handleCopyLink = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedLink(url);
        setTimeout(() => setCopiedLink(null), 2000);
      })
      .catch((err) => console.error("Failed to copy public URL:", err));
  };

  // This is the correct placement for loading and error state rendering
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading public files...</span>
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
          {error.message || "Could not load your public pages."}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div className="flex items-center">
          <Globe size={28} className="mr-3 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-gray-800">
            My Public HTML Pages
          </h1>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <UploadIcon size={18} className="mr-2" />
          Upload New HTML Page
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Manage HTML files for your public presence. Each file creates a publicly
        accessible page. Your public pages are available at a base URL like:
        <code className="text-xs bg-gray-100 p-1 rounded mx-1 break-all">
          [https://pages.yoursecurefs.com/](https://pages.yoursecurefs.com/)
          {publicPageUsername}/[your-filename-without-html]
        </code>
      </p>

      {/* This loading/error check is for after initial load, if list is empty */}
      {/* The main isLoading/error for initial empty state is handled above the return */}
      {!isLoading && !error && publicPages.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-500">
            You haven't published any HTML pages yet.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Upload an `index.html` or other HTML files to get started!
          </p>
        </div>
      )}

      {!isLoading && !error && publicPages.length > 0 && (
        <div className="space-y-3">
          {publicPages.map((page) => {
            const fullPublicUrl = `${
              window.location.protocol
            }//pages.yoursecurefs.com/${publicPageUsername}/${page.filename.replace(
              /\.html$/i,
              ""
            )}`;

            return (
              <div
                key={page.id}
                className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between group relative"
              >
                <div className="flex items-center min-w-0">
                  <FileText className="h-8 w-8 mr-4 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p
                      className="text-indigo-700 font-semibold text-md truncate"
                      title={page.filename}
                    >
                      {page.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last updated:{" "}
                      {new Date(page.updated_at).toLocaleDateString()}
                    </p>
                    <a
                      href={fullPublicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline break-all"
                    >
                      {fullPublicUrl}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0 ml-4">
                  <button
                    title="Preview Public Page"
                    onClick={() => window.open(fullPublicUrl, "_blank")}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    title="Copy Public Link"
                    onClick={() => handleCopyLink(fullPublicUrl)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md"
                  >
                    {copiedLink === fullPublicUrl ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <CopyIcon size={18} />
                    )}
                  </button>
                  <button
                    title="Delete Public Page"
                    onClick={() => openDeleteModal(page)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadPublicHTMLModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadPublicHTML}
      />
      {itemToDelete && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          onConfirmDelete={() => handleDeletePublicPage(itemToDelete)}
          itemToDelete={{
            ...itemToDelete,
            name: itemToDelete.filename,
            is_directory: false,
            logical_path: itemToDelete.public_url,
            path: itemToDelete.public_url,
          }} // Adapt for ConfirmDeleteModal
        />
      )}
    </div>
  );
};

export default MyPublicPage;
