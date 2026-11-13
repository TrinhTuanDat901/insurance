// File: src/Store/compensationApi.ts
import { CompensationResponse } from '../types';
import { request } from './apiClient';

export type { CompensationResponse };

export const compensationApi = {
  getMyCompensations: async (): Promise<CompensationResponse[]> =>
    (await request<CompensationResponse[]>('/compensations/my-compensations', { method: 'GET' })).result || [],

  requestCompensation: async (payload: {
    contractId: number;
    userId: number;
    requestedAmount: number;
    description: string;
  }): Promise<CompensationResponse> => {
    const res = await request<CompensationResponse>('/compensations/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.result) throw new Error('Gửi yêu cầu bồi thường thất bại.');
    return res.result;
  },

  viewAllCompensations: async (status?: string): Promise<CompensationResponse[]> => {
    const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return (await request<CompensationResponse[]>(`/compensations/all${query}`, { method: 'GET' })).result || [];
  },

  viewCompensationDetail: async (compensationId: number): Promise<CompensationResponse> => {
    const res = await request<CompensationResponse>(`/compensations/${compensationId}`, { method: 'GET' });
    if (!res.result) throw new Error('Không tìm thấy hồ sơ bồi thường.');
    return res.result;
  },

  resolveCompensation: async (
    compensationId: number,
    payload: { approvedAmount: number; description?: string; userId?: number; contractId?: number }
  ): Promise<CompensationResponse> => {
    const res = await request<CompensationResponse>(`/compensations/resolve/${compensationId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.result) throw new Error(res.message || 'Phê duyệt bồi thường thất bại.');
    return res.result;
  },

  rejectCompensation: async (
    compensationId: number,
    payload: { description?: string; userId?: number; contractId?: number }
  ): Promise<CompensationResponse> => {
    const res = await request<CompensationResponse>(`/compensations/reject/${compensationId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.result) throw new Error(res.message || 'Từ chối bồi thường thất bại.');
    return res.result;
  },

  deleteCompensation: async (compensationId: number): Promise<void> => {
    await request<void>(`/compensations/${compensationId}`, { method: 'DELETE' });
  },
};