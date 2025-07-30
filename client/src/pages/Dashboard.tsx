// filepath: c:\Users\zabiu\Documents\Morgan Stanley\CSF\project\portfolio_manager\client\src\pages\Dashboard.tsx
import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip 
} from '@mui/material';
import { TrendingUp, ShowChart } from '@mui/icons-material';

const Dashboard: React.FC = () => {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 500, 
        color: '#1976d2',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '8px',
        marginBottom: '24px'
      }}>
        Dashboard
      </Typography>
      
      {/* First row - 2:1 ratio */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Portfolio Overview - Takes 2/3 of the space */}
        <Box flex={{ xs: 1, md: 2 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ShowChart sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h5" component="h2">
                  Networth Over Time
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>

              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Market Movers - Takes 1/3 of the space */}
        <Box flex={{ xs: 1, md: 1 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp sx={{ mr: 1, color: '#4caf50' }} />
                <Typography variant="h6">
                  Market Movers
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Second row - Split to match first row's alignment */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mt={3}>
        {/* Left section - Takes 2/3 of space to match "Networth Over Time" */}
        <Box flex={{ xs: 1, md: 2 }} display="flex" gap={3}>
          {/* Cash Flow - Takes 1/2 of the left section (1/3 of total) */}
          <Box flex={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cash Flow
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          {/* Top Holding - Takes 1/2 of the left section (1/3 of total) */}
          <Box flex={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Holding
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
        
        {/* Right section - Takes 1/3 of space to match "Market Movers" */}
        <Box flex={{ xs: 1, md: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Insight
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;