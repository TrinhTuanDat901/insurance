// File: src/Store/historyApi.ts
import { UserHistoryResponse } from '../types/index';
import { request } from './apiClient';

export const historyApi = {
  getMyHistory: async (): Promise<UserHistoryResponse> => {
    const res = await request<UserHistoryResponse>('/users/my-history', {
      method: 'GET',
    });
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