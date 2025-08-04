import { useState, useEffect } from 'react';
import { PortfolioService, PortfolioHistoryEntry } from '../services/portfolioService';

export interface PortfolioValue {
  date: string; // ISO string format
  value: number;
}

export const usePortfolioHistory = (portfolioId: number) => {
  const [historyData, setHistoryData] = useState<PortfolioValue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!portfolioId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await PortfolioService.getPortfolioHistory(portfolioId);
        
        // Transform backend data to frontend format
        const transformedData: PortfolioValue[] = data.map((entry: PortfolioHistoryEntry) => ({
          date: entry.date,
          value: entry.value
        }));
        
        setHistoryData(transformedData);
      } catch (err) {
        console.error('Error fetching portfolio history:', err);
        setError('Failed to fetch portfolio history');
        
        // Fallback to mock data for development
        setHistoryData(generateFallbackData());
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [portfolioId]);

  return { historyData, loading, error };
};

// Fallback mock data generator (same as original component)
const generateFallbackData = (): PortfolioValue[] => {
  const baseValue = 10000; // $100,000 starting value
  const today = new Date();
  const startDate = new Date(today.getTime() - (2 * 365 * 24 * 60 * 60 * 1000)); // 2 years ago
  const data: PortfolioValue[] = [];
  
  // Generate daily data for 2 years
  let currentDate = new Date(startDate);
  let currentValue = baseValue;
  const volatility = 0.005; // Daily volatility
  const annualGrowth = 0.12; // 12% annual growth
  const dailyGrowth = Math.pow(1 + annualGrowth, 1/365) - 1;
  
  while (currentDate <= today) {
    // Add some randomness to create realistic market movements
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
    // Apply daily growth trend
    const growthFactor = 1 + dailyGrowth;
    
    currentValue = currentValue * randomFactor * growthFactor;
    
    // Add some market corrections and rallies
    // Major correction around 6 months ago
    const monthsAgo = (today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsAgo >= 5.9 && monthsAgo <= 6.1) {
      currentValue = currentValue * 0.92; // 8% drop
    }
    
    // Rally 3 months ago
    if (monthsAgo >= 2.9 && monthsAgo <= 3.1) {
      currentValue = currentValue * 1.07; // 7% rally
    }
    
    data.push({
      date: currentDate.toISOString(),
      value: Math.round(currentValue * 100) / 100 // Round to 2 decimal places
    });
    
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
  }
  
  return data;
};
