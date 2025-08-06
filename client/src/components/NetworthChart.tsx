import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { usePortfolioHistory } from '../hooks/usePortfolioHistory';
import { usePortfolio } from '../hooks/usePortfolio';
import { format, parseISO, subDays } from 'date-fns';

interface NetworthChartProps {
  portfolioId: number;
}

const NetworthChart: React.FC<NetworthChartProps> = ({ portfolioId }) => {
  // Fetch portfolio history data from backend
  const { historyData, loading, error } = usePortfolioHistory(portfolioId);
  // Fetch portfolio details for AUM and return
  const { portfolio, loading: portfolioLoading } = usePortfolio();
  
  // Filter to show last 30 days only (like the original)
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  
  const filteredData = historyData
    .filter(item => {
      const itemDate = parseISO(item.date);
      return itemDate >= thirtyDaysAgo;
    })
    .map(item => {
      const itemDate = parseISO(item.date);
      return {
        date: format(itemDate, 'MMM d'),
        fullDate: format(itemDate, 'MMMM d, yyyy'),
        value: Math.round(item.value),
        dayIndex: 0 // Not needed anymore
      };
    });

  const currentValue = portfolio?.aum || filteredData[filteredData.length - 1]?.value || 0;
  const startValue = filteredData[0]?.value || 0;
  const valueChange = currentValue - startValue;
  const percentageChange = startValue > 0 ? ((valueChange / startValue) * 100) : 0;

  // Format return value
  const formattedReturn = portfolio?.return ? `${portfolio.return >= 0 ? '+' : ''}${portfolio.return.toFixed(2)}%` : 'Loading...';

  // Show loading state
  if (loading || portfolioLoading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="primary" mb={2}>Portfolio Overview</Typography>
          <Typography variant="body1" color="text.secondary">Loading portfolio data...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="primary" mb={2}>Portfolio Value</Typography>
          <Typography variant="body1" color="error.main">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box mb={2}>
          <Typography variant="h6" color="primary">
            Portfolio Overview
          </Typography>
          
          {/* Main Portfolio Value */}
          <Typography variant="h4" fontWeight="bold">
            ${currentValue.toLocaleString()}
          </Typography>
          <Typography 
            variant="body2" 
            color={valueChange >= 0 ? '#4caf50' : '#f44336'}
            fontWeight="medium"
          >
            {valueChange >= 0 ? '+' : ''}${valueChange.toLocaleString()} ({percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%) this month
          </Typography>

          {/* Total Return - Under other info on left side */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total Return: 
              <Typography 
                component="span"
                variant="body2"
                fontWeight="bold"
                color={portfolio?.return && portfolio.return >= 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {formattedReturn}
              </Typography>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="minimalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1976d2" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#1976d2" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                axisLine={true}
                tickLine={true}
                tick={{ fontSize: 12, fill: '#666' }}
                interval={6}
                stroke="#e0e0e0"
              />
              <YAxis
                domain={[
                  (dataMin: number) => Math.floor(dataMin * 0.95),
                  (dataMax: number) => Math.ceil(dataMax * 1.05)
                ]}
                axisLine={true}
                tickLine={true}
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                stroke="#e0e0e0"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return label;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#1976d2"
                strokeWidth={2}
                fill="url(#minimalGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NetworthChart;