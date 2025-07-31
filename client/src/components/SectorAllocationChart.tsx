import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart as PieChartIcon } from '@mui/icons-material';

// Mock data for sector allocation - replace this with real data later
const mockSectorData = [
  { name: 'Technology', value: 35, color: '#8b5cf6' },
  { name: 'Healthcare', value: 15, color: '#06b6d4' },
  { name: 'Financial', value: 12, color: '#10b981' },
  { name: 'Consumer', value: 18, color: '#f59e0b' },
  { name: 'Energy', value: 8, color: '#ef4444' },
  { name: 'Other', value: 12, color: '#6b7280' }
];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Card sx={{ boxShadow: 2, p: 1 }}>
        <Typography variant="body2" fontWeight="bold">
          {data.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data.value}% of portfolio
        </Typography>
      </Card>
    );
  }
  return null;
};

const SectorAllocationChart: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <PieChartIcon sx={{ mr: 1, color: '#6200ea' }} />
          <Typography variant="h6">
            Sector Allocation
          </Typography>
        </Box>
        
        <Box height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockSectorData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {mockSectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SectorAllocationChart;
