import { useState, useEffect, useCallback, useMemo } from 'react';
import { HoldingService, Holding } from '../services/holdingService';
import { Asset } from '../types';

// Global cache to share data across components
const holdingsCache = new Map<number, {
  data: Holding[];
  timestamp: number;
  loading: boolean;
}>();

const CACHE_DURATION = 30000; // 30 seconds cache

export const useHoldings = (portfolioId: number) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldings = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const cached = holdingsCache.get(portfolioId);
    
    // Use cache if available and not expired
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      setHoldings(cached.data);
      setLoading(cached.loading);
      return;
    }

    try {
      setLoading(true);
      
      // Update cache loading state
      holdingsCache.set(portfolioId, {
        data: cached?.data || [],
        timestamp: now,
        loading: true
      });

      const data = await HoldingService.getHoldingsByPortfolio(portfolioId);
      
      // Convert object to array if needed (backend returns object with symbols as keys)
      const holdingsArray = Array.isArray(data) ? data : Object.entries(data).map(([symbol, holding]: [string, any]) => ({
        id: holding.asset_id,
        portfolio_id: portfolioId,
        asset_id: holding.asset_id,
        asset_name: holding.asset_name,
        asset_symbol: holding.asset_symbol,
        asset_type: holding.asset_type,
        asset_sector: holding.asset_sector,
        quantity: holding.quantity,
        purchase_price: holding.purchase_price || holding.current_price,
        current_price: holding.current_price
      }));
      
      // Update cache
      holdingsCache.set(portfolioId, {
        data: holdingsArray,
        timestamp: now,
        loading: false
      });

      setHoldings(holdingsArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching holdings:', err);
      setError('Failed to load holdings');
      
      // Fallback data for development
      const fallbackData = [
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
      ];
      
      holdingsCache.set(portfolioId, {
        data: fallbackData,
        timestamp: now,
        loading: false
      });
      
      setHoldings(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  // Compute derived data with memoization
  const computedData = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return {
        sectorAllocation: [],
        assetClassAllocation: [],
        topPerformers: [],
        totalValue: 0
      };
    }

    const sectorMap: { [key: string]: number } = {};
    const assetTypeMap: { [key: string]: number } = {};
    let totalValue = 0;

    // Single pass through holdings to compute all derived data
    holdings.forEach(holding => {
      const currentPrice = holding.current_price || holding.purchase_price;
      const value = holding.quantity * currentPrice;
      const sector = holding.asset_sector || 'Other';
      const assetType = holding.asset_type || 'other';
      
      totalValue += value;
      sectorMap[sector] = (sectorMap[sector] || 0) + value;
      assetTypeMap[assetType] = (assetTypeMap[assetType] || 0) + value;
    });

    // Color mappings
    const sectorColors: { [key: string]: string } = {
      Technology: '#8b5cf6',
      Healthcare: '#06b6d4',
      Financial: '#10b981',
      Consumer: '#f59e0b',
      Energy: '#ef4444',
      ETF: '#6366f1',
      Communications: '#ec4899',
      Industrial: '#84cc16',
      Materials: '#f97316',
      Utilities: '#14b8a6',
      'Real Estate': '#a855f7',
      Other: '#6b7280'
    };

    const assetTypeColors: { [key: string]: string } = {
      equity: '#4a90e2',
      etf: '#50e3c2',
      stock: '#4a90e2',
      mutualfund: '#bd10e0',
      index: '#f5a623',
      currency: '#ff6b6b',
      cryptocurrency: '#ff9f43',
      bond: '#6c5ce7',
      cash: '#a0a0a0',
      other: '#636e72'
    };

    // Calculate sector allocation
    const sectorAllocation = Object.entries(sectorMap).map(([sector, value]) => ({
      name: sector,
      value: Math.round((value / totalValue) * 100),
      color: sectorColors[sector] || sectorColors.Other
    })).sort((a, b) => b.value - a.value);

    // Calculate asset class allocation
    const assetClassAllocation = Object.entries(assetTypeMap).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: Math.round((value / totalValue) * 100),
      color: assetTypeColors[type] || assetTypeColors.other
    })).sort((a, b) => b.value - a.value);

    // Calculate top performers
    const topPerformers = holdings
      .map(holding => ({
        ...holding,
        gainLossPercent: holding.current_price 
          ? ((holding.current_price - holding.purchase_price) / holding.purchase_price) * 100
          : 0
      }))
      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
      .slice(0, 5);

    return {
      sectorAllocation,
      assetClassAllocation,
      topPerformers,
      totalValue
    };
  }, [holdings]);

  // Add holding function
  const addHolding = useCallback(async (selectedAsset: Asset, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      
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
      
      // Clear cache to force refresh
      holdingsCache.delete(portfolioId);
      await fetchHoldings(true);
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
      
      // Clear cache to force refresh
      holdingsCache.delete(portfolioId);
      await fetchHoldings(true);
    } catch (err) {
      console.error('Error removing holding:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove holding');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [holdings, portfolioId, fetchHoldings]);

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
    refreshHoldings: fetchHoldings,
    // Pre-computed data
    sectorAllocation: computedData.sectorAllocation,
    assetClassAllocation: computedData.assetClassAllocation,
    topPerformers: computedData.topPerformers,
    totalValue: computedData.totalValue
  };
};
