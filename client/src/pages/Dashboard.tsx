import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography
} from '@mui/material';
import { 
  Analytics
} from '@mui/icons-material';
import HoldingsTable from '../components/HoldingsTable';
import CashFlowChart from '../components/CashFlowChart';
import MarketMovers from '../components/MarketMovers';
import MarketInsights from '../components/MarketInsights';
import { useHoldings } from '../hooks/useHoldings';
import PortfolioValueChart from '../components/PortfolioValueChart';
import NetworthChart from '../components/NetworthChart';

const DEFAULT_PORTFOLIO_ID = 1; // Hardcoded for now

const Dashboard: React.FC = () => {
  const { holdings, loading: loadingHoldings, addHolding, removeHolding, topPerformers } = useHoldings(DEFAULT_PORTFOLIO_ID);

  // Get top 5 best performing holdings - now using pre-computed data
  const getTopPerformingHoldings = () => {
    return topPerformers;
  };

  const topHoldings = getTopPerformingHoldings();

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '8px',
        marginBottom: '24px'
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 500, 
          color: '#1976d2',
        }}>
          Dashboard
        </Typography>
        
        <Box textAlign="right">
          <Typography variant="body2" color="textSecondary">
            Account Balance
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary">
            $12,340.50
          </Typography>
        </Box>
      </Box>
      
      {/* First row - 2:1 ratio */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} sx={{ height: '450px' }}>
        {/* Portfolio Overview - Takes 2/3 of the space */}
        <Box flex={{ xs: 1, md: 2 }} sx={{ height: '100%' }}>
          <Box sx={{ height: '100%' }}>
            <NetworthChart />
          </Box>
        </Box>

        {/* Market Movers - Takes 1/3 of the space */}
        <Box flex={{ xs: 1, md: 1 }} sx={{ height: '100%' }}>
          <Box sx={{ height: '100%' }}>
            <MarketMovers />
          </Box>
        </Box>
      </Box>

      {/* Second row - Split to match first row's alignment */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mt={3} sx={{ height: '350px' }}>
        {/* Left section - Takes 2/3 of space to match "Portfolio Value" */}
        <Box flex={{ xs: 1, md: 2 }} display="flex" gap={3} sx={{ height: '100%' }}>
          {/* Cash Flow - Takes 2/5 of the left section */}
          <Box flex={2} sx={{ height: '100%' }}>
            <Box sx={{ height: '100%' }}>
              <CashFlowChart />
            </Box>
          </Box>
          
          {/* Top Holdings - Takes 3/5 of the left section (bigger than Cash Flow) */}
          <Box flex={3} sx={{ height: '100%' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Analytics sx={{ mr: 1, color: '#0277bd' }} />
                  <Typography variant="h6" gutterBottom>
                    Top Holdings
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <HoldingsTable 
                    holdings={topHoldings} 
                    portfolioId={DEFAULT_PORTFOLIO_ID}
                    loading={loadingHoldings}
                    hideActions={true}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
        
        {/* Right section - Takes 1/3 of space to match "Market Movers" */}
        <Box flex={{ xs: 1, md: 1 }} sx={{ height: '100%' }}>
          <Box sx={{ height: '100%' }}>
            <MarketInsights />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;