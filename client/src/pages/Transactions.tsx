import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';
import TransactionTimeline from '../components/TransactionTimeline';
import TransactionFlow from '../components/TransactionFlow';

const Transactions: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 500, 
        color: '#1976d2',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '8px',
        marginBottom: '24px'
      }}>
        Transactions
      </Typography>
      
      {/* Transaction page layout */}
      <Box display="flex" flexDirection="column" gap={3}>
        {/* First row - 30% height with summary and filter */}
        <Box sx={{ height: '40vh' }}>
          <TransactionFlow />
        </Box>
        
        {/* Second row - 70% height with transaction list */}
        <Box>
          <TransactionTimeline />
        </Box>
      </Box>
    </Box>
  );
};

export default Transactions;