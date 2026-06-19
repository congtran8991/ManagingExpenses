import axios from 'axios';
import { STORAGE_KEYS, HTTP_STATUS } from '@/constants';
import { authActions } from '@/features/auth/store/useAuthStore';

export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
            authActions.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);