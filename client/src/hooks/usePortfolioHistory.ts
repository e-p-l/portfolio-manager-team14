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

// Fallback mock data generator (NVIDIA-like growth pattern)
const generateFallbackData = (): PortfolioValue[] => {
  const baseValue = 100000; // $100,000 starting value
  const today = new Date();
  const startDate = new Date(today.getTime() - (3 * 365 * 24 * 60 * 60 * 1000)); // 3 years ago
  const data: PortfolioValue[] = [];
  
  // Generate daily data for 3 years
  let currentDate = new Date(startDate);
  let currentValue = baseValue;
  const volatility = 0.015; // Daily volatility (1.5%)
  const annualGrowth = 0.35; // Strong 35% annual growth (like NVIDIA/tech stocks)
  const dailyGrowth = Math.pow(1 + annualGrowth, 1/365) - 1;
  
  while (currentDate <= today) {
    // Base daily movement with strong upward bias (like NVIDIA)
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
    const growthFactor = 1 + dailyGrowth;
    
    currentValue = currentValue * randomFactor * growthFactor;
    
    // Add realistic spiky behavior - but favor upward moves
    const spikeChance = Math.random();
    
    // Sharp upward spike (like AI news, earnings beat) - 3% chance per day
    if (spikeChance > 0.97) {
      const upSpike = 1.08 + Math.random() * 0.15; // 8-23% sudden jump (like NVIDIA on AI news)
      currentValue = currentValue * upSpike;
    }
    // Sharp downward spike (like market fear, profit taking) - 1% chance per day
    else if (spikeChance < 0.01) {
      const downSpike = 0.82 - Math.random() * 0.10; // 8-18% sudden drop
      currentValue = currentValue * downSpike;
    }
    // Mini rallies (steady momentum) - 8% chance per day
    else if (spikeChance > 0.92) {
      const miniRally = 1.025 + Math.random() * 0.035; // 2.5-6% move up
      currentValue = currentValue * miniRally;
    }
    // Mini corrections (profit taking) - 3% chance per day
    else if (spikeChance < 0.03) {
      const miniCorrection = 0.94 - Math.random() * 0.04; // 2-6% move down
      currentValue = currentValue * miniCorrection;
    }
    
    // NVIDIA-like market events - only 2 major corrections but strong recoveries
    const daysAgo = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // EVENT 1: Tech selloff ~6 months ago (like when AI bubble fears hit)
    if (daysAgo >= 170 && daysAgo <= 185) {
      if (Math.random() > 0.85) { // 15% chance each day
        const correctionSpike = 0.75 - Math.random() * 0.15; // Sharp 10-25% drops
        currentValue = currentValue * correctionSpike;
      }
    }
    
    // Recovery from tech selloff - strong bounces (like NVIDIA always does)
    if (daysAgo >= 150 && daysAgo <= 169) {
      if (Math.random() > 0.75) { // 25% chance each day
        const recoverySpike = 1.10 + Math.random() * 0.15; // Sharp 10-25% recovery moves
        currentValue = currentValue * recoverySpike;
      }
    }
    
    // EVENT 2: COVID-like crash ~3 years ago - but NVIDIA recovered stronger
    if (daysAgo >= 1000 && daysAgo <= 1020) {
      if (Math.random() > 0.7) { // 30% chance each day
        if (Math.random() > 0.7) { // 30% are recovery bounces
          const bounceSpike = 1.12 + Math.random() * 0.18; // Sharp 12-30% bounce
          currentValue = currentValue * bounceSpike;
        } else { // 70% are drops during crash
          const crashSpike = 0.70 - Math.random() * 0.20; // Sharp 10-30% drops
          currentValue = currentValue * crashSpike;
        }
      }
    }
    
    // Post-crash EXPLOSIVE recovery (like NVIDIA post-COVID)
    if (daysAgo >= 950 && daysAgo <= 999) {
      if (Math.random() > 0.6) { // 40% chance each day - frequent explosive moves
        const explosiveRecovery = 1.15 + Math.random() * 0.20; // 15-35% rocket moves
        currentValue = currentValue * explosiveRecovery;
      }
    }
    
    // Quarterly earnings-like behavior (NVIDIA always beats expectations)
    const month = currentDate.getMonth() + 1;
    const dayOfMonth = currentDate.getDate();
    
    // Earnings volatility - but NVIDIA usually rockets after earnings
    if (dayOfMonth >= 25 && dayOfMonth <= 31 && [2, 5, 8, 11].includes(month)) {
      if (Math.random() > 0.80) { // 20% chance during earnings season
        const earningsMove = Math.random() > 0.75 
          ? 1.12 + Math.random() * 0.18  // Usually great earnings: 12-30% rocket
          : 0.88 - Math.random() * 0.08; // Rare miss: 4-12% drop
        currentValue = currentValue * earningsMove;
      }
    }
    
    // Ensure strong floor - NVIDIA rarely stays down long
    const minValue = baseValue * 0.80; // Never below 80% of starting value
    if (currentValue < minValue) {
      currentValue = minValue * (1.05 + Math.random() * 0.15); // Strong bounce back 5-20%
    }
    
    // Reasonable ceiling for 3-year period (300-400% growth is realistic for tech)
    const maxValue = baseValue * 4.0; // Up to 400% of starting value
    if (currentValue > maxValue) {
      currentValue = maxValue * (0.90 + Math.random() * 0.05); // Small pullback
    }
    
    data.push({
      date: currentDate.toISOString(),
      value: Math.round(currentValue * 100) / 100 // Round to 2 decimal places
    });
    
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
  }
  
  return data;
};
