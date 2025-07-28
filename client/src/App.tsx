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
        </Box>


      </Container>
    </div>
  );
}

export default App;
