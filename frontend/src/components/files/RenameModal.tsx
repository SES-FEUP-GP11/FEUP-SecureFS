import React, { useState, FormEvent, useEffect } from "react";
import Modal from "../Common/Modal";
import type { ApiError, FileNode } from "../../types"; // Import FileNode

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (itemToRename: FileNode, newName: string) => Promise<void>;
  itemToRename: FileNode | null; // The file or folder node to be renamed
}

/**
 * Modal component for renaming a file or folder.
 */
const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  onRename,
  itemToRename,
}) => {
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill the input with the current item's name when the modal opens or item changes
  useEffect(() => {
    if (isOpen && itemToRename) {
      setNewName(itemToRename.name);
      setError(null); // Clear previous errors
      setIsLoading(false);
    }
  }, [isOpen, itemToRename]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!itemToRename) {
      setError("No item selected for renaming.");
      return;
    }
    if (!newName.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    if (/[/\\]/.test(newName)) {
      setError("Name cannot contain slashes.");
      return;
    }
    if (newName.trim() === itemToRename.name) {
      setError("The new name is the same as the current name.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onRename(itemToRename, newName.trim());
      onClose(); // Close modal on success
    } catch (err) {
      const apiError = err as ApiError;
      console.error("RenameModal: Error renaming item", apiError);
      setError(apiError.message || "Failed to rename item.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!itemToRename) {
    // This case should ideally not be reached if modal is opened correctly
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rename ${itemToRename.is_directory ? "Folder" : "File"}`}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="mb-2">
          <p className="text-sm text-gray-600">
            Current name:{" "}
            <span className="font-medium">{itemToRename.name}</span>
          </p>
        </div>
        <div>
          <label
            htmlFor="newName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Name
          </label>
          <input
            type="text"
            id="newName"
            name="newName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={`Enter new ${
              itemToRename.is_directory ? "folder" : "file"
            } name`}
            disabled={isLoading}
            required
            autoFocus
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
            disabled={
              isLoading ||
              !newName.trim() ||
              newName.trim() === itemToRename.name
            }
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Renaming..." : "Rename"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RenameModal;
