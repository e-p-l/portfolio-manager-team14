import { useState, useEffect } from 'react';
import { AssetService, MarketMover } from '../services/assetService';

export const useMarketMovers = () => {
  const [marketMovers, setMarketMovers] = useState<MarketMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketMovers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AssetService.getMarketMovers();
        setMarketMovers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market movers');
        console.error('Error fetching market movers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketMovers();
    
    // Refresh market movers every 30 seconds
    const interval = setInterval(fetchMarketMovers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { marketMovers, loading, error };
};

export default useMarketMovers;
