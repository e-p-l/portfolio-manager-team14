import React, { useState } from 'react';
import { Typography, Box } from '@mui/material';
import TransactionTimeline from '../components/TransactionTimeline';
import TransactionFlow from '../components/TransactionFlow';

const DEFAULT_PORTFOLIO_ID = 1;

const Transactions: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

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
          <TransactionFlow 
            portfolioId={DEFAULT_PORTFOLIO_ID} 
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </Box>
        
        <Box>
          <TransactionTimeline 
            portfolioId={DEFAULT_PORTFOLIO_ID}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Transactions;