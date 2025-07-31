import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { DonutSmall } from '@mui/icons-material';

// Mock data for asset classes - replace this with real data later
const mockAssetClassData = [
  { name: 'Stocks', value: 65, color: '#2563eb' },
  { name: 'ETFs', value: 20, color: '#16a34a' },
  { name: 'Bonds', value: 10, color: '#dc2626' },
  { name: 'Cash', value: 5, color: '#ca8a04' }
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Card sx={{ boxShadow: 2, p: 1 }}>
        <Typography variant="body2" fontWeight="bold">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data.value}% of portfolio
        </Typography>
      </Card>
    );
  }
  return null;
};

const AssetClassChart: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <DonutSmall sx={{ mr: 1, color: '#e65100' }} />
          <Typography variant="h6">
            Asset Classes
          </Typography>
        </Box>
        
        <Box height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockAssetClassData}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={60}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {mockAssetClassData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssetClassChart;
