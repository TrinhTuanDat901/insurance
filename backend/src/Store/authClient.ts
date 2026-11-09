// File: src/Store/authClient.ts
import { UserAccount } from '../types';
import { request, TokenStorage, decodeJwt } from './apiClient';

export const authApi = {
  login: async (email: string, password: string): Promise<UserAccount> => {
    const res = await request<{ token: string; authenticated: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const token = res.result!.token;
    TokenStorage.setToken(token);
    const decoded = decodeJwt(token);
    const isStaff = decoded?.scope?.includes('ROLE_STAFF') ?? false;

    return {
      id: decoded?.jti || `usr_${Date.now()}`,
      email: decoded?.sub || email,
      fullName: isStaff ? 'Chuyên viên Nghiệp vụ' : email.split('@')[0],
      phone: '0903 128 456',
      role: isStaff ? 'STAFF' : 'CUSTOMER',
      membershipTier: isStaff ? 'PLATINUM' : 'GOLD',
    };
  },

  logout: async (): Promise<void> => {
    const token = TokenStorage.getToken();
    if (token) {
      await request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }).catch(() => {});
    }
    TokenStorage.clearToken();
  },

  introspect: async (token: string): Promise<boolean> => {
    try {
      const res = await request<{ valid: boolean }>('/auth/introspect', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      return !!res.result?.valid;
    } catch {
      return false;
    }
  },
};