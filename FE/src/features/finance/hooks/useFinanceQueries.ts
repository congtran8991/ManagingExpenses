import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/apis/financeApi';
import { QUERY_KEYS } from '@/constants';

export const useGetWallets = () => useQuery({ queryKey: [QUERY_KEYS.WALLETS], queryFn: financeApi.getWallets });
export const useGetJars = (id: number) => useQuery({ queryKey: [QUERY_KEYS.JARS, id], queryFn: () => financeApi.getJarsByPeriod(id), enabled: !!id });
export const useGetTransactions = () => useQuery({ queryKey: [QUERY_KEYS.TRANSACTIONS], queryFn: financeApi.getTransactions });
export const useGetSavingsGoals = () => useQuery({ queryKey: [QUERY_KEYS.SAVINGS_GOALS], queryFn: financeApi.getSavingsGoals });

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: financeApi.createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLETS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JARS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
        }
    });
};

export const useAllocateFund = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => financeApi.allocateFund(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLETS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JARS, id] });
        }
    });
};

export const useDepositSavings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: { id: number; wallet_id: number; amount: number }) => financeApi.depositSavings(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLETS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SAVINGS_GOALS] });
        }
    });
};