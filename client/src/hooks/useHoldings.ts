import { useState, useEffect, useCallback, useMemo } from 'react';
import { HoldingService, Holding } from '../services/holdingService';
import { TransactionService } from '../services/transactionService';
import { Asset } from '../types';
import { formatAssetType } from '../utils/assetTypeFormatter';

export const useHoldings = (portfolioId: number) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldings = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

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
        current_price: holding.current_price,
        asset_return: holding.asset_return
      }));

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
      const rawAssetType = holding.asset_type || 'OTHER';
      
      // Normalize asset type to avoid duplicates (e.g., 'EQUITY' and 'equity' should be the same)
      const normalizedAssetType = rawAssetType.toUpperCase();
      
      totalValue += value;
      sectorMap[sector] = (sectorMap[sector] || 0) + value;
      assetTypeMap[normalizedAssetType] = (assetTypeMap[normalizedAssetType] || 0) + value;
    });

    // Color mappings - Comprehensive yfinance sector coverage
    const sectorColors: { [key: string]: string } = {
      // Technology Sectors
      'Technology': '#8b5cf6',
      'Communication Services': '#ec4899',
      
      // Healthcare Sectors
      'Healthcare': '#06b6d4',
      
      // Financial Sectors
      'Financial Services': '#10b981',
      'Financial': '#10b981',
      
      // Consumer Sectors
      'Consumer Cyclical': '#f59e0b',
      'Consumer Defensive': '#fbbf24',
      'Consumer Discretionary': '#f59e0b',
      'Consumer Staples': '#fbbf24',
      'Consumer': '#f59e0b', // fallback for generic consumer
      
      // Energy & Utilities
      'Energy': '#ef4444',
      'Utilities': '#14b8a6',
      
      // Industrial & Materials
      'Industrials': '#84cc16',
      'Basic Materials': '#f97316',
      'Materials': '#f97316',
      
      // Real Estate
      'Real Estate': '#a855f7',
      
      // ETF & Fund Categories
      'ETF': '#6366f1',
      'N/A': '#9ca3af', // For ETFs or funds without specific sector
      
      // Additional Sectors
      'Aerospace & Defense': '#7c3aed',
      'Airlines': '#3b82f6',
      'Auto Manufacturers': '#ef4444',
      'Banks': '#059669',
      'Biotechnology': '#0ea5e9',
      'Broadcasting': '#db2777',
      'Building Materials': '#ea580c',
      'Capital Markets': '#16a34a',
      'Chemicals': '#fb923c',
      'Commercial Services': '#8b5cf6',
      'Conglomerates': '#6b7280',
      'Construction': '#a3a3a3',
      'Credit Services': '#22c55e',
      'Drug Manufacturers': '#06b6d4',
      'Education': '#8b5cf6',
      'Electronic Gaming & Multimedia': '#7c3aed',
      'Electronics & Computer Distribution': '#6366f1',
      'Engineering & Construction': '#84cc16',
      'Entertainment': '#ec4899',
      'Farm Products': '#65a30d',
      'Food Distribution': '#f59e0b',
      'Grocery Stores': '#fbbf24',
      'Insurance': '#0891b2',
      'Internet Content & Information': '#8b5cf6',
      'Internet Retail': '#f59e0b',
      'Investment Managers': '#10b981',
      'Medical Care Facilities': '#06b6d4',
      'Medical Devices': '#0ea5e9',
      'Medical Instruments & Supplies': '#0891b2',
      'Metal Fabrication': '#f97316',
      'Mining': '#ea580c',
      'Oil & Gas Drilling': '#dc2626',
      'Oil & Gas E&P': '#ef4444',
      'Oil & Gas Equipment & Services': '#f87171',
      'Oil & Gas Integrated': '#dc2626',
      'Oil & Gas Midstream': '#ef4444',
      'Oil & Gas Refining & Marketing': '#f87171',
      'Packaged Foods': '#fbbf24',
      'Personal Services': '#8b5cf6',
      'Pharmaceuticals': '#06b6d4',
      'Professional Services': '#7c3aed',
      'REIT': '#a855f7',
      'Railroads': '#84cc16',
      'Recreational Vehicles': '#f59e0b',
      'Restaurants': '#fbbf24',
      'Retail': '#f59e0b',
      'Semiconductors': '#8b5cf6',
      'Software': '#7c3aed',
      'Specialty Chemicals': '#fb923c',
      'Specialty Retail': '#f59e0b',
      'Steel': '#6b7280',
      'Telecom Services': '#ec4899',
      'Tobacco': '#991b1b',
      'Transportation': '#84cc16',
      'Travel Services': '#3b82f6',
      'Trucking': '#65a30d',
      'Waste Management': '#22c55e',
      
      // Fallbacks
      'Other': '#6b7280',
      'Unknown': '#9ca3af'
    };

    const assetTypeColors: { [key: string]: string } = {
      // Lowercase keys for consistency
      equity: '#4a90e2',
      etf: '#50e3c2',
      stock: '#2f5b8dff',
      mutualfund: '#bd10e0',
      index: '#f5a623',
      currency: '#ff6b6b',
      cryptocurrency: '#ff9f43',
      bond: '#6c5ce7',
      cash: '#a0a0a0',
      other: '#636e72',
      // Uppercase versions for yfinance data
      'EQUITY': '#4a90e2',
      'ETF': '#50e3c2',
      'MUTUALFUND': '#bd10e0',
      'CURRENCY': '#ff6b6b',
      'CRYPTOCURRENCY': '#ff9f43',
      'INDEX': '#f5a623',
      'BOND': '#6c5ce7',
      'COMMODITY': '#8b5cf6',
      'OPTION': '#06b6d4',
      'FUTURE': '#10b981',
      'OTHER': '#636e72'
    };

    // Calculate sector allocation
    const sectorAllocation = Object.entries(sectorMap).map(([sector, value]) => ({
      name: sector,
      value: Math.round((value / totalValue) * 100),
      color: sectorColors[sector] || sectorColors.Other
    })).sort((a, b) => b.value - a.value);

    // Calculate asset class allocation
    const assetClassAllocation = Object.entries(assetTypeMap).map(([normalizedType, value]) => ({
      name: formatAssetType(normalizedType),
      value: Math.round((value / totalValue) * 100),
      color: assetTypeColors[normalizedType] || assetTypeColors[normalizedType.toLowerCase()] || assetTypeColors.other
    })).sort((a, b) => b.value - a.value);

    // Calculate top performers based on asset_return
    const topPerformers = holdings
      .filter(holding => holding.asset_return !== null && holding.asset_return !== undefined)
      .sort((a, b) => (b.asset_return || 0) - (a.asset_return || 0))
      .slice(0, 5);

    return {
      sectorAllocation,
      assetClassAllocation,
      topPerformers,
      totalValue
    };
  }, [holdings]);

  // Add holding function - now uses TransactionService
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
      
      // Use TransactionService for buying
      const transaction = await TransactionService.buyAsset(portfolioId, selectedAsset, quantity);
      
      // Refresh holdings data
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

  // Remove/sell holding function - now uses TransactionService
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
      
      // Use TransactionService for selling
      await TransactionService.sellHolding(portfolioId, holdingId, holding.asset_id, quantity);
      
      // Refresh holdings data
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
