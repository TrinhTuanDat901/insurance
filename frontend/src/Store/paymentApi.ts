// File: src/Store/paymentApi.ts
import { request } from './apiClient';

export const paymentApi = {
  createPayment: async (payload: {
    contractId: number;
    paymentMethod: 'BANK_TRANSFER' | 'CARD' | 'E_WALLET';
  }) => {
    const res = await request<any>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.result;
  },
};