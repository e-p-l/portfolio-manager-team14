// filepath: c:\Users\zabiu\Documents\Morgan Stanley\CSF\project\portfolio_manager\client\src\pages\Dashboard.tsx
import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  TrendingUp, 
  ShowChart, 
  Lightbulb, 
  ArrowUpward, 
  ArrowDownward,
  TimerOutlined,
  PriceChange,
  Analytics
} from '@mui/icons-material';

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
                <Analytics sx={{ mr: 1, color: '#0277bd' }} />
                <Typography variant="h6" gutterBottom>
                  Top Holding
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
                <Box display="flex" alignItems="center" mb={2}>
                  <PriceChange sx={{ mr: 1, color: '#6200ea' }} />
                  <Typography variant="h6" gutterBottom>
                    Cash Flow
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          {/* Top Holding - Takes 1/2 of the left section (1/3 of total) */}
          <Box flex={1}>
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
        
        {/* Right section - Takes 1/3 of space to match "Market Movers" */}
        <Box flex={{ xs: 1, md: 1 }}>
          <Card sx={{ background: 'linear-gradient(to bottom, #f5f7fa, #ffffff)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Lightbulb sx={{ mr: 1, color: '#f57c00' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Market Insights
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1.5 }} />
              
              <List dense disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <ArrowUpward fontSize="small" sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Technology sector showing strong growth" 
                    sx={{ color: '#424242' }}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <ArrowDownward fontSize="small" sx={{ color: '#f44336' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Energy stocks down by 2.3% this week"
                    sx={{ color: '#424242' }}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <TimerOutlined fontSize="small" sx={{ color: '#ff9800' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Earnings reports expected next week"
                    sx={{ color: '#424242' }}
                  />
                </ListItem>
              </List>
              
              <Chip 
                label="View All Insights" 
                size="small" 
                color="primary" 
                sx={{ mt: 1, cursor: 'pointer' }} 
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;