import { apiClient } from './apiClient';

export interface Asset {
  id?: number; // Optional - backend can assign if needed
  symbol: string;
  name: string;
  current_price?: number;
  asset_type?: string;
  sector?: string;
  day_changeP?: number;
}

export interface Holding {
  id: number;
  portfolio_id: number;
  asset_id: number;
  asset_name?: string;
  asset_symbol?: string;
  asset_type?: string;
  asset_sector?: string;
  quantity: number;
  purchase_price: number;
  current_price?: number;
  asset_return?: number;
}

export class HoldingService {
  static async getHoldings(): Promise<Holding[]> {
    const response = await apiClient.get<Holding[]>('/holdings/');
    return response;
  }

  static async getHolding(id: number): Promise<Holding> {
    const response = await apiClient.get<Holding>(`/holdings/${id}`);
    return response;
  }

  static async getHoldingsByPortfolio(portfolioId: number): Promise<Holding[]> {
    const response = await apiClient.get<Holding[]>(`/holdings/portfolio/${portfolioId}`);
    return response;
  }

  static async createHolding(portfolioId: number, asset: Asset, quantity: number): Promise<Holding> {
    const response = await apiClient.post<Holding>('/holdings/', {
      portfolio_id: portfolioId,
      asset: asset, // Send the entire asset object to the backend
      quantity: quantity
      // Backend will extract asset_id and use current_price as purchase_price
    });
    return response;
  }

  static async updateHolding(id: number, data: { quantity?: number; purchase_price?: number }): Promise<Holding> {
    const response = await apiClient.put<Holding>(`/holdings/${id}`, data);
    return response;
  }

  static async deleteHolding(id: number): Promise<void> {
    await apiClient.delete(`/holdings/${id}`);
  }
}