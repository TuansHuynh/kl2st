import api from '../api/api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const res = await api.post<AuthResponse>('/auth/login', data);
        return res.data;
    },

    async register(data: RegisterRequest): Promise<User> {
        const res = await api.post<User>('/auth/register', data);
        return res.data;
    },

    async verifyAccount(email: string): Promise<string> {
        const res = await api.post<string>('/auth/verify', { email });
        return res.data;
    },

    async verifyOtp(email: string, otp: string): Promise<string> {
        const res = await api.post<string>('/auth/verify-otp', { email, otp });
        return res.data;
    },

    async recoverPassword(data: { email: string; password?: string }): Promise<string> {
        const res = await api.post<string>('/auth/recover', data);
        return res.data;
    },
};
