import api from '../api/api';

export interface ChatMessage {
    id: string;
    sender: string;
    role: 'user' | 'ai' | 'team';
    content: string;
    timestamp: string;
    avatar?: string;
}

const isSampleMessage = (content: string) => {
    return content === "Xin chào! Tôi là trợ lý AI của hệ thống KL2StU. Bạn cần hỗ trợ tìm kiếm tài liệu, thông tin cuộc họp hay quản lý phân quyền?" ||
           content === "Mọi người đã duyệt file Báo cáo tài chính Q2 chưa?" ||
           content === "Tôi vừa cập nhật lại số liệu ở sheet 2 rồi nhé!";
};

export const chatService = {
    async getMessages(mode: 'ai' | 'team', teamId?: string): Promise<ChatMessage[]> {
        try {
            const res = await api.get<ChatMessage[]>(`/chat/messages`, { params: { mode, teamId } });
            if (res.data && Array.isArray(res.data)) {
                return res.data.filter(m => !isSampleMessage(m.content));
            }
        } catch (err) {
            console.warn("Backend chat API un-reachable, using local fallback storage:", err);
        }

        // Offline / Fallback storage
        const storageKey = mode === 'ai' ? "kl2stu_chat_ai_messages" : (teamId ? `kl2stu_chat_team_messages_${teamId}` : "kl2stu_chat_team_messages");
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed: ChatMessage[] = JSON.parse(stored);
                const clean = parsed.filter(m => !isSampleMessage(m.content));
                if (clean.length !== parsed.length) {
                    localStorage.setItem(storageKey, JSON.stringify(clean));
                }
                return clean;
            } catch { /* ignore */ }
        }
        localStorage.setItem(storageKey, JSON.stringify([]));
        return [];
    },

    async sendMessage(mode: 'ai' | 'team', content: string, teamId?: string): Promise<{ userMsg: ChatMessage; replyMsg?: ChatMessage }> {
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        let senderName = "Tôi";
        try {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                const u = JSON.parse(stored);
                if (u?.fullName) senderName = u.fullName;
            }
        } catch { /* ignore */ }

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: senderName,
            role: "user",
            content: content.trim(),
            timestamp
        };

        try {
            const res = await api.post<{ userMsg: ChatMessage; replyMsg?: ChatMessage }>(`/chat/messages`, { mode, content, sender: senderName, teamId });
            if (res.data?.userMsg) {
                return res.data;
            }
        } catch (err) {
            console.warn("Backend send message API un-reachable, using simulated response:", err);
        }

        // Fallback logic for offline mode
        const existing = await this.getMessages(mode, teamId);
        const updated = [...existing, userMsg];

        let replyMsg: ChatMessage | undefined;

        if (mode === 'ai') {
            const aiContent = this.generateAiResponse(content);
            replyMsg = {
                id: `ai-${Date.now()}`,
                sender: "Trợ lý AI",
                role: "ai",
                content: aiContent,
                timestamp
            };
            updated.push(replyMsg);
        }

        const storageKey = mode === 'ai' ? "kl2stu_chat_ai_messages" : (teamId ? `kl2stu_chat_team_messages_${teamId}` : "kl2stu_chat_team_messages");
        localStorage.setItem(storageKey, JSON.stringify(updated));

        return { userMsg, replyMsg };
    },

    async clearChat(mode: 'ai' | 'team', teamId?: string): Promise<void> {
        try {
            await api.delete(`/chat/messages`, { params: { mode, teamId } });
        } catch (err) {
            console.warn("Backend clear chat API un-reachable:", err);
        }
        const storageKey = mode === 'ai' ? "kl2stu_chat_ai_messages" : (teamId ? `kl2stu_chat_team_messages_${teamId}` : "kl2stu_chat_team_messages");
        localStorage.setItem(storageKey, JSON.stringify([]));
    },

    async setTypingStatus(teamId: string, sender: string): Promise<void> {
        try {
            await api.post(`/chat/typing`, null, { params: { teamId, sender } });
        } catch (err) {
            // ignore
        }
    },

    async getTypingStatus(teamId: string, currentUser: string): Promise<{typing: boolean, sender?: string}> {
        try {
            const res = await api.get(`/chat/typing`, { params: { teamId, currentUser } });
            if (res.data) return res.data;
        } catch (err) {
            // ignore
        }
        return { typing: false };
    },


    generateAiResponse(query: string): string {
        const q = query.toLowerCase();
        if (q.includes("tóm tắt") || q.includes("tài liệu")) {
            return "Hệ thống hiện đang quản lý các loại tài liệu PDF, Word, Excel, Ghi chú và Media. Bạn có thể xem chi tiết từng thư mục ở thanh Menu bên trái.";
        }
        if (q.includes("họp") || q.includes("meeting")) {
            return "Bạn có 1 cuộc họp sắp tới vào lúc 15:30 chiều nay: 'Thảo luận kế hoạch bảo trì hệ thống'. Link tham gia đã được đính kèm trong mục Cuộc họp.";
        }
        if (q.includes("đội ngũ") || q.includes("nhân sự") || q.includes("thành viên")) {
            return "Đội ngũ dự án gồm 12 thành viên thuộc các nhóm Frontend, Backend và Q&A. Hãy truy cập mục 'Danh sách tài khoản' để phân quyền chi tiết.";
        }
        if (q.includes("hướng dẫn") || q.includes("dùng")) {
            return "Để tải lên tài liệu mới, nhấn nút 'Tải tệp lên' ở thanh tiêu đề (Header). Bạn cũng có thể dùng thanh tìm kiếm thông minh để tra cứu tài liệu nhanh chóng!";
        }
        return `Tôi đã nhận được yêu cầu "${query}". Tôi sẵn sàng giúp bạn quản lý công việc và tra cứu thông tin nhanh chóng trên hệ thống KL2StU.`;
    }
};
