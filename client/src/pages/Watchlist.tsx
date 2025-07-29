import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const Watchlist: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 500, 
        color: '#1976d2',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '8px',
        marginBottom: '24px'
      }}>
        Watchlist
      </Typography>      
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