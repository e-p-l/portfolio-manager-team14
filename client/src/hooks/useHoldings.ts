import { useState, useEffect, useCallback } from 'react';
import { HoldingService, Holding } from '../services/holdingService';
import { AssetService } from '../services/assetService';

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

  // Add holding function
  const addHolding = useCallback(async (assetSymbol: string, quantity: number) => {
    try {
      setLoading(true);
      
      // First, search for the asset by symbol
      const assets = await AssetService.searchAssets(assetSymbol);
      if (assets.length === 0) {
        throw new Error(`Asset with symbol "${assetSymbol}" not found`);
      }
      
      const asset = assets[0]; // Take the first match
      
      // Create holding with current market price
      const newHolding = await HoldingService.createHolding(
        portfolioId,
        asset.id,
        quantity,
        asset.current_price || 0 // Use current market price
      );
      
      // Refresh holdings
      await fetchHoldings();
      return newHolding;
    } catch (err) {
      console.error('Error adding holding:', err);
      throw err;
    }
  }, [portfolioId, fetchHoldings]);

  // Remove/sell holding function
  const removeHolding = useCallback(async (holdingId: number, quantity: number) => {
    try {
      setLoading(true);
      
      const holding = holdings.find(h => h.id === holdingId);
      if (!holding) {
        throw new Error('Holding not found');
      }
      
      if (quantity >= holding.quantity) {
        // Delete entire holding
        await HoldingService.deleteHolding(holdingId);
      } else {
        // Update quantity
        await HoldingService.updateHolding(holdingId, {
          quantity: holding.quantity - quantity
        });
      }
      
      // Refresh holdings
      await fetchHoldings();
    } catch (err) {
      console.error('Error removing holding:', err);
      throw err;
    }
  }, [holdings, fetchHoldings]);

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