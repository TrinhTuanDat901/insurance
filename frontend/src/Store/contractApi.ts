// File: src/Store/contractApi.ts
import { ContractResponse } from '../types';
import { request } from './apiClient';

export type { ContractResponse };

export const contractApi = {
  getMyContracts: async (): Promise<ContractResponse[]> =>
    (await request<ContractResponse[]>('/contracts/my-contracts', { method: 'GET' })).result || [],

  viewAllContracts: async (): Promise<ContractResponse[]> =>
    (await request<ContractResponse[]>('/contracts/all', { method: 'GET' })).result || [],

  viewContractDetail: async (contractId: number): Promise<ContractResponse> => {
    const res = await request<ContractResponse>(`/contracts/${contractId}`, { method: 'GET' });
    if (!res.result) throw new Error('Không tìm thấy chi tiết hợp đồng.');
    return res.result;
  },

  createContract: async (payload: {
    userId: number;
    vehicleId: number;
    packageId: number;
    startDate: string;
    endDate: string;
    status?: string;
  }): Promise<ContractResponse> => {
    const res = await request<ContractResponse>('/contracts/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.result) throw new Error(res.message || 'Tạo hợp đồng thất bại.');
    return res.result;
  },

  updateContract: async (
    contractId: number,
    payload: {
      packageId?: number;
      startDate?: string;
      endDate?: string;
      premiumAmount?: number;
    }
  ): Promise<ContractResponse> => {
    const res = await request<ContractResponse>(`/contracts/update/${contractId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.result) throw new Error(res.message || 'Cập nhật hợp đồng thất bại.');
    return res.result;
  },

  activeContract: async (contractId: number): Promise<ContractResponse> => {
    const res = await request<ContractResponse>(`/contracts/active/${contractId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'ACTIVE' }),
    });
    if (!res.result) throw new Error(res.message || 'Kích hoạt hợp đồng thất bại.');
    return res.result;
  },

  renewContract: async (
    contractId: number,
    payload: { startDate: string; endDate: string; packageId?: number }
  ): Promise<ContractResponse> => {
    const res = await request<ContractResponse>(`/contracts/renew/${contractId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.result) throw new Error(res.message || 'Gia hạn hợp đồng thất bại.');
    return res.result;
  },

  cancelContract: async (contractId: number, cancelReason: string): Promise<ContractResponse> => {
    const res = await request<ContractResponse>(`/contracts/cancel/${contractId}`, {
      method: 'PUT',
      body: JSON.stringify({ cancelReason }),
    });
    if (!res.result) throw new Error(res.message || 'Hủy hợp đồng thất bại.');
    return res.result;
  },
};