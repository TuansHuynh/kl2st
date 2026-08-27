// ---- User / Account ----
export interface UserSetting {
    userId: string;
    phone: string;
    notifEmail: boolean;
    notifPush: boolean;
    notifUpload: boolean;
    notifMeeting: boolean;
    notifTeam: boolean;
    darkMode: boolean;
    compactView: boolean;
    language: string;
    timezone: string;
    autoBackup: boolean;
    backupFreq: string;
}

export interface User {
    id: string;
    email: string;
    fullName: string;
    department: string;
    avatar: string;
    status: 'active' | 'inactive' | 'suspended';
    joinDate: string;      // ISO date string
    roles: string[];       // ['admin'], ['manager'], ['member']
    settings?: UserSetting;
}

// ---- Auth ----
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    department?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// ---- Team ----
export interface Team {
    id: string;
    name: string;
    description: string;
    leaderId: string;
    leaderName: string;
    status: 'active' | 'archived';
    color: string;
    projectCount: number;
    createdDate: string;   // ISO date string
    members: User[];
}

// ---- Meeting ----
export interface Meeting {
    id: string;
    title: string;
    description: string;
    meetingDate: string;   // ISO date string
    meetingTime: string;   // HH:mm:ss
    duration: string;
    organizerId: string;
    organizerName: string;
    coOrganizers?: User[];
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    type: 'video' | 'inperson' | 'hybrid';
    room: string;
    link: string | null;
    participants: User[];
}

// ---- Document ----
export interface Document {
    id: string;
    name: string;
    type: 'pdf' | 'word' | 'excel' | 'image' | 'zip' | 'note' | 'other';
    sizeBytes: number;
    authorId: string;
    authorName: string;
    uploadedDate: string;  // ISO date string
    tags?: string[];       // Tags chung cho mọi loại document

    // PDF metadata
    pages?: number;

    // Word metadata
    wordCount?: number;

    // Excel metadata
    sheets?: number;
    rows?: number;

    // Media metadata
    mediaType?: string;    // image, video, audio
    resolution?: string;

    // Zip metadata
    archiveType?: string;  // zip, rar, 7z, tar.gz
    fileCount?: number;

    // Note metadata
    content?: string;
    color?: string;
    pinned?: boolean;

    // Other metadata
    fileType?: string;     // e.g., '.pptx', '.yaml'
    category?: string;     // presentation, code, text, other
}
