import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl } from '@mui/material';
import { AccountBalance, TrendingUp, TrendingDown } from '@mui/icons-material';

interface TransactionFlowProps {
  data?: {
    totalInflow: number;
    totalOutflow: number;
    period: string;
  };
}

// Mock data for different periods (easily replaceable)
const mockData = {
  '30d': { totalInflow: 15900, totalOutflow: 3200, period: 'Last 30 Days' },
  '1y': { totalInflow: 125000, totalOutflow: 28000, period: 'Last Year' },
  'all': { totalInflow: 250000, totalOutflow: 65000, period: 'All Time' }
};

const TransactionFlow: React.FC<TransactionFlowProps> = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  // Use provided data or mock data
  const currentData = data || mockData[selectedPeriod as keyof typeof mockData];
  const { totalInflow, totalOutflow, period } = currentData;
  const netFlow = totalInflow - totalOutflow;
  const totalVolume = totalInflow + totalOutflow;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Transaction Flow
          </Typography>
          
          {/* Period Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              displayEmpty
            >
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Summary */}
        <Box mb={3}>
          <Typography variant="h4" color="primary" fontWeight="bold">
            ${netFlow.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Net Cash Flow ({period})
          </Typography>
        </Box>

        {/* Flow Visualization */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Inflow */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderRadius: '12px',
              background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.05) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${(totalInflow / totalVolume) * 100}%`,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderRadius: '12px'
              }}
            />
            <TrendingUp sx={{ mr: 2, color: '#4caf50', zIndex: 1 }} />
            <Box sx={{ zIndex: 1, flex: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                Money In
              </Typography>
              <Typography variant="h6" color="#4caf50">
                +${totalInflow.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" color="#4caf50" sx={{ zIndex: 1 }}>
              {((totalInflow / totalVolume) * 100).toFixed(1)}%
            </Typography>
          </Box>

          {/* Outflow */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderRadius: '12px',
              background: 'linear-gradient(90deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.05) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${(totalOutflow / totalVolume) * 100}%`,
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                borderRadius: '12px'
              }}
            />
            <TrendingDown sx={{ mr: 2, color: '#f44336', zIndex: 1 }} />
            <Box sx={{ zIndex: 1, flex: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                Money Out
              </Typography>
              <Typography variant="h6" color="#f44336">
                -${totalOutflow.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" color="#f44336" sx={{ zIndex: 1 }}>
              {((totalOutflow / totalVolume) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionFlow;