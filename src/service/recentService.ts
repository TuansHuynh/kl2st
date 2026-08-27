import api from '../api/api';

export interface RecentItem {
    id: string;
    title: string;
    type: 'pdf' | 'word' | 'excel' | 'note' | 'media' | 'zip' | 'link' | 'other';
    url: string;
    timestamp: string;
    pinned: boolean;
    size?: string;
    author?: string;
}

const DEFAULT_RECENT_ITEMS: RecentItem[] = [
    {
        id: "rec-1",
        title: "Báo cáo doanh thu Q2_2026.pdf",
        type: "pdf",
        url: "/pdf",
        timestamp: "10 phút trước",
        pinned: true,
        size: "2.4 MB",
        author: "Nguyễn Văn A"
    },
    {
        id: "rec-2",
        title: "Hợp đồng dịch vụ tư vấn.docx",
        type: "word",
        url: "/word",
        timestamp: "45 phút trước",
        pinned: true,
        size: "1.1 MB",
        author: "Trần Thị B"
    },
    {
        id: "rec-3",
        title: "Danh sách tài khoản phòng ban",
        type: "link",
        url: "/account",
        timestamp: "2 giờ trước",
        pinned: false
    },
    {
        id: "rec-4",
        title: "Bảng cân đối tài chính.xlsx",
        type: "excel",
        url: "/excel",
        timestamp: "Hôm qua, 16:20",
        pinned: false,
        size: "850 KB"
    },
    {
        id: "rec-5",
        title: "Ghi chú cuộc họp chiến lược",
        type: "note",
        url: "/note",
        timestamp: "Hôm qua, 14:00",
        pinned: false
    },
    {
        id: "rec-6",
        title: "Bộ nhận diện thương hiệu.zip",
        type: "zip",
        url: "/zip",
        timestamp: "26/07/2026",
        pinned: false,
        size: "15.8 MB"
    }
];

const STORAGE_KEY = "kl2stu_recent_items";
const EVENT_NAME = "kl2stu_recent_updated";

export const recentService = {
    // Notify all listeners across the app
    notifyUpdate() {
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
    },

    // Get current items
    async getRecentItems(): Promise<RecentItem[]> {
        try {
            const res = await api.get<RecentItem[]>('/recent');
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                return res.data;
            }
        } catch (err) {
            // Offline fallback
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try { return JSON.parse(stored); } catch {}
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECENT_ITEMS));
        return DEFAULT_RECENT_ITEMS;
    },

    // Add or move an item to recent list
    async addRecentItem(item: { title: string; type: RecentItem['type']; url: string; size?: string; author?: string }): Promise<RecentItem[]> {
        const current = await this.getRecentItems();
        const now = new Date();
        const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const existsIndex = current.findIndex(r => r.url === item.url || (r.title === item.title && r.type === item.type));

        let updated: RecentItem[];

        if (existsIndex >= 0) {
            updated = [...current];
            const existingItem = updated[existsIndex];
            updated.splice(existsIndex, 1);
            updated.unshift({
                ...existingItem,
                title: item.title,
                timestamp: `Lúc ${timeFormatted}`,
                size: item.size || existingItem.size,
                author: item.author || existingItem.author
            });
        } else {
            const newItem: RecentItem = {
                id: `rec-${Date.now()}`,
                title: item.title,
                type: item.type,
                url: item.url,
                timestamp: `Lúc ${timeFormatted}`,
                pinned: false,
                size: item.size,
                author: item.author
            };
            updated = [newItem, ...current].slice(0, 15);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        try {
            await api.post('/recent', item);
        } catch {}

        this.notifyUpdate();
        return updated;
    },

    // Toggle pinned status
    async togglePin(id: string): Promise<RecentItem[]> {
        const current = await this.getRecentItems();
        const updated = current.map(item => item.id === id ? { ...item, pinned: !item.pinned } : item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        try {
            await api.put(`/recent/${id}/pin`);
        } catch {}

        this.notifyUpdate();
        return updated;
    },

    // Clear history
    async clearHistory(): Promise<void> {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        try {
            await api.delete('/recent');
        } catch {}
        this.notifyUpdate();
    },

    EVENT_NAME
};
