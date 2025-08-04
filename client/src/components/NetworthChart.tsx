import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
      fullDate: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      value: Math.round(value),
      dayIndex: 29 - i, // For filtering display points
    });
  }
  return data;
};

const NetworthChart: React.FC = () => {
  const data = generateMockData();
  const currentValue = data[data.length - 1]?.value || 0;
  const startValue = data[0]?.value || 0;
  const valueChange = currentValue - startValue;
  const percentageChange = ((valueChange / startValue) * 100);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box mb={2}>
          <Typography variant="h6" color="primary">
            Portfolio Value
          </Typography>
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
        </Box>

        <Box sx={{ flex: 1, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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