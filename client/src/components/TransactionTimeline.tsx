import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, SwapHoriz } from '@mui/icons-material';

interface Transaction {
  id: number;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  symbol: string;
  amount: number;
  date: string;
  shares?: number;
  price?: number;
}

interface TransactionTimelineProps {
  transactions?: Transaction[];
  title?: string;
}

// Mock data that's easily replaceable
const defaultMockTransactions: Transaction[] = [
  { id: 1, type: 'BUY', symbol: 'AAPL', amount: 5000, date: '2024-07-28', shares: 26, price: 192.31 },
  { id: 2, type: 'SELL', symbol: 'GOOGL', amount: 3200, date: '2024-07-25', shares: 12, price: 266.67 },
  { id: 3, type: 'BUY', symbol: 'MSFT', amount: 4100, date: '2024-07-22', shares: 10, price: 410.00 },
  { id: 4, type: 'BUY', symbol: 'TSLA', amount: 2800, date: '2024-07-20', shares: 11, price: 254.55 },
  { id: 5, type: 'SELL', symbol: 'AMZN', amount: 1500, date: '2024-07-18', shares: 8, price: 187.50 },
  { id: 6, type: 'TRANSFER', symbol: 'CASH', amount: 2000, date: '2024-07-15', shares: undefined, price: undefined },
  { id: 7, type: 'BUY', symbol: 'NVDA', amount: 6200, date: '2024-07-12', shares: 15, price: 413.33 },
  { id: 8, type: 'SELL', symbol: 'META', amount: 2900, date: '2024-07-10', shares: 7, price: 414.29 },
];

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ 
  transactions = defaultMockTransactions,
  title = "Transaction History"
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'BUY': return <TrendingUp sx={{ fontSize: 16 }} />;
      case 'SELL': return <TrendingDown sx={{ fontSize: 16 }} />;
      case 'TRANSFER': return <SwapHoriz sx={{ fontSize: 16 }} />;
      default: return <TrendingUp sx={{ fontSize: 16 }} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUY': return '#4caf50';
      case 'SELL': return '#f44336';
      case 'TRANSFER': return '#ff9800';
      default: return '#4caf50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {transactions.map((transaction, index) => (
            <Box
              key={transaction.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                p: 2,
                borderRadius: '12px',
                background: transaction.type === 'BUY' 
                  ? 'linear-gradient(90deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
                  : transaction.type === 'SELL'
                  ? 'linear-gradient(90deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)'
                  : 'linear-gradient(90deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                border: `1px solid ${
                  transaction.type === 'BUY' 
                    ? 'rgba(76, 175, 80, 0.2)' 
                    : transaction.type === 'SELL'
                    ? 'rgba(244, 67, 54, 0.2)'
                    : 'rgba(255, 152, 0, 0.2)'
                }`,
                position: 'relative'
              }}
            >
              {/* Timeline connector */}
              {index !== transactions.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: '24px',
                    bottom: '-16px',
                    width: '2px',
                    height: '16px',
                    backgroundColor: '#e0e0e0'
                  }}
                />
              )}

              {/* Icon */}
              <Box
                sx={{
                  mr: 2,
                  p: 1,
                  borderRadius: '50%',
                  backgroundColor: getTypeColor(transaction.type),
                  color: 'white'
                }}
              >
                {getIcon(transaction.type)}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Chip 
                    label={transaction.type}
                    size="small"
                    color={
                      transaction.type === 'BUY' 
                        ? 'success' 
                        : transaction.type === 'SELL'
                        ? 'error'
                        : 'warning'
                    }
                    variant="outlined"
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {transaction.symbol}
                  </Typography>
                  {transaction.shares && (
                    <Typography variant="body2" color="textSecondary">
                      {transaction.shares} shares
                    </Typography>
                  )}
                  {transaction.price && (
                    <Typography variant="body2" color="textSecondary">
                      @ ${transaction.price}
                    </Typography>
                  )}
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="textSecondary">
                    {formatDate(transaction.date)}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {transaction.type === 'SELL' ? '-' : '+'}${transaction.amount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionTimeline;