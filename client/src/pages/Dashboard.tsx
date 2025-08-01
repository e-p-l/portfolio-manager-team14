// filepath: c:\Users\zabiu\Documents\Morgan Stanley\CSF\project\portfolio_manager\client\src\pages\Dashboard.tsx
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

const DEFAULT_PORTFOLIO_ID = 1; // Hardcoded for now

const Dashboard: React.FC = () => {
  const { holdings, loading: loadingHoldings } = useHoldings(DEFAULT_PORTFOLIO_ID);

  // Get top 5 best performing holdings
  const getTopPerformingHoldings = () => {
    if (!holdings || holdings.length === 0) return [];
    
    const sortedHoldings = holdings
      .map(holding => ({
        ...holding,
        gainLossPercent: holding.current_price 
          ? ((holding.current_price - holding.purchase_price) / holding.purchase_price) * 100
          : 0
      }))
      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
      .slice(0, 5);
      
    return sortedHoldings;
  };

  const topHoldings = getTopPerformingHoldings();

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 500, 
        color: '#1976d2',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '8px',
        marginBottom: '24px'
      }}>
        Dashboard
      </Typography>
      
      {/* First row - 2:1 ratio */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} sx={{ height: '450px' }}>
        {/* Portfolio Overview - Takes 2/3 of the space */}
        <Box flex={{ xs: 1, md: 2 }} sx={{ height: '100%' }}>
          <Box sx={{ height: '100%' }}>
            <PortfolioValueChart />
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
          {/* Cash Flow - Takes 1/2 of the left section (1/3 of total) */}
          <Box flex={1} sx={{ height: '100%' }}>
            <Box sx={{ height: '100%' }}>
              <CashFlowChart />
            </Box>
          </Box>
          
          {/* Top Holdings - Takes 1/2 of the left section (1/3 of total) */}
          <Box flex={1} sx={{ height: '100%' }}>
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