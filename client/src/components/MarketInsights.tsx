import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Lightbulb, 
  ArrowUpward, 
  ArrowDownward,
  TimerOutlined
} from '@mui/icons-material';

const MarketInsights: React.FC = () => {
  return (
    <Card sx={{ background: 'linear-gradient(to bottom, #f5f7fa, #ffffff)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Lightbulb sx={{ mr: 1, color: '#f57c00' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Market Insights
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ flex: 1 }}>
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
        </Box>
      </CardContent>
    </Card>
  );
};

export default MarketInsights;
