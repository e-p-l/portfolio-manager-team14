import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const Watchlist: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Watchlist</Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Your watched assets will be displayed here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Watchlist;