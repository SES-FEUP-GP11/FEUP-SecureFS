import React, { useEffect, useState, FormEvent } from "react";
import Modal from "../Common/Modal";
import type {
  FileNode,
  ApiError,
  SharePermission,
  User as AppUser,
} from "../../types";
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
  Loader2,
} from "lucide-react";
import { createShare } from "../../services/fileService";
import { listUsers } from "../../services/authService"; // Import listUsers

type ExistingPermissionUser = {
  id: string;
  userId: number;
  email: string;
  name: string;
  role: "viewer" | "editor" | "owner";
};

type AccessControlModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: FileNode | null;
  onShareCreated: () => void;
};

const AccessControlModal: React.FC<AccessControlModalProps> = ({
  isOpen,
  onClose,
  item,
  onShareCreated,
}) => {
  const [sharedUsers, setSharedUsers] = useState<ExistingPermissionUser[]>([]);

  // State for adding a new user via select dropdown
  const [availableUsers, setAvailableUsers] = useState<AppUser[]>([]);
  const [selectedUserIdToShare, setSelectedUserIdToShare] =
    useState<string>(""); // Store ID as string from select
  const [newUserPermission, setNewUserPermission] = useState<"view" | "edit">(
    "view"
  );
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [isSubmittingShare, setIsSubmittingShare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPublic, setIsPublic] = useState(false);
  const [publicRole, setPublicRole] = useState<"viewer" | "editor" | "none">(
    "none"
  );
  const [shareLink, setShareLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setSelectedUserIdToShare("");
      setNewUserPermission("view");
      setError(null);
      setSuccessMessage(null);
      setIsSubmittingShare(false);
      setLinkCopied(false);
      setIsPublic(item.is_public || false);
      setPublicRole(item.is_public ? "viewer" : "none");
      setShareLink(
        item.is_public ? `https://securefs.example.com/shared/${item.id}` : ""
      );

      setSharedUsers([
        {
          id: "owner-perm",
          userId: 0,
          name: item.owner_username || "Owner",
          email: "(You)",
          role: "owner",
        },
      ]);

      // Fetch available users for the dropdown
      setIsLoadingUsers(true);
      listUsers()
        .then((users) => {
          setAvailableUsers(users);
        })
        .catch((err) => {
          console.error("Failed to fetch users for sharing:", err);
          setError("Could not load users to share with.");
        })
        .finally(() => setIsLoadingUsers(false));
    }
  }, [isOpen, item]);

  const handleAddShareSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item || !selectedUserIdToShare) {
      setError("Please select a user and ensure an item is selected.");
      return;
    }
    const userIdNum = parseInt(selectedUserIdToShare, 10);
    if (isNaN(userIdNum)) {
      setError("Invalid user selected."); // Should not happen with select
      return;
    }

    if (sharedUsers.some((su) => su.userId === userIdNum)) {
      setError("This item is already shared with this user.");
      return;
    }

    setIsSubmittingShare(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const newShare = await createShare(item.id, userIdNum, newUserPermission);
      setSuccessMessage(
        `Successfully shared with user ID ${newShare.shared_with_user} as ${newShare.permission_level}.`
      );
      setSelectedUserIdToShare("");
      if (onShareCreated) onShareCreated();
      setSharedUsers((prev) => [
        ...prev,
        {
          id: newShare.id,
          userId: newShare.shared_with_user,
          name:
            availableUsers.find(
              (u) => u.id.toString() === selectedUserIdToShare
            )?.email || `User ${newShare.shared_with_user}`, // Display email or placeholder
          email:
            availableUsers.find(
              (u) => u.id.toString() === selectedUserIdToShare
            )?.email || `user${newShare.shared_with_user}@example.com`,
          role: newShare.permission_level,
        },
      ]);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to share item.");
    } finally {
      setIsSubmittingShare(false);
    }
  };

  const handleCopyLink = async () => {
    /* ... */
  };
  const handleRemoveUserAccess = (userId: number) => {
    setError("Remove user not implemented yet.");
  };
  const handleChangeUserRole = (
    userId: number,
    newRole: "viewer" | "editor"
  ) => {
    setError("Change role not implemented yet.");
  };
  const handlePublicAccessChange = (makePublic: boolean) => {
    setIsPublic(makePublic);
    setPublicRole(makePublic ? "viewer" : "none");
    setError("Set public access not fully implemented yet.");
  };

  if (!isOpen || !item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${item.name}"`}>
      <div className="space-y-6">
        <form onSubmit={handleAddShareSubmit} className="space-y-3">
          <h3 className="text-md font-medium text-gray-800">
            Share with people
          </h3>
          <div className="flex items-end space-x-2">
            <div className="flex-grow">
              <label
                htmlFor="userToShareSelect"
                className="block text-sm font-medium text-gray-700"
              >
                User
              </label>
              {isLoadingUsers ? (
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading
                  users...
                </div>
              ) : (
                <select
                  id="userToShareSelect"
                  value={selectedUserIdToShare}
                  onChange={(e) => setSelectedUserIdToShare(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isSubmittingShare || availableUsers.length === 0}
                >
                  <option value="" disabled>
                    Select a user
                  </option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id.toString()}>
                      {u.first_name && u.last_name
                        ? `${u.first_name} ${u.last_name} (${u.email})`
                        : u.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label
                htmlFor="permissionLevelShare"
                className="block text-sm font-medium text-gray-700"
              >
                Permission
              </label>
              <select
                id="permissionLevelShare"
                value={newUserPermission}
                onChange={(e) =>
                  setNewUserPermission(e.target.value as "view" | "edit")
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                disabled={isSubmittingShare}
              >
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={
                isSubmittingShare || !selectedUserIdToShare || isLoadingUsers
              }
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 h-[38px] mt-auto"
            >
              {isSubmittingShare ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>

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
