import api from '../api/api';
import type { Team } from '../types';

export interface TeamRequest {
    name: string;
    description?: string;
    leaderId?: string;
    status?: string;
    color?: string;
    projectCount?: number;
    memberIds?: string[];
}

export const teamService = {
    async getAllTeams(): Promise<Team[]> {
        const res = await api.get<Team[]>('/teams');
        return res.data;
    },

    async getTeamById(id: string): Promise<Team> {
        const res = await api.get<Team>(`/teams/${id}`);
        return res.data;
    },

    async createTeam(data: TeamRequest): Promise<Team> {
        const res = await api.post<Team>('/teams', data);
        return res.data;
    },

    async updateTeam(id: string, data: TeamRequest): Promise<Team> {
        const res = await api.put<Team>(`/teams/${id}`, data);
        return res.data;
    },

    async deleteTeam(id: string): Promise<void> {
        await api.delete(`/teams/${id}`);
    },

    async addMember(teamId: string, userId: string): Promise<Team> {
        const res = await api.post<Team>(`/teams/${teamId}/members`, null, { params: { userId } });
        return res.data;
    },

    async removeMember(teamId: string, userId: string): Promise<Team> {
        const res = await api.delete<Team>(`/teams/${teamId}/members/${userId}`);
        return res.data;
    },
};
