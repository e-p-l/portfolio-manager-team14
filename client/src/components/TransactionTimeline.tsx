import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  List,
  ListItem,
  Avatar,
  Divider
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  SwapHoriz,
  AccessTime 
} from '@mui/icons-material';

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
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        {/* Timeline List */}
        <List sx={{ p: 0 }}>
          {transactions.map((transaction, index) => (
            <React.Fragment key={transaction.id}>
              <ListItem sx={{ py: 2, px: 0 }}>
                {/* Timeline Avatar */}
                <Avatar
                  sx={{
                    backgroundColor: getTypeColor(transaction.type),
                    mr: 2,
                    width: 40,
                    height: 40
                  }}
                >
                  {getIcon(transaction.type)}
                </Avatar>

                {/* Transaction Content */}
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
                      variant="filled"
                    />
                    <Typography variant="subtitle1" fontWeight="bold">
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
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(transaction.date)}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      color={transaction.type === 'SELL' ? 'error.main' : 'success.main'}
                    >
                      {transaction.type === 'SELL' ? '-' : '+'}${transaction.amount.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
              
              {/* Divider between items (except for last item) */}
              {index < transactions.length - 1 && (
                <Divider variant="inset" component="li" sx={{ ml: 7 }} />
              )}
            </React.Fragment>
          ))}
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