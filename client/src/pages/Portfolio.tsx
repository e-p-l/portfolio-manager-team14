import React from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import PortfolioList from '../components/PortfolioList';
import { usePortfolio } from '../hooks/usePortfolio';

const Portfolio: React.FC = () => {
  const { portfolio, loading } = usePortfolio();

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
            Portfolio - {portfolio?.name || ''}
          </Typography>
          <PortfolioList />
        </>
      )}
    </Box>
  );
};

export default Portfolio;