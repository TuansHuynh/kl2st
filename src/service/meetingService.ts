import api from '../api/api';
import type { Meeting } from '../types';

export interface MeetingRequest {
    title: string;
    description?: string;
    meetingDate: string;
    meetingTime: string;
    duration?: string;
    organizerId?: string;
    status?: string;
    type?: string;
    room?: string;
    link?: string;
    participantIds?: string[];
    coOrganizerIds?: string[];
}

export const meetingService = {
    async getAllMeetings(): Promise<Meeting[]> {
        const res = await api.get<Meeting[]>('/meetings');
        return res.data;
    },

    async getMeetingById(id: string): Promise<Meeting> {
        const res = await api.get<Meeting>(`/meetings/${id}`);
        return res.data;
    },

    async createMeeting(data: MeetingRequest): Promise<Meeting> {
        const res = await api.post<Meeting>('/meetings', data);
        return res.data;
    },

    async updateMeeting(id: string, data: MeetingRequest): Promise<Meeting> {
        const res = await api.put<Meeting>(`/meetings/${id}`, data);
        return res.data;
    },

    async deleteMeeting(id: string): Promise<void> {
        await api.delete(`/meetings/${id}`);
    },
};
