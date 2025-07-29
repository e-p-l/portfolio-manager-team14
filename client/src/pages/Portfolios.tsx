import React from 'react';
import { Typography, Box } from '@mui/material';
import PortfolioList from '../components/PortfolioList';

const Portfolios: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Portfolios</Typography>
      <PortfolioList />
    </Box>
  );
};

export default Portfolios;