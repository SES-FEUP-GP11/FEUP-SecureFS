import React, { useState, ChangeEvent, FormEvent } from "react";
import Modal from "../Common/Modal";
import type { ApiError } from "../../types";
import { UploadCloud, File as FileIcon } from "lucide-react";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, targetPath: string) => Promise<void>;
  targetPath: string; // The path where the file will be uploaded
}

/**
 * Modal component for uploading files.
 */
const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  targetPath,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null); // Clear previous error if a new file is selected
    } else {
      setSelectedFile(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
      setError(null);
      event.dataTransfer.clearData();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onUpload(selectedFile, targetPath);
      setSelectedFile(null); // Reset file input on success
      onClose(); // Close modal on success
    } catch (err) {
      const apiError = err as ApiError;
      console.error("UploadFileModal: Error uploading file", apiError);
      setError(apiError.message || "Failed to upload file.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when modal is closed/reopened
  React.useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setError(null);
      setIsLoading(false);
      setDragOver(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Upload File to ${targetPath === "/" ? "Root" : targetPath}`}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <div
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
            dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
          } border-dashed rounded-md transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            <UploadCloud
              className={`mx-auto h-12 w-12 ${
                dragOver ? "text-indigo-600" : "text-gray-400"
              }`}
            />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              Any file up to X MB (Backend will validate size)
            </p>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center space-x-2">
              <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">
                {selectedFile.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="ml-auto text-sm text-red-500 hover:text-red-700"
                disabled={isLoading}
              >
                Remove
              </button>
            </div>
          </div>
        )}

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
            disabled={isLoading || !selectedFile}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadFileModal;
