import { useState, useEffect, useCallback } from 'react';
import { HoldingService, Holding } from '../services/holdingService';
import { Asset } from '../types';

export const useHoldings = (portfolioId: number) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await HoldingService.getHoldingsByPortfolio(portfolioId);
      setHoldings(data);
    } catch (err) {
      console.error('Error fetching holdings:', err);
      setError('Failed to load holdings');
      // Fallback data for development
      setHoldings([
        { 
          id: 1, 
          portfolio_id: portfolioId, 
          asset_id: 1, 
          asset_name: 'Apple Inc.', 
          asset_symbol: 'AAPL',
          asset_type: 'equity',
          asset_sector: 'Technology',
          quantity: 10, 
          purchase_price: 150.00,
          current_price: 175.25
        },
        { 
          id: 2, 
          portfolio_id: portfolioId, 
          asset_id: 2, 
          asset_name: 'Microsoft Corporation', 
          asset_symbol: 'MSFT',
          asset_type: 'equity',
          asset_sector: 'Technology',
          quantity: 5, 
          purchase_price: 280.50,
          current_price: 310.75
        },
        { 
          id: 3, 
          portfolio_id: portfolioId, 
          asset_id: 3, 
          asset_name: 'Vanguard S&P 500 ETF', 
          asset_symbol: 'VOO',
          asset_type: 'etf',
          asset_sector: 'ETF',
          quantity: 3, 
          purchase_price: 380.20,
          current_price: 410.30
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  // Add holding function - uses the selected asset directly
  // Add holding function - now uses transaction API
  const addHolding = useCallback(async (selectedAsset: Asset, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate that we have a proper asset object
      if (!selectedAsset || !selectedAsset.symbol) {
        throw new Error('Please select a valid asset');
      }
      
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      // Use transaction API for buying
      const response = await fetch('/api/transactions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          asset_id: selectedAsset.id,
          quantity: quantity,
          transaction_type: 'buy'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to buy holding');
      }
      
      const transaction = await response.json();
      
      // Refresh holdings to show updated data
      await fetchHoldings();
      return transaction;
    } catch (err) {
      console.error('Error adding holding:', err);
      setError(err instanceof Error ? err.message : 'Failed to add holding');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [portfolioId, fetchHoldings]);

  // Remove/sell holding function
  // Remove/sell holding function - now uses transaction API
  const removeHolding = useCallback(async (holdingId: number, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const holding = holdings.find(h => h.id === holdingId);
      if (!holding) {
        throw new Error('Holding not found');
      }
      
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      if (quantity > holding.quantity) {
        throw new Error(`Cannot sell ${quantity} shares. You only own ${holding.quantity} shares.`);
      }
      
      // Use transaction API instead of direct holding manipulation
      const response = await fetch('/api/transactions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          holding_id: holdingId,
          quantity: quantity,
          transaction_type: 'sell'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sell holding');
      }
      
      // Refresh holdings to show updated data
      await fetchHoldings();
    } catch (err) {
      console.error('Error removing holding:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove holding');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [holdings, fetchHoldings, portfolioId]);

  useEffect(() => {
    if (portfolioId) {
      fetchHoldings();
    }
  }, [portfolioId, fetchHoldings]);

  return { 
    holdings, 
    loading, 
    error, 
    addHolding, 
    removeHolding, 
    refreshHoldings: fetchHoldings 
  };
};