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

interface SectorAllocationChartOptimizedProps {
  sectorData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  loading?: boolean;
}

const SectorAllocationChartOptimized: React.FC<SectorAllocationChartOptimizedProps> = ({ 
  sectorData, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PieChartIcon style={{ marginRight: 8, color: '#8b5cf6' }} />
            <Typography variant="h6">
              Sector Allocation
            </Typography>
          </Box>
          <Box height={250} display="flex" alignItems="center" justifyContent="center">
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
            <PieChartIcon style={{ marginRight: 8, color: '#8b5cf6' }} />
            <Typography variant="h6">
              Sector Allocation
            </Typography>
          </Box>
          <Box height={250} display="flex" alignItems="center" justifyContent="center">
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
          <PieChartIcon style={{ marginRight: 8, color: '#8b5cf6' }} />
          <Typography variant="h6">
            Sector Allocation
          </Typography>
        </Box>
        
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {sectorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color, fontSize: '12px' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Summary stats */}
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" align="center">
            {sectorData.length} sectors • Top: {sectorData[0]?.name} ({sectorData[0]?.value}%)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SectorAllocationChartOptimized;
