import { useState, useEffect, useCallback } from 'react';
import { WatchlistService } from '../services/watchlistService';
import { WatchlistItem, CreateWatchlistRequest } from '../types';

export const useWatchlist = (portfolioId: number) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const data = await WatchlistService.getWatchlistByPortfolio(portfolioId);
      setWatchlist(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      setError('Failed to load watchlist');
      // Fallback data for development
      setWatchlist([
        {
          id: 1,
          portfolio_id: portfolioId,
          asset_id: 1,
          asset_symbol: 'NVDA',
          asset_name: 'NVIDIA Corporation',
          asset_type: 'equity',
          asset_sector: 'Technology',
          added_date: new Date().toISOString(),
          current_price: 875.50,
          day_changeP: 2.45,
          day_change: 20.90,
          notes: 'AI leader with strong growth potential'
        },
        {
          id: 2,
          portfolio_id: portfolioId,
          asset_id: 2,
          asset_symbol: 'TSLA',
          asset_name: 'Tesla, Inc.',
          asset_type: 'equity',
          asset_sector: 'Consumer Cyclical',
          added_date: new Date().toISOString(),
          current_price: 245.80,
          day_changeP: -1.20,
          day_change: -2.98,
          notes: 'EV market leader'
        },
        {
          id: 3,
          portfolio_id: portfolioId,
          asset_id: 3,
          asset_symbol: 'GOOGL',
          asset_name: 'Alphabet Inc.',
          asset_type: 'equity',
          asset_sector: 'Communication Services',
          added_date: new Date().toISOString(),
          current_price: 142.30,
          day_changeP: 0.85,
          day_change: 1.20,
          notes: 'Search and cloud dominance'
        },
        {
          id: 4,
          portfolio_id: portfolioId,
          asset_id: 4,
          asset_symbol: 'AMZN',
          asset_name: 'Amazon.com, Inc.',
          asset_type: 'equity',
          asset_sector: 'Consumer Cyclical',
          added_date: new Date().toISOString(),
          current_price: 158.90,
          day_changeP: 1.75,
          day_change: 2.73,
          notes: 'E-commerce and AWS growth'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  // Add asset to watchlist
  const addToWatchlist = useCallback(async (request: CreateWatchlistRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const newItem = await WatchlistService.addToWatchlist(portfolioId, request);
      
      // Refresh watchlist to show updated data
      await fetchWatchlist();
      return newItem;
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to watchlist');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [portfolioId, fetchWatchlist]);

  // Remove asset from watchlist
  const removeFromWatchlist = useCallback(async (watchlistId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await WatchlistService.removeFromWatchlist(watchlistId);
      
      // Remove from local state immediately for better UX
      setWatchlist(prev => prev.filter(item => item.id !== watchlistId));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove from watchlist');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove asset from watchlist by asset ID
  const removeFromWatchlistByAsset = useCallback(async (assetId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await WatchlistService.removeFromWatchlistByAsset(portfolioId, assetId);
      
      // Remove from local state immediately for better UX
      setWatchlist(prev => prev.filter(item => item.asset_id !== assetId));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove from watchlist');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  // Update watchlist notes
  const updateWatchlistNotes = useCallback(async (watchlistId: number, notes: string) => {
    try {
      setError(null);
      
      const updatedItem = await WatchlistService.updateWatchlistNotes(watchlistId, { notes });
      
      // Update local state
      setWatchlist(prev => prev.map(item => 
        item.id === watchlistId ? { ...item, notes: updatedItem.notes } : item
      ));
      
      return updatedItem;
    } catch (err) {
      console.error('Error updating watchlist notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notes');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (portfolioId) {
      fetchWatchlist();
    }
  }, [portfolioId, fetchWatchlist]);

  return { 
    watchlist, 
    loading, 
    error, 
    addToWatchlist, 
    removeFromWatchlist,
    removeFromWatchlistByAsset,
    updateWatchlistNotes,
    refreshWatchlist: fetchWatchlist 
  };
};
