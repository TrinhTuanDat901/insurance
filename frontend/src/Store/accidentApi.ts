// File: src/Store/accidentApi.ts
import { request } from './apiClient';

export const accidentApi = {
  reportAccident: async (payload: {
    contractId: number;
    accidentDate: string;
    location: string;
    description: string;
  }) => {
    const res = await request<any>('/accidents/report', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.result;
  },

  updateAccident: async (
    accidentId: number,
    payload: {
      accidentDate: string;
      location: string;
      description: string;
    }
  ) => {
    const res = await request<any>(`/accidents/update/${accidentId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.result;
  },

  deleteAccident: async (accidentId: number): Promise<void> => {
    await request<void>(`/accidents/${accidentId}`, {
      method: 'DELETE',
    });
  },
};