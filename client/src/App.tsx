import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Box,
  Chip
} from '@mui/material';
import { TrendingUp, AccountBalance, ShowChart, Notifications } from '@mui/icons-material';
import PortfolioList from './components/PortfolioList';
import './App.css';

function App() {
  return (
    <div className="App">
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <AccountBalance sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Portfolio Manager
          </Typography>
          <Notifications />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

        {/* Portfolio Management Section */}
        <Box mt={3}>
          <PortfolioList />
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

      </Container>
    </div>
  );
}

export default App;
