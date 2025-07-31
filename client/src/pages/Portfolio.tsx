import React, { useState } from 'react';
import { Typography, Box, CircularProgress, Card, CardContent } from '@mui/material';
import { ViewList } from '@mui/icons-material';
import { usePortfolio } from '../hooks/usePortfolio';
import { useHoldings } from '../hooks/useHoldings';
import HoldingsTable from '../components/HoldingsTable';
import PortfolioValueChart from '../components/PortfolioValueChart';
import SectorAllocationChart from '../components/SectorAllocationChart';
import AssetClassChart from '../components/AssetClassChart';

const DEFAULT_PORTFOLIO_ID = 1; // Hardcoded for now as requested

const Portfolio: React.FC = () => {
  const { portfolio, loading: loadingPortfolio } = usePortfolio();
  const { holdings, loading: loadingHoldings, error } = useHoldings(DEFAULT_PORTFOLIO_ID);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refetch

  const handleHoldingsChange = () => {
    // Trigger refetch by changing the key
    setRefreshKey(prevKey => prevKey + 1);
  };

  const loading = loadingPortfolio || loadingHoldings;

  return (
    <Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            fontWeight: 500, 
            color: '#1976d2',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '8px',
            marginBottom: '24px'
          }}>
            Portfolio - {portfolio?.name || 'My Portfolio'}
          </Typography>
          
          {/* Main content layout with 2:1 ratio */}
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
            {/* Left column (2/3 width) */}
            <Box flex={{ xs: 1, md: 2 }} display="flex" flexDirection="column" gap={3}>
              {/* Portfolio Value (row 1, col 1-2) */}
              <PortfolioValueChart />

              {/* Bottom row cards inside left column */}
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                {/* Sector Allocation (row 2, col 1) */}
                <Box flex={1}>
                  <SectorAllocationChart />
                </Box>

                {/* Asset Classes (row 2, col 2) */}
                <Box flex={1}>
                  <AssetClassChart />
                </Box>
              </Box>
            </Box>
            
            {/* Right column (1/3 width) - Holdings (row 1-2, col 3) */}
            <Box flex={{ xs: 1, md: 1 }} display="flex" flexDirection="column" gap={3}>
              {/* Holdings table - tall card that spans both rows */}
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ViewList sx={{ mr: 1, color: '#0277bd' }} />
                    <Typography variant="h6" gutterBottom>
                      Holdings
                    </Typography>
                  </Box>
                  <HoldingsTable 
                    key={refreshKey}
                    holdings={holdings} 
                    portfolioId={DEFAULT_PORTFOLIO_ID}
                    loading={loadingHoldings}
                    onHoldingsChange={handleHoldingsChange}
                  />
                </CardContent>
              </Card>

            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Portfolio;