import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { PieChart as PieChartIcon } from '@mui/icons-material';
import { useTransactions } from '../hooks/useTransactions';

interface CashFlowChartProps {
  portfolioId?: number;
  title?: string;
}

const DEFAULT_PORTFOLIO_ID = 1;

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
  title = "Cash Flow"
}) => {
  const { transactions, loading } = useTransactions(portfolioId);

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
        const amount = Math.round((transaction.quantity * transaction.price) * 100) / 100;
        
        if (transaction.transaction_type === 'buy') {
          totalPurchases += amount;
        } else if (transaction.transaction_type === 'sell') {
          totalSales += amount;
        }
      }
    });

    return [
      { name: 'Sales', value: totalSales, color: '#4caf50' },
      { name: 'Purchases', value: totalPurchases, color: '#f44336' },
    ];
  };

  const data = calculateCashFlowData();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PieChartIcon sx={{ mr: 1, color: '#ff9800' }} />
            <Typography variant="h6">
              {title}
            </Typography>
          </Box>
          <Box height={300} display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!data.length || total === 0) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PieChartIcon sx={{ mr: 1, color: '#ff9800' }} />
            <Typography variant="h6">
              {title}
            </Typography>
          </Box>
          <Box height={300} display="flex" alignItems="center" justifyContent="center">
            <Typography color="textSecondary">No transaction data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <PieChartIcon sx={{ mr: 1, color: '#ff9800' }} />
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>

        <Box height={300} position="relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="40%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '40%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            <Typography variant="body1" fontWeight="500">
              ${total.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Volume
            </Typography>
          </Box>

          {/* Legend positioned exactly like SectorAllocationChart */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '10px',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {data.map((item) => (
              <Box key={item.name} display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    mr: 1,
                    flexShrink: 0
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: '14px', color: item.color }}>
                  {item.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
