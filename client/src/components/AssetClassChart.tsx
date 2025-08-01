import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChartOutlined } from '@mui/icons-material';
import { useHoldings } from '../hooks/useHoldings';

const DEFAULT_PORTFOLIO_ID = 1; // Match the same ID used in Dashboard

// Color mapping for different asset types
const assetTypeColors: { [key: string]: string } = {
  equity: '#4a90e2',
  etf: '#50e3c2',
  stock: '#4a90e2', // Same as equity
  mutualfund: '#bd10e0',
  index: '#f5a623',
  currency: '#ff6b6b',
  cryptocurrency: '#ff9f43',
  bond: '#6c5ce7',
  cash: '#a0a0a0',
  other: '#636e72'
};

const AssetClassChart: React.FC = () => {
  const { holdings, loading } = useHoldings(DEFAULT_PORTFOLIO_ID);

  // Calculate asset allocation from holdings
  const calculateAssetAllocation = () => {
    if (!holdings || holdings.length === 0) return [];

    const assetTypeMap: { [key: string]: number } = {};
    let totalValue = 0;

    // Calculate total value and value by asset type
    holdings.forEach(holding => {
      const currentPrice = holding.current_price || holding.purchase_price;
      const value = holding.quantity * currentPrice;
      const assetType = holding.asset_type || 'other';
      
      totalValue += value;
      assetTypeMap[assetType] = (assetTypeMap[assetType] || 0) + value;
    });

    // Convert to percentage and format for chart
    return Object.entries(assetTypeMap).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
      value: Math.round((value / totalValue) * 100),
      color: assetTypeColors[type] || assetTypeColors.other
    })).sort((a, b) => b.value - a.value); // Sort by value descending
  };

  const chartData = calculateAssetAllocation();

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
            <BarChartOutlined style={{ marginRight: 8, color: '#4a90e2' }} />
            <Typography variant="h6">
              Asset Classes
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
          <BarChartOutlined style={{ marginRight: 8, color: '#4a90e2' }} />
          <Typography variant="h6">
            Asset Classes
          </Typography>
        </Box>
        <Box height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Allocation']}
                labelStyle={{ color: '#333' }}
              />
              <Bar dataKey="value" barSize={20}>
                {chartData.map((entry, index) => (
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
