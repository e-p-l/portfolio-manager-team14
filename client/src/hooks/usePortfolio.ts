import { useState, useEffect } from 'react';
import { Portfolio } from '../types';
import { PortfolioService } from '../services/portfolioService';

// Default portfolio ID
const DEFAULT_PORTFOLIO_ID = 1;

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const data = await PortfolioService.getPortfolio(DEFAULT_PORTFOLIO_ID);
        setPortfolio(data);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        // Fallback for development
        setPortfolio({ 
          id: DEFAULT_PORTFOLIO_ID, 
          name: 'Demo Portfolio',
          user_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  return { portfolio, loading };
};
