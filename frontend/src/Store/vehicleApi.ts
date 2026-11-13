// File: src/Store/vehicleApi.ts
import { request } from './apiClient';

export interface VehicleResponse {
  vehicleId: number;
  vehicleName: string;
  plateNumber: string;
  brandName: string;
  categoryName: string;
  engineNumber: string;
  chassisNumber: string;
  manufactureYear: number;
  hasActiveInsurance: boolean;
  activeCardNumber: string | null;
}

export const vehicleApi = {
  getMyVehicles: async (): Promise<VehicleResponse[]> =>
    (await request<VehicleResponse[]>('/vehicles/my-vehicles', { method: 'GET' })).result || [],

  addVehicle: async (payload: {
    vehicleName: string;
    plateNumber: string;
    brandId: number;
    categoryId: number;
    engineNumber: string;
    chassisNumber: string;
    manufactureYear: number;
  }): Promise<VehicleResponse> => {
    const res = await request<VehicleResponse>('/vehicles/add', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.result) throw new Error('Không thể thêm phương tiện.');
    return res.result;
  },
};