import React from 'react';
import { Typography, Box } from '@mui/material';
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
        <Box>
          <TransactionFlow />
        </Box>
        
        <Box>
          <TransactionTimeline />
        </Box>
      </Box>
    </Box>
  );
};

export default Transactions;