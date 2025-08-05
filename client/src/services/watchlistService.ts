import { WatchlistItem, CreateWatchlistRequest } from '../types';
import { apiClient } from './apiClient';

export class WatchlistService {
  private static baseUrl = '/watchlist';

  // Get all watchlist items for a portfolio
  static async getWatchlistByPortfolio(portfolioId: number): Promise<WatchlistItem[]> {
    try {
      return await apiClient.get(`${this.baseUrl}/portfolio/${portfolioId}`);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  }

  // Add an asset to watchlist
  static async addToWatchlist(portfolioId: number, request: CreateWatchlistRequest): Promise<WatchlistItem> {
    try {
      return await apiClient.post(`${this.baseUrl}/portfolio/${portfolioId}`, request);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  // Remove an asset from watchlist by portfolio ID and asset ID (preferred method)
  static async removeFromWatchlist(portfolioId: number, assetId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/portfolio/${portfolioId}/asset/${assetId}`);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  // Remove an asset from watchlist by portfolio ID and asset ID (alternative method name)
  static async removeFromWatchlistByAsset(portfolioId: number, assetId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/portfolio/${portfolioId}/asset/${assetId}`);
    } catch (error) {
      console.error('Error removing asset from watchlist:', error);
      throw error;
    }
  }

  // Get a specific watchlist item
  static async getWatchlistItem(watchlistId: number): Promise<WatchlistItem> {
    try {
      return await apiClient.get(`${this.baseUrl}/${watchlistId}`);
    } catch (error) {
      console.error('Error fetching watchlist item:', error);
      throw error;
    }
  }

}
