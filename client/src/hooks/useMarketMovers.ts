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
  }, []);

  return { marketMovers, loading, error };
};

export default useMarketMovers;
