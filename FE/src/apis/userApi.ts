import { axiosClient } from './clients/axiosClient';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export const userApi = {
  getProfile: (): Promise<UserProfile> => axiosClient.get('/v1/users/profile'),
  updateProfile: (data: Partial<UserProfile>): Promise<UserProfile> =>
    axiosClient.put('/v1/users/profile', data),
};
