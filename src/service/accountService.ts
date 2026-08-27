import api from '../api/api';
import type { User, UserSetting } from '../types';

export const accountService = {
    async getAllAccounts(): Promise<User[]> {
        const res = await api.get<User[]>('/accounts');
        return res.data;
    },

    async getAccountById(id: string): Promise<User> {
        const res = await api.get<User>(`/accounts/${id}`);
        return res.data;
    },

    async updateAccount(id: string, data: { fullName?: string; department?: string; status?: string; avatar?: string; role?: string }): Promise<User> {
        const res = await api.put<User>(`/accounts/${id}`, null, { params: data });
        return res.data;
    },

    async deleteAccount(id: string): Promise<void> {
        await api.delete(`/accounts/${id}`);
    },

    async getAccountSettings(id: string): Promise<UserSetting> {
        const res = await api.get<UserSetting>(`/accounts/${id}/settings`);
        return res.data;
    },

    async updateAccountSettings(id: string, data: UserSetting): Promise<UserSetting> {
        const res = await api.put<UserSetting>(`/accounts/${id}/settings`, data);
        return res.data;
    },
};
