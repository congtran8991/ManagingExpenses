import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { STORAGE_KEYS, HTTP_STATUS } from '@/constants';
import { authActions } from '@/features/auth/store/useAuthStore';
import { v4 as uuidv4 } from 'uuid';

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

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
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

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      authActions.logout();
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
      url: '/auth/me', // Hoặc đường dẫn API lấy profile của bạn
      method: 'GET',
      showError: false, // Tắt thông báo lỗi đỏ của toast tại đây vì ta sẽ xử lý riêng khi F5
    });
  };

  /**
   * 🌊 2. THAY ĐỔI: Hàm requestStream sử dụng FETCH thuần túy
   * Lấy cấu hình Token và Headers trực tiếp từ Axios Instance sang để không bị lệch cấu hình.
   */
}
