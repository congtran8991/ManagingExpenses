import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants';
import StorageEnhance from '@/core/storage';

interface AuthState {
  user: { id: number; username: string; email: string } | null;
  setUser: (v: any) => void;
  clearAuth: () => void;
}

export const useAuthStoreBase = create<AuthState>((set) => ({
  user: StorageEnhance.get(STORAGE_KEYS.USER) as AuthState['user'],
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null }),
}));

export const useAuthUser = () => useAuthStoreBase((state) => state.user);

export const authActions = {
  setLoginSuccess: (user: AuthState['user'], token: string) => {
    StorageEnhance.set(STORAGE_KEYS.ACCESS_TOKEN, token);
    StorageEnhance.set(STORAGE_KEYS.USER, user);
    useAuthStoreBase.setState({ user });
  },
  logout: () => {
    StorageEnhance.clear();
    useAuthStoreBase.setState({ user: null });
  },
};
