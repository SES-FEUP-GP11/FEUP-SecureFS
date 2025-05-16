import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import type { FileNode, ApiError } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (itemToDelete: FileNode) => Promise<void>;
  itemToDelete: FileNode | null;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  itemToDelete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    setError(null);
    try {
      await onConfirmDelete(itemToDelete);
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete item.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) { setError(null); setIsLoading(false); }
  }, [isOpen]);

  if (!itemToDelete) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Confirm Delete ${itemToDelete.is_directory ? 'Folder' : 'File'}`}>
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-md text-gray-600 mb-2">
          Are you sure you want to delete <strong className="mx-1">"{itemToDelete.name}"</strong>?
        </p>
        {itemToDelete.is_directory && (<p className="text-sm text-red-600 font-semibold">This will delete the folder and all its contents. This action cannot be undone.</p>)}
        {!itemToDelete.is_directory && (<p className="text-sm text-red-600 font-semibold">This action cannot be undone.</p>)}
        {error && (<div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>)}
      </div>
      <div className="mt-6 flex justify-center space-x-3">
        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">Cancel</button>
        <button type="button" onClick={handleDelete} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
          {isLoading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
};
export default ConfirmDeleteModal;