import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const Transactions: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Transactions</Typography>
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