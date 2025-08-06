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
  Divider,
  CircularProgress,
  Alert,
  Link
} from '@mui/material';
import { 
  Lightbulb, 
  Article,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useMarketInsights } from '../hooks/useMarketInsights';

const MarketInsights: React.FC = () => {
  const { marketInsights, loading, error } = useMarketInsights();

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
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress size={40} />
            </Box>
          ) : error ? (
            <Alert severity="error" icon={<ErrorIcon />}>
              {error}
            </Alert>
          ) : (
            <List dense disablePadding>
              {marketInsights.slice(0, 3).map((insight, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon>
                    <Article fontSize="small" sx={{ color: '#1976d2' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Link 
                        href={insight.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#424242', fontWeight: 500 }}>
                          {insight.headline}
                        </Typography>
                      </Link>
                    }
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        {insight.source}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MarketInsights;
