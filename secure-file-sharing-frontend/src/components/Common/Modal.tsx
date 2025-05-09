import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode; // Optional footer for action buttons
}

/**
 * A reusable modal component.
 * Uses Tailwind CSS for styling.
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close on backdrop click
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all" // MODIFIED: Removed animation classes for debugging
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 mb-6">{children}</div>

        {/* Footer (optional) */}
        {footer && (
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
      {/* Previous animation classes on modal content div:
        scale-95 opacity-0 animate-modalShow

        If removing them makes the modal visible, the issue is with the animation
        or its definition in tailwind.config.js not being picked up.
        Ensure your tailwind.config.js has:
        extend: {
          animation: {
            modalShow: 'modalShow 0.3s ease-out forwards',
          },
          keyframes: {
            modalShow: {
              '0%': { transform: 'scale(0.95)', opacity: '0' },
              '100%': { transform: 'scale(1)', opacity: '1' },
            },
          },
        },
        And that your Vite dev server was restarted after adding/modifying tailwind.config.js.
      */}
    </div>
  );
};

export default Modal;
