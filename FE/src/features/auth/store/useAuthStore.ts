import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants';
import StorageEnhance from '@/core/storage';
import type { LoginResponse } from '@auth';

interface AuthState {
  user: { id: number; username: string; email: string } | null;
  setUser: (v: any) => void;
  clearAuth: () => void;
}

export const useAuthStoreBase = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null }),
}));

export const useAuthUser = () => useAuthStoreBase((state) => state.user);

export const authActions = {
  setLoginSuccess: (dataLogin: LoginResponse) => {
    StorageEnhance.set(STORAGE_KEYS.ACCESS_TOKEN, dataLogin.accessToken);
    StorageEnhance.set(STORAGE_KEYS.REFRESH_TOKEN, dataLogin.refreshToken);
    StorageEnhance.set(STORAGE_KEYS.USER, dataLogin.user);
    useAuthStoreBase.setState({ user: dataLogin.user });
  },
  logout: () => {
    StorageEnhance.clear();
    useAuthStoreBase.setState({ user: null });
  },
};
