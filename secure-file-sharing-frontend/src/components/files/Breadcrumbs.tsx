import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home as HomeIcon, ChevronRight } from "lucide-react";

interface BreadcrumbSegment {
  name: string;
  path: string; // The full path for navigation, e.g., "/files/Documents"
}

interface BreadcrumbsProps {
  currentPath: string; // The logical path from the user's root, e.g., "/Documents/Archive"
}

/**
 * Displays breadcrumb navigation for the current file path.
 * Allows users to navigate back to parent directories.
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPath }) => {
  const navigate = useNavigate();

  // Generate breadcrumb segments from the currentPath
  const segments: BreadcrumbSegment[] = React.useMemo(() => {
    const parts = currentPath.split("/").filter((part) => part !== ""); // Remove empty parts from split
    const generatedSegments: BreadcrumbSegment[] = [];

    // Always add a "Home" link for the root
    generatedSegments.push({ name: "My Files", path: "/files" }); // Root of the file browser

    let cumulativePath = "";
    parts.forEach((part) => {
      cumulativePath += `/${part}`;
      generatedSegments.push({
        name: part,
        path: `/files${cumulativePath}`, // Full browser path for navigation
      });
    });

    return generatedSegments;
  }, [currentPath]);

  // Handle click on a breadcrumb segment
  const handleBreadcrumbClick = (path: string) => {
    console.log(`Breadcrumbs: Navigating to ${path}`);
    navigate(path);
  };

  return (
    <nav
      aria-label="breadcrumb"
      className="mb-4 flex items-center space-x-1 text-sm text-gray-500"
    >
      {segments.map((segment, index) => (
        <React.Fragment key={segment.path}>
          {index > 0 && ( // Add separator before non-first items
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
          )}
          {index === segments.length - 1 ? ( // Last segment is the current page, not a link
            <span className="font-medium text-gray-700" aria-current="page">
              {segment.name === "My Files" &&
              index === 0 &&
              segments.length === 1
                ? "My Files (Root)"
                : segment.name}
            </span>
          ) : (
            <button
              onClick={() => handleBreadcrumbClick(segment.path)}
              className="hover:text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            >
              {segment.name === "My Files" && index === 0 ? ( // Special handling for "Home" link
                <HomeIcon className="h-4 w-4 inline-block mr-1 align-text-bottom" />
              ) : null}
              {segment.name}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
