// src/common/auth/checkAuth.ts

import { APIManager } from '@/apis/clients/axiosClient';
import { STORAGE_KEYS } from '@/constants';
import { useAuthStoreBase } from '@/features/auth';
import StorageEnhance from '@/core/storage';

export const checkAuthOnReload = async (): Promise<boolean> => {
  console.log('hvhshvhsvhsh');
  const accessToken = StorageEnhance.get(STORAGE_KEYS.ACCESS_TOKEN);

  // 1. Kiểm tra nhanh xem local có token không, nếu không có thì không cần gọi API mất thời gian
  if (!accessToken) {
    useAuthStoreBase.getState().clearAuth();
    return false;
  }

  try {
    // 2. Chủ động gọi API /me lên Backend để xác thực realtime và xin lại thông tin UI
    const res = await APIManager.getMe();

    if (res.success && res.data) {
      // 3. Hồi sinh (Hydrate) lại thông tin User vào RAM để vẽ giao diện (Tên, Avatar, Role)
      useAuthStoreBase.getState().setUser(res.data);
      return true; // Xác thực thành công
    }

    throw new Error('Xác thực thất bại');
  } catch (error) {
    console.log(error, ' error');
    // 4. Lỗi (Token hết hạn/bị sửa đổi) -> Xóa sạch dữ liệu cũ và trả về thất bại
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    useAuthStoreBase.getState().clearAuth();
    return false;
  }
};
