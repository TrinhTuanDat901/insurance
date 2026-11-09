// File: src/Store/apiClient.ts
import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const TokenStorage = {
  getToken: (): string | null => localStorage.getItem('mims_access_token'),
  setToken: (token: string) => localStorage.setItem('mims_access_token', token),
  clearToken: () => localStorage.removeItem('mims_access_token'),
};

export function decodeJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function padNameForBackend(firstName: string, lastName: string) {
  return {
    firstName: firstName.trim().padEnd(5, ' '),
    lastName: lastName.trim().padEnd(5, ' '),
  };
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = TokenStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Lỗi kết nối máy chủ (HTTP ${response.status})`);
  }
  return data;
}

// Re-export toàn bộ API và Types để tránh lỗi import ở mọi file UI
export * from './authClient';
export * from './userApi';
export * from './contractApi';
export * from './compensationApi';
export type {
  UserResponse,
  ContractResponse,
  CompensationResponse,
} from '../types';