// File: src/Store/userApi.ts
import { UserResponse, UserHistoryResponse } from '../types';
import { request, padNameForBackend } from './apiClient';

export type { UserResponse, UserHistoryResponse };

export const userApi = {
  // Lấy thông tin của chính User đang đăng nhập (GET /users/my-info)
  getMyInfo: async (): Promise<UserResponse> => {
    const res = await request<UserResponse>('/users/my-info', { method: 'GET' });
    if (!res.result) throw new Error('Không thể tải thông tin tài khoản.');
    return res.result;
  },

  // Lấy toàn bộ danh sách Users dành cho Staff (GET /users/all)
  getAllUsers: async (): Promise<UserResponse[]> =>
    (await request<UserResponse[]>('/users/all', { method: 'GET' })).result || [],

  // Lấy thông tin User theo ID (GET /users/{userId})
  getUserById: async (userId: number): Promise<UserResponse> => {
    const res = await request<UserResponse>(`/users/${userId}`, { method: 'GET' });
    if (!res.result) throw new Error('Không tìm thấy người dùng.');
    return res.result;
  },

  // Đăng ký / Tạo mới User (POST /users/register)
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

  // Chỉnh sửa thông tin User (POST /users/update/{userId})
  updateUser: async (
    userId: number,
    payload: { firstName: string; lastName: string; email: string; phone: string; avatarPath?: string | null }
  ): Promise<UserResponse> => {
    const res = await request<UserResponse>(`/users/update/${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        avatarPath: payload.avatarPath || null,
      }),
    });
    if (!res.result) throw new Error(res.message || 'Cập nhật thông tin thất bại.');
    return res.result;
  },

  // Xóa User (DELETE /users/{userId})
  deleteUser: async (userId: number): Promise<void> => {
    await request<void>(`/users/${userId}`, { method: 'DELETE' });
  },

  // Xem toàn bộ lịch sử của User (GET /users/history/{userId})
  getUserHistory: async (userId: number): Promise<UserHistoryResponse> => {
    const res = await request<UserHistoryResponse>(`/users/history/${userId}`, { method: 'GET' });
    return (
      res.result || {
        contracts: [],
        payments: [],
        accidents: [],
        punishments: [],
        compensations: [],
      }
    );
  },
};