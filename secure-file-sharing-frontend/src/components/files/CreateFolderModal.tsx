import React, { useState, FormEvent } from "react";
import Modal from "../Common/Modal"; // Import the reusable Modal
import type { ApiError } from "../../types";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => Promise<void>; // Async to handle potential errors
  parentPath: string; // To display context, e.g., "Create folder in /Documents"
}

/**
 * Modal component for creating a new folder.
 */
const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  parentPath,
}) => {
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!folderName.trim()) {
      setError("Folder name cannot be empty.");
      return;
    }
    // Basic validation for invalid characters (simplified)
    if (/[/\\]/.test(folderName)) {
      setError("Folder name cannot contain slashes.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCreate(folderName.trim());
      setFolderName(""); // Reset input on success
      onClose(); // Close modal on success
    } catch (err) {
      const apiError = err as ApiError;
      console.error("CreateFolderModal: Error creating folder", apiError);
      setError(apiError.message || "Failed to create folder.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when modal is closed/reopened
  React.useEffect(() => {
    if (isOpen) {
      setFolderName("");
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create New Folder in ${parentPath === "/" ? "Root" : parentPath}`}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="folderName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Folder Name
          </label>
          <input
            type="text"
            id="folderName"
            name="folderName"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter folder name"
            disabled={isLoading}
            required
            autoFocus // Focus on input when modal opens
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !folderName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateFolderModal;
