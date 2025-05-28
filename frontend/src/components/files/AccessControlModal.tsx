import React, { useEffect, useState, FormEvent } from "react";
import Modal from "../Common/Modal"; // Assuming Modal.tsx is in ../Common/
import type {
  FileNode,
  ApiError,
  SharePermission,
  User as AppUser,
} from "../../types"; // User type from your app
import {
  AlertCircle,
  Check,
  Copy,
  Globe,
  Trash2,
  UserPlus,
  Users,
  X,
  Eye,
} from "lucide-react";
import { createShare } from "../../services/fileService"; // Import createShare

// This type might be extended with more details if backend provides them
type ExistingPermissionUser = {
  id: string; // Permission ID
  userId: number; // User ID
  email: string; // User email for display
  name: string; // User name for display
  role: "viewer" | "editor" | "owner";
};

type AccessSettings = {
  isPublic: boolean; // This might be handled by a separate mechanism now
  publicRole: "viewer" | "editor" | "none";
  shareLink: string; // Still useful to display
  // This will be populated by fetching existing shares for the item
  permissions: ExistingPermissionUser[];
};

type AccessControlModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: FileNode | null;
  // onSaveAccess might be replaced by more specific handlers or a general refresh
  onShareCreated: () => void; // Callback after a share is successfully created
  // TODO: Add props for fetching existing shares, removing shares, updating roles
};

const AccessControlModal: React.FC<AccessControlModalProps> = ({
  isOpen,
  onClose,
  item,
  onShareCreated,
}) => {
  // State for managing who the item is shared with
  // This would ideally be fetched from backend: GET /api/sharing/?node_id={item.id}
  const [sharedUsers, setSharedUsers] = useState<ExistingPermissionUser[]>([]);

  // State for adding a new user
  const [newShareUserId, setNewShareUserId] = useState(""); // Expecting user ID (number)
  const [newUserPermission, setNewUserPermission] = useState<"view" | "edit">(
    "view"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // For public link and general access (simplified for now)
  const [isPublic, setIsPublic] = useState(false);
  const [publicRole, setPublicRole] = useState<"viewer" | "editor" | "none">(
    "none"
  );
  const [shareLink, setShareLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      // Reset form state
      setNewShareUserId("");
      setNewUserPermission("view");
      setError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
      setLinkCopied(false);

      // Populate initial state based on item (mocked/simplified for now)
      setIsPublic(item.is_public || false);
      setPublicRole(item.is_public ? "viewer" : "none"); // Default public role if item is public
      setShareLink(
        item.is_public ? `https://securefs.example.com/shared/${item.id}` : ""
      );

      // TODO: Fetch existing shares for this item when modal opens
      // Example: getSharePermissionsForItem(item.id).then(setSharedUsers);
      // For now, using a placeholder for the owner:
      setSharedUsers([
        {
          id: "owner-perm",
          userId: 0, // Placeholder for current user/owner ID
          name: item.owner_username || "Owner",
          email: "(You)",
          role: "owner",
        },
      ]);
    }
  }, [isOpen, item]);

  const handleAddShareSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item || !newShareUserId.trim()) {
      setError("User ID and item are required.");
      return;
    }
    const userIdNum = parseInt(newShareUserId.trim(), 10);
    if (isNaN(userIdNum)) {
      setError("User ID must be a number.");
      return;
    }

    // Prevent sharing with self or if already shared (basic client check)
    // A more robust check would involve fetching current user ID from AuthContext
    if (sharedUsers.some((su) => su.userId === userIdNum)) {
      setError("This item is already shared with this user ID.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newShare = await createShare(item.id, userIdNum, newUserPermission);
      setSuccessMessage(
        `Successfully shared with user ID ${newShare.shared_with_user} as ${newShare.permission_level}.`
      );
      // TODO: Refresh sharedUsers list by fetching from backend or adding locally
      // For now, just clearing input and calling the callback
      setNewShareUserId("");
      if (onShareCreated) onShareCreated();
      // Ideally, fetch and update sharedUsers list here
      // For simulation, add to local state:
      setSharedUsers((prev) => [
        ...prev,
        {
          id: newShare.id, // ID of the SharePermission record
          userId: newShare.shared_with_user,
          name: `User ${newShare.shared_with_user}`, // Placeholder name
          email: `user${newShare.shared_with_user}@example.com`, // Placeholder email
          role: newShare.permission_level,
        },
      ]);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to share item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Placeholder functions for managing existing shares (remove, change role)
  // These would call respective service functions and update `sharedUsers` state
  const handleRemoveUserAccess = (userId: number) => {
    console.log("TODO: Remove access for user ID:", userId);
    setError("Remove user not implemented yet.");
  };
  const handleChangeUserRole = (
    userId: number,
    newRole: "viewer" | "editor"
  ) => {
    console.log("TODO: Change role for user ID:", userId, "to", newRole);
    setError("Change role not implemented yet.");
  };
  const handlePublicAccessChange = (makePublic: boolean) => {
    setIsPublic(makePublic);
    setPublicRole(makePublic ? "viewer" : "none");
    console.log("TODO: API call to set public access", makePublic);
    setError("Set public access not fully implemented yet.");
  };

  if (!isOpen || !item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${item.name}"`}>
      <div className="space-y-6">
        {/* Section to add new people */}
        <form onSubmit={handleAddShareSubmit} className="space-y-3">
          <h3 className="text-md font-medium text-gray-800">
            Share with people
          </h3>
          <div className="flex items-end space-x-2">
            <div className="flex-grow">
              <label
                htmlFor="userIdToShare"
                className="block text-sm font-medium text-gray-700"
              >
                User ID
              </label>
              <input
                id="userIdToShare"
                type="number" // Expecting user ID as per API
                value={newShareUserId}
                onChange={(e) => setNewShareUserId(e.target.value)}
                placeholder="Enter User ID to share with"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label
                htmlFor="permissionLevel"
                className="block text-sm font-medium text-gray-700"
              >
                Permission
              </label>
              <select
                id="permissionLevel"
                value={newUserPermission}
                onChange={(e) =>
                  setNewUserPermission(e.target.value as "view" | "edit")
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                disabled={isSubmitting}
              >
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !newShareUserId.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 h-[38px] mt-auto"
            >
              {isSubmitting ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>

        {/* Display messages */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        {/* Section to manage existing shares */}
        {sharedUsers.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-gray-800 mt-4 mb-2">
              People with access
            </h3>
            <ul className="max-h-40 overflow-y-auto divide-y divide-gray-200 border rounded-md">
              {sharedUsers.map((userPerm) => (
                <li
                  key={userPerm.id}
                  className="px-3 py-2 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {userPerm.name}
                    </p>
                    <p className="text-xs text-gray-500">{userPerm.email}</p>
                  </div>
                  {userPerm.role === "owner" ? (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      Owner
                    </span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <select
                        value={userPerm.role}
                        onChange={(e) =>
                          handleChangeUserRole(
                            userPerm.userId,
                            e.target.value as "view" | "edit"
                          )
                        }
                        className="text-xs border border-gray-300 rounded px-1.5 py-0.5"
                      >
                        <option value="view">Can view</option>
                        <option value="editor">Can edit</option>
                      </select>
                      <button
                        onClick={() => handleRemoveUserAccess(userPerm.userId)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Public Access Section (Simplified) */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-md font-medium text-gray-800 mb-2">
            General access
          </h3>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Anyone with the link
                </p>
                <p className="text-xs text-gray-500">
                  {isPublic ? "Can " + publicRole : "No public access"}
                </p>
              </div>
            </div>
            <button
              onClick={() => handlePublicAccessChange(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {isPublic && (
            <div className="mt-2 flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 text-sm bg-transparent border-none outline-none text-blue-700"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 rounded"
              >
                {linkCopied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Done
        </button>
      </div>
    </Modal>
  );
};

export default AccessControlModal;
