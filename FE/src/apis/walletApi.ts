import { axiosClient } from './clients/axiosClient';
import type { Wallet } from './financeApi';


export const walletApi = {
    getAll: (): Promise<Wallet[]> => axiosClient.get('/v1/wallets'),
    create: (name: string, balance: number): Promise<Wallet> =>
        axiosClient.post('/v1/wallets', { name, balance }),
    update: (id: number, name: string): Promise<Wallet> =>
        axiosClient.put(`/v1/wallets/${id}`, { name }),
    delete: (id: number): Promise<void> => axiosClient.delete(`/v1/wallets/${id}`),
};