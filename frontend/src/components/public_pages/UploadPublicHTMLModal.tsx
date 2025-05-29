import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import Modal from "../Common/Modal";
import type { ApiError } from "../../types";
import { UploadCloud, FileText as FileIconHtml } from "lucide-react";

interface UploadPublicHTMLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (filename: string, htmlFile: File) => Promise<void>;
}

const UploadPublicHTMLModal: React.FC<UploadPublicHTMLModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [filename, setFilename] = useState("");
  const [selectedHtmlFile, setSelectedHtmlFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFilename("");
      setSelectedHtmlFile(null);
      setError(null);
      setIsLoading(false);
      setDragOver(false);
    }
  }, [isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === "text/html") {
        setSelectedHtmlFile(file);
        if (!filename && file.name.toLowerCase().endsWith(".html")) {
          setFilename(file.name);
        }
        setError(null);
      } else {
        setSelectedHtmlFile(null);
        setError("Invalid file type. Only HTML files (.html) are allowed.");
      }
    } else {
      setSelectedHtmlFile(null);
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
      const file = event.dataTransfer.files[0];
      if (file.type === "text/html") {
        setSelectedHtmlFile(file);
        if (!filename && file.name.toLowerCase().endsWith(".html")) {
          setFilename(file.name);
        }
        setError(null);
      } else {
        setSelectedHtmlFile(null);
        setError("Invalid file type. Only HTML files (.html) are allowed.");
      }
      event.dataTransfer.clearData();
    }
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let cleanFilename = filename.trim();
    if (!cleanFilename) {
      setError("Public filename is required.");
      return;
    }
    if (!cleanFilename.toLowerCase().endsWith(".html")) {
      cleanFilename += ".html";
    }
    if (/[/\\]/.test(cleanFilename)) {
      setError("Filename cannot contain slashes.");
      return;
    }
    if (!selectedHtmlFile) {
      setError("Please select an HTML file to upload.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onUpload(cleanFilename, selectedHtmlFile);
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to upload HTML page.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload New Public HTML Page"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="publicFilename"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Public Filename (e.g., index.html, about.html)
          </label>
          <input
            type="text"
            id="publicFilename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            placeholder="index.html"
            disabled={isLoading}
            required
          />
        </div>
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
              className={`mx-auto h-10 w-10 ${
                dragOver ? "text-indigo-600" : "text-gray-400"
              }`}
            />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="html-file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Upload an HTML file</span>
                <input
                  id="html-file-upload"
                  name="html-file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept=".html,text/html"
                  disabled={isLoading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              Only .html files are allowed.
            </p>
          </div>
        </div>
        {selectedHtmlFile && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center space-x-2">
              <FileIconHtml className="h-5 w-5 text-indigo-500 shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">
                {selectedHtmlFile.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(selectedHtmlFile.size / 1024).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={() => setSelectedHtmlFile(null)}
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedHtmlFile || !filename.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? "Uploading..." : "Upload Page"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default UploadPublicHTMLModal;
