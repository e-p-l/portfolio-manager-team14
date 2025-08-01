import { useState, useEffect } from 'react';
import { HoldingService, Holding } from '../services/holdingService';

export const useHoldings = (portfolioId: number) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHoldings = async () => {
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
            quantity: 3, 
            purchase_price: 380.20,
            current_price: 410.30
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (portfolioId) {
      fetchHoldings();
    }
  }, [portfolioId]);

  return { holdings, loading, error };
};