import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart as PieChartIcon } from '@mui/icons-material';
import { useHoldings } from '../hooks/useHoldings';

const DEFAULT_PORTFOLIO_ID = 1; // Match the same ID used in Dashboard

// Color mapping for different sectors
const sectorColors: { [key: string]: string } = {
  Technology: '#8b5cf6',
  Healthcare: '#06b6d4',
  Financial: '#10b981',
  Consumer: '#f59e0b',
  Energy: '#ef4444',
  ETF: '#6366f1',
  Communications: '#ec4899',
  Industrial: '#84cc16',
  Materials: '#f97316',
  Utilities: '#14b8a6',
  'Real Estate': '#a855f7',
  Other: '#6b7280'
};

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
  const { holdings, loading } = useHoldings(DEFAULT_PORTFOLIO_ID);

  // Calculate sector allocation from holdings
  const calculateSectorAllocation = () => {
    if (!holdings || holdings.length === 0) return [];

    const sectorMap: { [key: string]: number } = {};
    let totalValue = 0;

    // Calculate total value and value by sector
    holdings.forEach(holding => {
      const currentPrice = holding.current_price || holding.purchase_price;
      const value = holding.quantity * currentPrice;
      const sector = holding.asset_sector || 'Other';
      
      totalValue += value;
      sectorMap[sector] = (sectorMap[sector] || 0) + value;
    });

    // Convert to percentage and format for chart
    return Object.entries(sectorMap).map(([sector, value]) => ({
      name: sector,
      value: Math.round((value / totalValue) * 100),
      color: sectorColors[sector] || sectorColors.Other
    })).sort((a, b) => b.value - a.value); // Sort by value descending
  };

  const chartData = calculateSectorAllocation();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PieChartIcon sx={{ mr: 1, color: '#6200ea' }} />
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

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PieChartIcon sx={{ mr: 1, color: '#6200ea' }} />
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
          <PieChartIcon sx={{ mr: 1, color: '#6200ea' }} />
          <Typography variant="h6">
            Sector Allocation
          </Typography>
        </Box>
        
        <Box height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
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
