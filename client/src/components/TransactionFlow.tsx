import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { useTransactions } from '../hooks/useTransactions';

interface TransactionFlowProps {
  portfolioId?: number;
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
}

const DEFAULT_PORTFOLIO_ID = 1;

const TransactionFlow: React.FC<TransactionFlowProps> = ({ 
  portfolioId = DEFAULT_PORTFOLIO_ID,
  selectedPeriod: externalPeriod,
  onPeriodChange
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(externalPeriod || '30d');
  
  const { transactions, loading: loadingTransactions } = useTransactions(portfolioId);

  // Update internal state when external prop changes
  useEffect(() => {
    if (externalPeriod) {
      setSelectedPeriod(externalPeriod);
    }
  }, [externalPeriod]);

  // Handle period change - update both local state and notify parent
  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

  // Calculate transaction flow with useMemo for reactivity
  const { totalInflow, totalOutflow, netFlow, totalVolume } = useMemo(() => {
    const getDaysBack = (period: string) => {
      switch (period) {
        case '30d': return 30;
        case '1y': return 365;
        case 'all': return 1095; // 3 years
        default: return 30;
      }
    };

    if (!transactions.length) {
      return { totalInflow: 0, totalOutflow: 0, netFlow: 0, totalVolume: 0 };
    }

    const daysBack = getDaysBack(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    let totalInflow = 0;
    let totalOutflow = 0;

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.created_at);
      
      if (selectedPeriod === 'all' || transactionDate >= cutoffDate) {
        const amount = Math.round((transaction.quantity * transaction.price) * 100) / 100;
        
        if (transaction.transaction_type === 'buy') {
          totalOutflow += amount; // Purchases: money spent buying assets
        } else if (transaction.transaction_type === 'sell') {
          totalInflow += amount; // Sales: money received from selling assets
        }
      }
    });

    const netFlow = totalInflow - totalOutflow;
    const totalVolume = totalInflow + totalOutflow;

    return { totalInflow, totalOutflow, netFlow, totalVolume };
  }, [transactions, selectedPeriod]); // Dependencies: recalculate when these change

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '30d': return 'Last 30 Days';
      case '1y': return 'Last Year';
      case 'all': return 'All Time';
      default: return 'Last 30 Days';
    }
  };

  const loading = loadingTransactions;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Trading Activity
          </Typography>
          
          {/* Period Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
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
                Net Trading Activity ({getPeriodLabel(selectedPeriod)})
              </Typography>
            </>
          )}
        </Box>

        {/* Flow Visualization */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Sales */}
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
                width: `${totalVolume > 0 ? (totalInflow / totalVolume) * 100 : 0}%`,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderRadius: '12px'
              }}
            />
            <TrendingUp sx={{ mr: 2, color: '#4caf50', zIndex: 1 }} />
            <Box sx={{ zIndex: 1, flex: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                Sells
              </Typography>
              <Typography variant="h6" color="#4caf50">
                +${totalInflow.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" color="#4caf50" sx={{ zIndex: 1 }}>
              {totalVolume > 0 ? ((totalInflow / totalVolume) * 100).toFixed(1) : '0.0'}%
            </Typography>
          </Box>

          {/* Purchases */}
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
                width: `${totalVolume > 0 ? (totalOutflow / totalVolume) * 100 : 0}%`,
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                borderRadius: '12px'
              }}
            />
            <TrendingDown sx={{ mr: 2, color: '#f44336', zIndex: 1 }} />
            <Box sx={{ zIndex: 1, flex: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                Buys
              </Typography>
              <Typography variant="h6" color="#f44336">
                -${totalOutflow.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" color="#f44336" sx={{ zIndex: 1 }}>
              {totalVolume > 0 ? ((totalOutflow / totalVolume) * 100).toFixed(1) : '0.0'}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionFlow;