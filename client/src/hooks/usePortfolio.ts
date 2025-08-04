import { useState, useEffect } from 'react';
import { Portfolio } from '../types';
import { PortfolioService } from '../services/portfolioService';

const DEFAULT_PORTFOLIO_ID = 1;

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      // Use the existing getPortfolio method - it should return balance
      const data = await PortfolioService.getPortfolio(DEFAULT_PORTFOLIO_ID);
      setPortfolio(data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setPortfolio({ 
        id: DEFAULT_PORTFOLIO_ID, 
        name: 'Demo Portfolio',
        balance: 10000.0,
        user_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return { portfolio, loading, refetchPortfolio: fetchPortfolio };
};