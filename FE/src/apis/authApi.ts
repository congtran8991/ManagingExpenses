import { axiosClient } from './clients/axiosClient';
import { API_ENDPOINTS } from '@/constants';

export interface LoginResponse {
    user: { id: number; username: string; email: string };
    accessToken: string;
}

export const authApi = {
    login: (credentials: any): Promise<LoginResponse> => axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
    register: (data: any): Promise<void> => axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, data),
};