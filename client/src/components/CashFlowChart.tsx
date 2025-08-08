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
          pointerEvents: 'none',
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
        { name: 'Sells', value: 0, color: '#4caf50' },
        { name: 'Buys', value: 0, color: '#f44336' },
      ];
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Last 30 days

    let totalSells = 0;
    let totalBuys = 0;

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.created_at);
      
      if (transactionDate >= cutoffDate) {
        const amount = Math.round((transaction.quantity * transaction.price) * 100) / 100;
        
        if (transaction.transaction_type === 'buy') {
          totalBuys += amount;
        } else if (transaction.transaction_type === 'sell') {
          totalSells += amount;
        }
      }
    });

    return [
      { name: 'Sells', value: totalSells, color: '#4caf50' },
      { name: 'Buys', value: totalBuys, color: '#f44336' },
    ];
  };

  const data = calculateCashFlowData();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Box mb={2}>
            <Box display="flex" alignItems="center">
              <PieChartIcon sx={{ mr: 1, color: '#ff9800' }} />
              <Typography variant="h6">
                {title}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, ml: 4 }}>
              Last 30 days transaction activity
            </Typography>
          </Box>
          <Box height={250} display="flex" alignItems="center" justifyContent="center">
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
          <Box mb={2}>
            <Box display="flex" alignItems="center">
              <PieChartIcon sx={{ mr: 1, color: '#ff9800' }} />
              <Typography variant="h6">
                {title}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, ml: 4 }}>
              Last 30 days transaction activity
            </Typography>
          </Box>
          <Box height={250} display="flex" alignItems="center" justifyContent="center">
            <Typography color="textSecondary">No transaction data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box mb={2}>
          <Box display="flex" alignItems="center">
            <PieChartIcon sx={{ mr: 1, color: '#ff9800' }} />
            <Typography variant="h6">
              {title}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, ml: 4 }}>
            Last 30 days transaction activity
          </Typography>
        </Box>

        <Box height={250} position="relative">
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
              <Tooltip 
                content={<CustomTooltip />}
                offset={30}
                wrapperStyle={{ zIndex: 999999 }}
              />
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
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '40px',
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
