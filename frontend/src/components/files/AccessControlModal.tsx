import React, {useEffect, useState} from 'react';
import {AlertCircle, Check, Copy, Eye, Globe, Trash2, UserPlus, Users, X,} from 'lucide-react';
import type {FileNode} from '../../types';

type Permission = {
    id: string;
    email: string;
    name: string;
    role: 'viewer' | 'editor' | 'owner';
    avatar?: string;
}

type AccessSettings = {
    isPublic: boolean;
    publicRole: 'viewer' | 'editor' | 'none';
    shareLink: string;
    permissions: Permission[];
}

type AccessControlModalProps = {
    isOpen: boolean;
    onClose: () => void;
    item: FileNode | null;
    onSaveAccess: (itemPath: string, settings: AccessSettings) => Promise<void>;
}

// Mock data for demonstration
const mockUsers = [
    { email: 'john.doe@example.com', name: 'John Doe' },
    { email: 'jane.smith@example.com', name: 'Jane Smith' },
    { email: 'mike.johnson@example.com', name: 'Mike Johnson' },
    { email: 'sarah.wilson@example.com', name: 'Sarah Wilson' },
    { email: 'alex.brown@example.com', name: 'Alex Brown' },
];

const AccessControlModal: React.FC<AccessControlModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   item,
                                                                   onSaveAccess,
                                                               }) => {
    const [settings, setSettings] = useState<AccessSettings>({
        isPublic: false,
        publicRole: 'none',
        shareLink: '',
        permissions: [],
    });

    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<'viewer' | 'editor'>('viewer');
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchSuggestions, setSearchSuggestions] = useState<typeof mockUsers>([]);

    useEffect(() => {
        if (isOpen && item) {
            // Generate mock share link
            const shareLink = `https://securefs.example.com/shared/${item.id}`;

            // Initialize with mock data (later it comes from backend)
            const initialSettings: AccessSettings = {
                isPublic: item.is_public || false,
                publicRole: item.is_public ? 'viewer' : 'none',
                shareLink,
                permissions: [
                    {
                        id: '1',
                        email: 'testuser@example.com',
                        name: 'Test User',
                        role: 'owner',
                    },
                    // Add some mock shared permissions
                    ...(item.is_public ? [
                        {
                            id: '2',
                            email: 'collaborator@example.com',
                            name: 'Collaborator',
                            role: 'editor' as const,
                        }
                    ] : [])
                ],
            };

            setSettings(initialSettings);
            setError(null);
        }
    }, [isOpen, item]);

    const handleEmailInput = (value: string) => {
        setNewUserEmail(value);

        if (value.length > 0) {
            const filtered = mockUsers.filter(
                user =>
                    user.email.toLowerCase().includes(value.toLowerCase()) ||
                    user.name.toLowerCase().includes(value.toLowerCase())
            );
            setSearchSuggestions(filtered);
        } else {
            setSearchSuggestions([]);
        }
    };

    const handleAddUser = async () => {
        if (!newUserEmail.trim()) return;

        // Check if user already has permission
        const existingUser = settings.permissions.find(
            p => p.email.toLowerCase() === newUserEmail.toLowerCase()
        );

        if (existingUser) {
            setError('This user already has access to this file');
            return;
        }

        // Find user in mock data or create new
        const foundUser = mockUsers.find(
            u => u.email.toLowerCase() === newUserEmail.toLowerCase()
        );

        const newPermission: Permission = {
            id: Date.now().toString(),
            email: newUserEmail.trim(),
            name: foundUser?.name || newUserEmail.split('@')[0] || 'Unknown User',
            role: newUserRole,
        };

        setSettings(prev => ({
            ...prev,
            permissions: [...prev.permissions, newPermission],
        }));

        setNewUserEmail('');
        setSearchSuggestions([]);
        setIsAddingUser(false);
    };

    const handleRemoveUser = (permissionId: string) => {
        setSettings(prev => ({
            ...prev,
            permissions: prev.permissions.filter(p => p.id !== permissionId),
        }));
    };

    const handleChangeRole = (permissionId: string, newRole: 'viewer' | 'editor') => {
        setSettings(prev => ({
            ...prev,
            permissions: prev.permissions.map(p =>
                p.id === permissionId ? { ...p, role: newRole } : p
            ),
        }));
    };

    const handleTogglePublic = (isPublic: boolean) => {
        setSettings(prev => ({
            ...prev,
            isPublic,
            publicRole: isPublic ? 'viewer' : 'none',
        }));
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(settings.shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const handleSave = async () => {
        if (!item) return;

        setIsSaving(true);
        setError(null);

        try {
            await onSaveAccess(item.path, settings);
            onClose();
        } catch (err) {
            setError('Failed to save access settings. Please try again.');
            console.error('Error saving access settings:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            {item.is_directory ? (
                                <Users className="h-5 w-5 text-indigo-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-indigo-600" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Share "{item.name}"
                            </h2>
                            <p className="text-sm text-gray-500">
                                Manage who can access this {item.is_directory ? 'folder' : 'file'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    {error && (
                        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <span className="text-sm text-red-700">{error}</span>
                        </div>
                    )}

                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-base font-medium text-gray-900 mb-4">
                            General Access
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Globe className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Anyone with the link
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Anyone on the internet with this link can access
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {settings.isPublic && (
                                        <select
                                            value={settings.publicRole}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                publicRole: e.target.value as 'viewer' | 'editor',
                                            }))}
                                            className="text-sm border border-gray-300 rounded px-2 py-1"
                                        >
                                            <option value="viewer">Can view</option>
                                            <option value="editor">Can edit</option>
                                        </select>
                                    )}
                                    <button
                                        onClick={() => handleTogglePublic(!settings.isPublic)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            settings.isPublic ? 'bg-indigo-600' : 'bg-gray-200'
                                        }`}
                                    >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.isPublic ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                                    </button>
                                </div>
                            </div>

                            {settings.isPublic && (
                                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                                    <input
                                        type="text"
                                        value={settings.shareLink}
                                        readOnly
                                        className="flex-1 text-sm bg-transparent border-none outline-none text-blue-700"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors"
                                    >
                                        {linkCopied ? (
                                            <>
                                                <Check className="h-4 w-4" />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-medium text-gray-900">
                                People with access
                            </h3>
                            <button
                                onClick={() => setIsAddingUser(true)}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>Add people</span>
                            </button>
                        </div>

                        {isAddingUser && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-3">
                                    <div className="relative flex-1">
                                        <input
                                            type="email"
                                            value={newUserEmail}
                                            onChange={(e) => handleEmailInput(e.target.value)}
                                            placeholder="Enter email address"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {searchSuggestions.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                                                {searchSuggestions.map((user) => (
                                                    <button
                                                        key={user.email}
                                                        onClick={() => {
                                                            setNewUserEmail(user.email);
                                                            setSearchSuggestions([]);
                                                        }}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                                                    >
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-gray-500 text-xs">{user.email}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <select
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value as 'viewer' | 'editor')}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="viewer">Can view</option>
                                        <option value="editor">Can edit</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleAddUser}
                                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingUser(false);
                                            setNewUserEmail('');
                                            setSearchSuggestions([]);
                                        }}
                                        className="px-3 py-1 text-gray-600 text-sm hover:bg-gray-100 rounded transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {settings.permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {permission.name.charAt(0).toUpperCase()}
                      </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {permission.name}
                                                {permission.role === 'owner' && (
                                                    <span className="ml-2 text-xs text-gray-500">(Owner)</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500">{permission.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {permission.role !== 'owner' && (
                                            <>
                                                <select
                                                    value={permission.role}
                                                    onChange={(e) => handleChangeRole(permission.id, e.target.value as 'viewer' | 'editor')}
                                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                                >
                                                    <option value="viewer">Can view</option>
                                                    <option value="editor">Can edit</option>
                                                </select>
                                                <button
                                                    onClick={() => handleRemoveUser(permission.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                        {permission.role === 'owner' && (
                                            <span className="text-sm text-gray-500 px-2 py-1">Owner</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                    >
                        {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessControlModal;