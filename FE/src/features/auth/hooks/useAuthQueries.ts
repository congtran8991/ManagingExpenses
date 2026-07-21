import { useMutation } from '@tanstack/react-query';
import { authActions } from '../store/useAuthStore';
import { APIManager } from '@/apis/clients/axiosClient';
import { API_ENDPOINTS } from '@/constants';
import type { LoginResponse } from '@auth';

export const useLoginMutation = () => {
  return useMutation<LoginResponse, unknown, any>({
    mutationFn: async (body) => {
      const res = await APIManager.request({
        method: 'POST',
        url: API_ENDPOINTS.AUTH.LOGIN,
        body,
      });

      return res.data?.data;
    },
    onSuccess: (data) => {
      authActions.setLoginSuccess(data);
    },
  });
};
