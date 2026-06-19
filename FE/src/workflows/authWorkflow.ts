import { authActions } from '@/features/auth';

export const handlePostLoginWorkflow = async (user: unknown, token: string) => {
    // Điều phối: Lưu token đăng nhập -> tự động kích hoạt chuyển hướng
    authActions.setLoginSuccess(user, token);
};