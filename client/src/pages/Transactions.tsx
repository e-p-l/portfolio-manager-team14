import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

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
    <Card>
        <CardContent>
          <Typography variant="body1">
            Transaction history will be displayed here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Transactions;