import React from 'react';
import { Typography, Box } from '@mui/material';
import PortfolioList from '../components/PortfolioList';

const Portfolios: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 500, 
        color: '#1976d2',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '8px',
        marginBottom: '24px'
      }}>
        Portfolio
      </Typography>
            <PortfolioList />
    </Box>
  );
};

export default Portfolios;