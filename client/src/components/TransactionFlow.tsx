import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioHistory } from '../hooks/usePortfolioHistory';
import { useTransactions } from '../hooks/useTransactions';

interface TransactionFlowProps {
  portfolioId?: number;
}

const DEFAULT_PORTFOLIO_ID = 1;

const TransactionFlow: React.FC<TransactionFlowProps> = ({ portfolioId = DEFAULT_PORTFOLIO_ID }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  // Get the number of days based on selected period
  const getDaysBack = (period: string) => {
    switch (period) {
      case '30d': return 30;
      case '1y': return 365;
      case 'all': return 1095; // 3 years
      default: return 30;
    }
  };

  const daysBack = getDaysBack(selectedPeriod);
  const { portfolio, loading: loadingPortfolio } = usePortfolio();
  const { historyData, loading: loadingHistory } = usePortfolioHistory(portfolioId);
  const { transactions, loading: loadingTransactions } = useTransactions(portfolioId);

  // Calculate cash flow: current balance - historical balance
  const calculateCashFlow = () => {
    if (!portfolio || !historyData.length) {
      return 0;
    }

    const currentBalance = portfolio.balance;
    
    // Find historical balance from the specified days back
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    // Find the closest historical entry to our cutoff date
    const historicalEntry = historyData.find(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoffDate;
    });
    
    const historicalBalance = historicalEntry ? historicalEntry.value * 0.1 : currentBalance; // 10% as cash balance
    
    return currentBalance - historicalBalance;
  };

  // Calculate transaction flow from real transaction data
  const calculateTransactionFlow = () => {
    if (!transactions.length) {
      return { totalInflow: 0, totalOutflow: 0 };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    let totalInflow = 0;
    let totalOutflow = 0;

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.created_at);
      
      if (transactionDate >= cutoffDate) {
        const amount = transaction.quantity * transaction.price;
        
        if (transaction.transaction_type === 'buy') {
          totalOutflow += amount; // Money going out to buy assets
        } else if (transaction.transaction_type === 'sell') {
          totalInflow += amount; // Money coming in from selling assets
        }
      }
    });

    return { totalInflow, totalOutflow };
  };

  const { totalInflow, totalOutflow } = calculateTransactionFlow();
  const netFlow = calculateCashFlow(); // Use simple cash flow calculation
  const totalVolume = totalInflow + totalOutflow;

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '30d': return 'Last 30 Days';
      case '1y': return 'Last Year';
      case 'all': return 'All Time';
      default: return 'Last 30 Days';
    }
  };

  const loading = loadingPortfolio || loadingHistory || loadingTransactions;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Transaction Flow
          </Typography>
          
          {/* Period Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              displayEmpty
            >
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Summary */}
        <Box mb={3}>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <Typography variant="h4" color="primary" fontWeight="bold">
                ${netFlow.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Net Cash Flow ({getPeriodLabel(selectedPeriod)})
              </Typography>
            </>
          )}
        </Box>

        {/* Flow Visualization */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Inflow */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderRadius: '12px',
              background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.05) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${(totalInflow / totalVolume) * 100}%`,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderRadius: '12px'
              }}
            />
            <TrendingUp sx={{ mr: 2, color: '#4caf50', zIndex: 1 }} />
            <Box sx={{ zIndex: 1, flex: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                Money In
              </Typography>
              <Typography variant="h6" color="#4caf50">
                +${totalInflow.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" color="#4caf50" sx={{ zIndex: 1 }}>
              {((totalInflow / totalVolume) * 100).toFixed(1)}%
            </Typography>
          </Box>

          {/* Outflow */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderRadius: '12px',
              background: 'linear-gradient(90deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.05) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${(totalOutflow / totalVolume) * 100}%`,
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                borderRadius: '12px'
              }}
            />
            <TrendingDown sx={{ mr: 2, color: '#f44336', zIndex: 1 }} />
            <Box sx={{ zIndex: 1, flex: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                Money Out
              </Typography>
              <Typography variant="h6" color="#f44336">
                -${totalOutflow.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" color="#f44336" sx={{ zIndex: 1 }}>
              {((totalOutflow / totalVolume) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionFlow;