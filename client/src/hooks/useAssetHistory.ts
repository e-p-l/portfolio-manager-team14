import { useState, useEffect } from 'react';
import { AssetService, AssetHistoryEntry } from '../services/assetService';

export interface AssetValue {
  date: string; // ISO string format
  value: number; // Using "value" to match PortfolioValue interface
}

export const useAssetHistory = (assetId: number | null) => {
  const [historyData, setHistoryData] = useState<AssetValue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!assetId) {
        setHistoryData([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const data = await AssetService.getAssetHistory(assetId);
        
        // Transform backend data to frontend format (price -> value to match portfolio interface)
        const transformedData: AssetValue[] = data.map((entry: AssetHistoryEntry) => ({
          date: entry.date,
          value: entry.price
        }));
        
        setHistoryData(transformedData);
      } catch (err) {
        console.error('Error fetching asset history:', err);
        setError('Failed to fetch asset history');
        
        // No fallback data for assets - just empty array
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [assetId]);

  return { historyData, loading, error };
};
