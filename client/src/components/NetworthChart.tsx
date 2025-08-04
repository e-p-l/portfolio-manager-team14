import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

const generateMockData = () => {
  const data = [];
  const today = new Date();
  let value = 48000;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    value += (Math.random() - 0.5) * 1200;
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value),
    });
  }
  return data;
};

const WatchlistChartMinimal: React.FC = () => {
  const data = generateMockData();
  const currentValue = data[data.length - 1]?.value || 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box mb={2}>
          <Typography variant="h6" color="primary">
            Watchlist Overview
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            ${currentValue.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="minimalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1976d2" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#1976d2" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
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

export default WatchlistChartMinimal;