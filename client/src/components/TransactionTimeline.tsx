import React, { useState, useMemo, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  List,
  ListItem,
  Avatar,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  SwapHoriz,
  AccessTime 
} from '@mui/icons-material';
import { useTransactions } from '../hooks/useTransactions';

interface TransactionTimelineProps {
  portfolioId?: number;
  title?: string;
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
}

const DEFAULT_PORTFOLIO_ID = 1;

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ 
  portfolioId = DEFAULT_PORTFOLIO_ID,
  title = "Transaction History",
  selectedPeriod: externalPeriod,
  onPeriodChange
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(externalPeriod || '30d');
  const { transactions: allTransactions, loading, error } = useTransactions(portfolioId);

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

  // Filter transactions based on selected period
  const transactions = useMemo(() => {
    const getDaysBack = (period: string) => {
      switch (period) {
        case '30d': return 30;
        case '1y': return 365;
        case 'all': return 1095; // 3 years
        default: return 30;
      }
    };

    if (!allTransactions.length) {
      return [];
    }

    if (selectedPeriod === 'all') {
      return allTransactions;
    }

    const daysBack = getDaysBack(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      return transactionDate >= cutoffDate;
    });
  }, [allTransactions, selectedPeriod]);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '30d': return 'Last 30 Days';
      case '1y': return 'Last Year';
      case 'all': return 'All Time';
      default: return 'Last 30 Days';
    }
  };
  const getIcon = (transactionType: string) => {
    switch (transactionType.toLowerCase()) {
      case 'buy': return <TrendingDown sx={{ fontSize: 16 }} />;
      case 'sell': return <TrendingUp sx={{ fontSize: 16 }} />;
      default: return <SwapHoriz sx={{ fontSize: 16 }} />;
    }
  };

  const getTypeColor = (transactionType: string) => {
    switch (transactionType.toLowerCase()) {
      case 'buy': return '#f44336';
      case 'sell': return '#4caf50';
      default: return '#ff9800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box display="flex" justifyContent="center" py={4}>
            <Typography color="error">{error}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {title}
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

        {/* Filter Info */}
        <Box mb={2}>
          <Typography variant="body2" color="textSecondary">
            Showing {transactions.length} transactions ({getPeriodLabel(selectedPeriod)})
          </Typography>
        </Box>

        {/* Timeline List */}
        <List sx={{ p: 0 }}>
          {transactions.map((transaction, index) => {
            const transactionAmount = Math.round((transaction.quantity * transaction.price) * 100) / 100;
            return (
            <React.Fragment key={transaction.id}>
              <ListItem sx={{ py: 2, px: 0 }}>
                {/* Timeline Avatar */}
                <Avatar
                  sx={{
                    backgroundColor: getTypeColor(transaction.transaction_type),
                    mr: 2,
                    width: 40,
                    height: 40
                  }}
                >
                  {getIcon(transaction.transaction_type)}
                </Avatar>

                {/* Transaction Content */}
                <Box sx={{ flex: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Chip 
                      label={transaction.transaction_type.toUpperCase()}
                      size="small"
                      color={
                        transaction.transaction_type === 'buy' 
                          ? 'error' 
                          : transaction.transaction_type === 'sell'
                          ? 'success'
                          : 'warning'
                      }
                      variant="filled"
                    />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {transaction.asset_symbol || 'Unknown Asset'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {transaction.quantity} shares
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      @ ${transaction.price.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(transaction.created_at)}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      color={transaction.transaction_type === 'sell' ? 'success.main' : 'error.main'}
                    >
                      {transaction.transaction_type === 'sell' ? '+' : '-'}${transactionAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
              
              {/* Divider between items (except for last item) */}
              {index < transactions.length - 1 && (
                <Divider variant="inset" component="li" sx={{ ml: 7 }} />
              )}
            </React.Fragment>
            );
          })}
        </List>

        {/* Empty state */}
        {transactions.length === 0 && (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            py={4}
          >
            <AccessTime sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              No transactions yet
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTimeline;