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
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Portfolio Overview */}
        <Box flex={{ xs: 1, md: 2 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ShowChart sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h5" component="h2">
                  Portfolio Overview
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                Welcome to your Portfolio Manager dashboard. Here you can track your investments, 
                monitor performance, and manage your financial portfolio.
              </Typography>
              <Box mt={2}>
                <Chip label="Total Value: $0.00" color="primary" sx={{ mr: 1 }} />
                <Chip label="Today's Change: $0.00" color="default" />
              </Box>
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
              <Typography variant="body2" color="text.secondary">
                • Active Holdings: 0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Watchlist Items: 0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Recent Transactions: 0
              </Typography>
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
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }} 
              flexWrap="wrap" 
              gap={2}
            >
              <Box flex={1} minWidth="200px">
                <Typography variant="body2" color="text.secondary">
                  📊 Real-time Portfolio Tracking
                </Typography>
              </Box>
              <Box flex={1} minWidth="200px">
                <Typography variant="body2" color="text.secondary">
                  📈 Performance Analytics
                </Typography>
              </Box>
              <Box flex={1} minWidth="200px">
                <Typography variant="body2" color="text.secondary">
                  👁️ Watchlist Management
                </Typography>
              </Box>
              <Box flex={1} minWidth="200px">
                <Typography variant="body2" color="text.secondary">
                  💼 Transaction History
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default Dashboard;