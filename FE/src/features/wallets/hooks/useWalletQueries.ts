import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/apis/walletApi';
import { QUERY_KEYS } from '@/constants';

export const useGetWallets = () =>
  useQuery({
    queryKey: [QUERY_KEYS.WALLETS],
    queryFn: walletApi.getAll,
  });

export const useCreateWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, balance }: { name: string; balance: number }) =>
      walletApi.create(name, balance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLETS] });
    },
  });
};

export const useDeleteWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLETS] });
    },
  });
};
