import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChartOutlined } from '@mui/icons-material';

interface AssetClassChartProps {
  assetClassData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  loading?: boolean;
}

const AssetClassChart: React.FC<AssetClassChartProps> = ({ 
  assetClassData, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <BarChartOutlined style={{ marginRight: 8, color: '#4a90e2' }} />
            <Typography variant="h6">
              Asset Classes
            </Typography>
          </Box>
          <Box height={300} display="flex" alignItems="center" justifyContent="center">
            <Typography color="textSecondary">Loading...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!assetClassData || assetClassData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <BarChartOutlined style={{ marginRight: 8, color: '#4a90e2' }} />
            <Typography variant="h6">
              Asset Classes
            </Typography>
          </Box>
          <Box height={300} display="flex" alignItems="center" justifyContent="center">
            <Typography color="textSecondary">No holdings data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <BarChartOutlined style={{ marginRight: 8, color: '#4a90e2' }} />
          <Typography variant="h6">
            Asset Classes
          </Typography>
        </Box>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={assetClassData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Allocation (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Allocation']}
              labelStyle={{ color: '#333' }}
              contentStyle={{ backgroundColor: '#f9f9f9', border: '1px solid #ccc' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {assetClassData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
      </CardContent>
    </Card>
  );
};

export default AssetClassChart;
