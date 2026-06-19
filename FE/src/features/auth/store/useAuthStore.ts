import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants';

interface AuthState {
    user: { id: number; username: string; email: string } | null;
    isAuthenticated: boolean;
}

export const useAuthStoreBase = create<AuthState>(() => ({
    user: null,
    isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
}));

export const useAuthUser = () => useAuthStoreBase((state) => state.user);
export const useIsAuthenticated = () => useAuthStoreBase((state) => state.isAuthenticated);

export const authActions = {
    setLoginSuccess: (user: any, token: string) => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        useAuthStoreBase.setState({ user, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        useAuthStoreBase.setState({ user: null, isAuthenticated: false });
    },
};