import { useState, useEffect } from 'react';
import { PortfolioService, Portfolio } from '../services';

export const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PortfolioService.getAllPortfolios();
      setPortfolios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios');
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async (portfolioData: { user_id: number; name: string; description?: string }) => {
    try {
      const newPortfolio = await PortfolioService.createPortfolio(portfolioData);
      setPortfolios(prev => [...prev, newPortfolio]);
      return newPortfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio');
      throw err;
    }
  };

  const updatePortfolio = async (id: number, updates: { name?: string; description?: string }) => {
    try {
      const updatedPortfolio = await PortfolioService.updatePortfolio(id, updates);
      setPortfolios(prev => 
        prev.map(portfolio => 
          portfolio.id === id ? updatedPortfolio : portfolio
        )
      );
      return updatedPortfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio');
      throw err;
    }
  };

  const deletePortfolio = async (id: number) => {
    try {
      await PortfolioService.deletePortfolio(id);
      setPortfolios(prev => prev.filter(portfolio => portfolio.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete portfolio');
      throw err;
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return {
    portfolios,
    loading,
    error,
    refetch: fetchPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  };
};
