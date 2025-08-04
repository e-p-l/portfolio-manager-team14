import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart as PieChartIcon } from '@mui/icons-material';

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

interface SectorAllocationChartProps {
  sectorData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  loading?: boolean;
}

const SectorAllocationChart: React.FC<SectorAllocationChartProps> = ({
  sectorData,
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PieChartIcon sx={{ mr: 1, color: '#6200ea' }} />
            <Typography variant="h6">Sector Allocation</Typography>
          </Box>
          <Box height={300} display="flex" alignItems="center" justifyContent="center">
            <Typography color="textSecondary">Loading...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!sectorData || sectorData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PieChartIcon sx={{ mr: 1, color: '#6200ea' }} />
            <Typography variant="h6">Sector Allocation</Typography>
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
          <PieChartIcon sx={{ mr: 1, color: '#6200ea' }} />
          <Typography variant="h6">Sector Allocation</Typography>
        </Box>

        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorData}
                cx="40%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                wrapperStyle={{ paddingLeft: '20px' }}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color, fontSize: '12px' }}>{value}</span>
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
