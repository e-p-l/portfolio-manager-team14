import { apiClient } from './apiClient';
import { Asset } from '../types';

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  day_changeP: number;
}

export interface AssetHistoryEntry {
  id: number;
  asset_id: number;
  asset_symbol: string;
  price: number;
  date: string; // ISO date string
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

  // Get asset price history
  static async getAssetHistory(assetId: number): Promise<AssetHistoryEntry[]> {
    return apiClient.get<AssetHistoryEntry[]>(`/assets/${assetId}/history`);
  }
}

export default AssetService;
