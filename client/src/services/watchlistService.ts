import { WatchlistItem, CreateWatchlistRequest, UpdateWatchlistRequest } from '../types';
import { apiClient } from './apiClient';

export class WatchlistService {
  private static baseUrl = '/watchlist';

  // Get all watchlist items for a portfolio
  static async getWatchlistByPortfolio(portfolioId: number): Promise<WatchlistItem[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/portfolio/${portfolioId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  }

  // Add an asset to watchlist
  static async addToWatchlist(portfolioId: number, request: CreateWatchlistRequest): Promise<WatchlistItem> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/portfolio/${portfolioId}`, request);
      return response.data;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  // Remove an asset from watchlist by watchlist item ID
  static async removeFromWatchlist(watchlistId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${watchlistId}`);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  // Remove an asset from watchlist by portfolio ID and asset ID
  static async removeFromWatchlistByAsset(portfolioId: number, assetId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/portfolio/${portfolioId}/asset/${assetId}`);
    } catch (error) {
      console.error('Error removing asset from watchlist:', error);
      throw error;
    }
  }

  // Update watchlist item notes
  static async updateWatchlistNotes(watchlistId: number, request: UpdateWatchlistRequest): Promise<WatchlistItem> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${watchlistId}`, request);
      return response.data;
    } catch (error) {
      console.error('Error updating watchlist notes:', error);
      throw error;
    }
  }

  // Get a specific watchlist item
  static async getWatchlistItem(watchlistId: number): Promise<WatchlistItem> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${watchlistId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching watchlist item:', error);
      throw error;
    }
  }

  // Get all watchlist items (admin function)
  static async getAllWatchlistItems(): Promise<WatchlistItem[]> {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching all watchlist items:', error);
      throw error;
    }
  }
}
