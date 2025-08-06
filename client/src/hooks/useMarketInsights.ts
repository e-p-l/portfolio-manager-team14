import { useState, useEffect } from 'react';
import { InsightsService, MarketInsight } from '../services/insightsService';

export const useMarketInsights = () => {
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await InsightsService.getMarketInsights();
        setMarketInsights(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market insights');
        console.error('Error fetching market insights:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketInsights();
  }, []);

  const refetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await InsightsService.getMarketInsights();
      setMarketInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market insights');
      console.error('Error fetching market insights:', err);
    } finally {
      setLoading(false);
    }
  };

  return { marketInsights, loading, error, refetchInsights };
};

export default useMarketInsights;
