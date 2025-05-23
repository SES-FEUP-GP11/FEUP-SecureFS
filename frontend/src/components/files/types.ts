import {FileNode} from "../../types";

export type Permission = {
    id: string;
    email: string;
    name: string;
    role: 'viewer' | 'editor' | 'owner';
    avatar?: string;
    addedAt?: string;
}

export type AccessSettings = {
    isPublic: boolean;
    publicRole: 'viewer' | 'editor' | 'none';
    shareLink: string;
    permissions: Permission[];
    allowDownload?: boolean;
    allowComments?: boolean;
    expirationDate?: string | null;
}

export type AccessControlModalProps = {
    isOpen: boolean;
    onClose: () => void;
    item: FileNode | null;
    onSaveAccess: (itemPath: string, settings: AccessSettings) => Promise<void>;
}

export interface ExtendedFileNode extends FileNode {
    accessSettings?: AccessSettings;
    sharedWith?: Permission[];
    publicAccess?: {
        enabled: boolean;
        role: 'viewer' | 'editor';
        link: string;
    };
}