import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom"; // No longer needs useParams for pageId
import type { ApiError } from "../types";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";

interface PreviewLocationState {
  publicUrlToFetch: string;
  pageName: string; // For display in the preview header
}

const PublicPagePreview: React.FC = () => {
  const location = useLocation();
  const state = location.state as PreviewLocationState | null;

  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [pageTitle, setPageTitle] = useState<string>("Preview");

  useEffect(() => {
    if (state && state.publicUrlToFetch) {
      setIsLoading(true);
      setError(null);
      setPageTitle(state.pageName || "Preview");

      console.log(
        `[PublicPagePreview] Fetching content from: ${state.publicUrlToFetch}`
      );
      fetch(state.publicUrlToFetch) // Use standard fetch for public, unauthenticated URL
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `HTTP error ${response.status}: Failed to fetch preview content.`
            );
          }
          return response.text();
        })
        .then((content) => {
          setHtmlContent(content);
        })
        .catch((err) => {
          console.error("[PublicPagePreview] Error fetching content:", err);
          setError({
            message: err.message || "Could not load preview content.",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError({ message: "Preview URL not provided." });
      setIsLoading(false);
    }
  }, [state]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-800 flex flex-col justify-center items-center text-white z-[100]">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400 mb-4" />
        <p>Loading Preview for {pageTitle}...</p>
        <Link
          to="/my-public-page"
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
        >
          Back to My Pages
        </Link>
      </div>
    );
  }
  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-800 flex flex-col justify-center items-center text-white p-4 z-[100]">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-xl mb-2">Error Loading Preview for {pageTitle}</p>
        <p className="text-red-300 mb-4">{error.message}</p>
        <Link
          to="/my-public-page"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
        >
          Back to My Pages
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-[100] flex flex-col">
      <div className="bg-gray-700 text-white p-2 flex items-center justify-between shadow-md shrink-0">
        <Link
          to="/my-public-page"
          className="flex items-center px-3 py-1 hover:bg-gray-600 rounded text-sm"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to My Pages
        </Link>
        <span className="text-sm truncate px-2">
          Preview: {pageTitle} (Sandboxed)
        </span>
        <span></span> {/* Spacer */}
      </div>
      <iframe
        title={`Public Page Preview - ${pageTitle}`}
        srcDoc={htmlContent || "<p>No content to display.</p>"}
        sandbox="" // Most restrictive: disables scripts, forms, popups, same-origin access, etc.
        className="w-full h-full border-0 flex-grow"
      />
    </div>
  );
};

export default PublicPagePreview;
