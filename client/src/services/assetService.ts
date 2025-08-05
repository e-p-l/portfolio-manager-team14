import { apiClient } from './apiClient';
import { Asset } from '../types';

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  day_changeP: number;
}

export class AssetService {
  // Get all assets
  static async getAllAssets(): Promise<Asset[]> {
    return apiClient.get<Asset[]>('/assets');
  }

  // Get a single asset by ID
  static async getAsset(id: number): Promise<Asset> {
    return apiClient.get<Asset>(`/assets/${id}`);
  }

  // Search assets by symbol
  static async searchAssets(query: string): Promise<Asset[]> {
    return apiClient.get<Asset[]>(`/assets/search?q=${encodeURIComponent(query)}`);
  }

  // Get market movers (top gainers and losers)
  static async getMarketMovers(): Promise<MarketMover[]> {
    return apiClient.get<MarketMover[]>('/assets/market_movers');
  }
}

export default AssetService;
