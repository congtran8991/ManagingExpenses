import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { STORAGE_KEYS, HTTP_STATUS, API_ENDPOINTS } from '@/constants';
import { authActions } from '@/features/auth/store/useAuthStore';
import { v4 as uuidv4 } from 'uuid';
import StorageEnhance from '@/core/storage';

import qs from 'query-string';
import type { BaseResponse } from '@dto';
import { toast } from 'react-toastify';

interface IParams {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  configs?: AxiosRequestConfig;
  body?: any;
  showError?: boolean;
  showToast?: boolean;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean; // Khai báo thêm thuộc tính _retry để TypeScript không báo lỗi
}

interface IPromiseQueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    config.headers.set('X-Request-Id', uuidv4());
    config.headers.set('Accept-Language', 'vi-VN');

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: IPromiseQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  console.log(failedQueue, 'failedQueue');
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: CustomAxiosRequestConfig = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 🛑 Đánh chặn khi Server trả về lỗi 401 Unauthorized
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      // Nếu chính API /auth/refresh bị lỗi 401 -> Refresh Token đã hết hạn -> Logout ngay
      if (originalRequest.url?.includes('/v1/auth/refresh')) {
        authActions.logout();
        return Promise.reject(error);
      }

      // Trường hợp 1: Có một API khác ĐANG thực hiện xin Token mới dưới nền
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log(token, 'shvhshvshvhsh');
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Trường hợp 2: Bạn là API dính lỗi 401 ĐẦU TIÊN
      originalRequest._retry = true; // Khóa chốt, đánh dấu request này đã được sửa lỗi (tránh lặp vô hạn)
      isRefreshing = true; // Dựng cờ hiệu thông báo hệ thống đang bận refresh token

      try {
        const localUser = StorageEnhance.get(STORAGE_KEYS.USER);
        const refreshToken: string | undefined = StorageEnhance.get(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) throw new Error('No refresh token found');

        // Bắn API lên BE để xin cặp Token mới
        const res = await APIManager.refreshToken(refreshToken);

        console.log(res, 'shvhshvsh');

        if (!res.success) throw new Error('Refresh token failed');

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

        // Lưu thông tin Token mới vào Storage
        StorageEnhance.set(STORAGE_KEYS.USER, {
          ...localUser,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        console.log(newAccessToken, 'newAccessToken');

        // Kích hoạt tất cả các request đang xếp hàng trong Queue chạy lại
        processQueue(null, newAccessToken);

        // Cập nhật token mới cho chính request hiện tại và chạy lại nó
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh token cũng hết hạn/sai -> Buộc phải logout
        processQueue(refreshError, null);
        authActions.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export class APIManager {
  // Hàm private chạy ngầm phục vụ cho Axios request thông thường
  private static readonly executeRequest = async ({
    method = 'GET',
    url,
    configs,
    body,
  }: Omit<IParams, 'showError' | 'showToast'>) => {
    const m = method.toLowerCase();
    if (m === 'get' || m === 'delete') {
      const fullUrl = body ? `${url}?${qs.stringify(body)}` : url;
      return await axiosClient[m](fullUrl, configs);
    }

    return await axiosClient[m as 'post' | 'put' | 'patch'](url, body, configs);
  };

  /**
   * 🟢 1. KHÔNG ĐỔI: Hàm request thông thường sử dụng AXIOS
   */
  static readonly request = async <T = any>({
    method = 'GET',
    url,
    configs,
    body,
    showToast = false,
    showError = true,
  }: IParams): Promise<BaseResponse<T>> => {
    try {
      const res: AxiosResponse<any> = await this.executeRequest({ method, url, configs, body });

      if (!res?.data?.success) throw { ...res?.data, status: res.status };

      if (showToast) {
        toast.success(res.data.message);
      }
      return { data: res.data, success: true };
    } catch (e: any) {
      if (e?.name === 'CanceledError') throw e;

      const { response, message } = e || {};
      if (!response) {
        toast.error(message, { toastId: 'api-status-network' });
      } else {
        if (response.data?.code === 401) {
          toast.error('session_expired', { toastId: 'api-status-401' });
        } else if (showError) {
          toast.error(response.data?.message ?? 'something_went_wrong');
        }
      }
      return { data: undefined, success: false, error: e, eData: response?.data?.data };
    }
  };

  static getMe = async (): Promise<BaseResponse<any>> => {
    return await this.request({
      url: API_ENDPOINTS.AUTH.GET_ME, // Hoặc đường dẫn API lấy profile của bạn
      method: 'GET',
      showError: false, // Tắt thông báo lỗi đỏ của toast tại đây vì ta sẽ xử lý riêng khi F5
    });
  };

  static refreshToken = async (refreshToken: string): Promise<BaseResponse<any>> => {
    return await this.request({
      url: API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      method: 'POST',
      body: { refreshToken },
      showError: false,
    });
  };

  /**
   * 🌊 2. THAY ĐỔI: Hàm requestStream sử dụng FETCH thuần túy
   * Lấy cấu hình Token và Headers trực tiếp từ Axios Instance sang để không bị lệch cấu hình.
   */
}
