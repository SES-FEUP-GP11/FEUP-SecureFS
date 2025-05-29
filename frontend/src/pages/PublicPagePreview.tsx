import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicPageContent } from "../services/publicPageService";
import type { ApiError } from "../types";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";

const PublicPagePreview: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (pageId) {
      setIsLoading(true);
      setError(null);
      getPublicPageContent(pageId)
        .then((content) => setHtmlContent(content))
        .catch((err) => setError(err as ApiError))
        .finally(() => setIsLoading(false));
    } else {
      setError({ message: "Page ID is missing." });
      setIsLoading(false);
    }
  }, [pageId]);

  // This is the correct placement for loading and error state rendering
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-800 flex flex-col justify-center items-center text-white z-[100]">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400 mb-4" />
        <p>Loading Preview...</p>
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
        <p className="text-xl mb-2">Error Loading Preview</p>
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
        <span className="text-sm">
          HTML Preview (Sandboxed - Scripts Disabled)
        </span>
        <span></span> {/* Spacer */}
      </div>
      <iframe
        title="Public Page Preview"
        srcDoc={htmlContent || "<p>No content to display.</p>"}
        sandbox="" // Most restrictive: disables scripts, forms, popups, etc.
        className="w-full h-full border-0 flex-grow"
      />
    </div>
  );
};

export default PublicPagePreview;
