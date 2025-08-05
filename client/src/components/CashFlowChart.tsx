import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { useTransactions } from '../hooks/useTransactions';

interface CashFlowChartProps {
  portfolioId?: number;
  title?: string;
}

const DEFAULT_PORTFOLIO_ID = 1;

// Custom tooltip to fix the mixing issue
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          p: 1.5,
          zIndex: 9999,
          position: 'relative',
        }}
      >
        <Typography variant="body2" fontWeight="bold" sx={{ color: data.payload.color }}>
          {data.payload.name}
        </Typography>
        <Typography variant="body2">
          ${data.value.toLocaleString()}
        </Typography>
      </Box>
    );
  }
  return null;
};

const CashFlowChart: React.FC<CashFlowChartProps> = ({ 
  portfolioId = DEFAULT_PORTFOLIO_ID,
  title = "Cash Flow Overview"
}) => {
  const { transactions, loading } = useTransactions(portfolioId);

  // Calculate real cash flow data from transactions (last 30 days)
  const calculateCashFlowData = () => {
    if (!transactions.length) {
      return [
        { name: 'Sales', value: 0, color: '#4caf50' },
        { name: 'Purchases', value: 0, color: '#f44336' },
      ];
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Last 30 days

    let totalSales = 0;
    let totalPurchases = 0;

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.created_at);
      
      if (transactionDate >= cutoffDate) {
        const amount = transaction.quantity * transaction.price;
        
        if (transaction.transaction_type === 'buy') {
          totalPurchases += amount;
        } else if (transaction.transaction_type === 'sell') {
          totalSales += amount;
        }
      }
    });

    return [
      { name: 'Sales', value: Math.round(totalSales * 100) / 100, color: '#4caf50' },
      { name: 'Purchases', value: Math.round(totalPurchases * 100) / 100, color: '#f44336' },
    ];
  };

  const data = calculateCashFlowData();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Loading cash flow data...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 300 }}>
          {/* Chart Section */}
          <Box sx={{ flex: 1, position: 'relative', height: '100%', zIndex: 1 }}>
            <ResponsiveContainer width="100%" height="100%" style={{ zIndex: 10 }}>
              <PieChart style={{ zIndex: 10 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 9999 }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center value */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 5,
                pointerEvents: 'none', // This prevents the center text from interfering with tooltip
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                ${total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Volume
              </Typography>
            </Box>
          </Box>

          {/* Legend Section - Vertical on the right */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, ml: 4, minWidth: 180 }}>
            {data.map((item) => (
              <Box key={item.name} display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    mr: 2,
                    flexShrink: 0
                  }}
                />
                <Box>
                  <Typography variant="body1" fontWeight="600">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ${item.value.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
