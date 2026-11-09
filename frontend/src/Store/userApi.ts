// File: src/Store/userApi.ts
import { UserResponse } from '../types';
import { request, padNameForBackend } from './apiClient';

export type { UserResponse };

export const userApi = {
  getAllUsers: async (): Promise<UserResponse[]> =>
    (await request<UserResponse[]>('/users/all', { method: 'GET' })).result || [],

  getUserById: async (userId: number): Promise<UserResponse> => {
    const res = await request<UserResponse>(`/users/${userId}`, { method: 'GET' });
    if (!res.result) throw new Error('Không tìm thấy người dùng.');
    return res.result;
  },

  register: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<UserResponse> => {
    const padded = padNameForBackend(payload.firstName, payload.lastName);
    const res = await request<UserResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: padded.firstName,
        lastName: padded.lastName,
        email: payload.email.trim(),
        password: payload.password,
        phone: payload.phone?.trim() || '',
        avatarPath: null,
      }),
    });
    if (!res.result) throw new Error(res.message || 'Không thể tạo khách hàng.');
    return res.result;
  },

  updateUser: async (
    userId: number,
    payload: { firstName: string; lastName: string; email: string; phone: string }
  ): Promise<UserResponse> => {
    const res = await request<UserResponse>(`/users/update/${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        avatarPath: null,
      }),
    });
    if (!res.result) throw new Error(res.message || 'Cập nhật thất bại.');
    return res.result;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await request<void>(`/users/${userId}`, { method: 'DELETE' });
  },
};