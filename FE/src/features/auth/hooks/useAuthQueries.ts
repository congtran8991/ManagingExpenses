import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/apis/authApi';
import { authActions } from '../store/useAuthStore';

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            authActions.setLoginSuccess(data.user, data.accessToken);
        },
    });
};