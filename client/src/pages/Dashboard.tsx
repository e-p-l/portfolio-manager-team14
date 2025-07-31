// filepath: c:\Users\zabiu\Documents\Morgan Stanley\CSF\project\portfolio_manager\client\src\pages\Dashboard.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel
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
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const mockCashFlowData = [
  { name: 'Inflow', value: 34000, color: '#4a90e2' },
  { name: 'Outflow', value: 20000, color: '#50e3c2' },
];

const mockMarketMovers = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: '$150.00', change: '+1.5%', volume: '75M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: '$720.00', change: '-0.5%', volume: '30M' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$3,000.00', change: '+2.0%', volume: '5M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$2,800.00', change: '+0.8%', volume: '10M' },
];

const months = ['January', 'February', 'March', 'April', 'May'];

const Dashboard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const handleMonthChange = (event: any) => {
    setSelectedMonth(event.target.value);
  };

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
                <Typography variant="h6" gutterBottom>
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
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <PriceChange sx={{ mr: 1, color: '#6200ea' }} />
                    <Typography variant="h6" gutterBottom>
                      Cash Flow
                    </Typography>
                  </Box>
                  <FormControl size="small" variant="outlined">
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      label="Month"
                    >
                      {months.map((month) => (
                        <MenuItem key={month} value={month}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Typography variant="subtitle1" align="center" gutterBottom>
                  {selectedMonth}
                </Typography>
                <Box height={250}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockCashFlowData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={0}
                        cornerRadius={5}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mockCashFlowData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
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
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Market Movers
                </Typography>
              </Box>
              <Box>
                {mockMarketMovers.map((row, index) => (
                  <Box 
                    key={row.symbol} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      py: 1.5,
                      px: 1,
                      borderBottom: index < mockMarketMovers.length - 1 ? '1px solid #f0f0f0' : 'none',
                      '&:hover': {
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1,
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
                      }
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#1a73e8', fontSize: '0.9rem' }}>
                        {row.symbol}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                        {row.name}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                      <Typography variant="body2" fontWeight="500" sx={{ color: '#424242', fontSize: '0.85rem' }}>
                        {row.price}
                      </Typography>
                      <Typography variant="body2" fontWeight="500" sx={{ color: row.change.includes('+') ? '#34a853' : '#ea4335', fontSize: '0.85rem' }}>
                        {row.change}
                      </Typography>
                    </Box>
                  </Box>
                ))}
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
                  <ListItemText primary="AAPL reached your target price" sx={{ color: '#424242' }} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;