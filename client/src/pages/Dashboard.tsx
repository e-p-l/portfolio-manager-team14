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
      
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Portfolio Overview */}
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

        {/* Quick Stats */}
        <Box flex={{ xs: 1, md: 1 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp sx={{ mr: 1, color: '#4caf50' }} />
                <Typography variant="h6">
                  Quick Stats
                </Typography>
              </Box>

            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Features Coming Soon */}
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Features Coming Soon
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default Dashboard;