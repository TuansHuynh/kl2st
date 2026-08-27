import api from '../api/api';
import type { Document } from '../types';

export const documentService = {
    async getAllDocuments(type?: string, authorId?: string): Promise<Document[]> {
        const params: Record<string, string> = {};
        if (type && type !== 'all') params.type = type;
        if (authorId) params.authorId = authorId;
        const res = await api.get<Document[]>('/documents', { params });
        return res.data;
    },

    async getDocumentById(id: string): Promise<Document> {
        const res = await api.get<Document>(`/documents/${id}`);
        return res.data;
    },

    async createDocument(data: Partial<Document>): Promise<Document> {
        const res = await api.post<Document>('/documents', data);
        return res.data;
    },

    async uploadDocument(file: File, metadata: Record<string, string | number | boolean | string[] | undefined>): Promise<Document> {
        const formData = new FormData();
        formData.append('file', file);
        Object.entries(metadata).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => formData.append(key, v));
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        const res = await api.post<Document>('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    async deleteDocument(id: string): Promise<void> {
        await api.delete(`/documents/${id}`);
    },

    async downloadDocument(id: string): Promise<Blob> {
        const res = await api.get(`/documents/download/${id}`, { responseType: 'blob' });
        return res.data;
    },

    async extractDocumentText(id: string): Promise<string> {
        const res = await api.get(`/documents/text/${id}`);
        return res.data;
    },
};
