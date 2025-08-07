import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Alert,
  Link,
  Divider,
  Badge
} from '@mui/material';
import { 
  Feed, 
  FiberManualRecord,
  Error as ErrorIcon,
  Launch
} from '@mui/icons-material';
import { useMarketInsights } from '../hooks/useMarketInsights';

const MarketInsights: React.FC = () => {
  const { marketInsights, loading, error } = useMarketInsights();
  const MARKET_FEED_COUNT = 4;

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      border: '2px solid #e0e0e0'
    }}>
      <Box sx={{ 
        backgroundColor: '#1976d2', 
        color: 'white', 
        p: 2,
        display: 'flex',
        alignItems: 'center'
      }}>
        <Feed sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Market Feed
        </Typography>
        <Badge badgeContent={marketInsights.length} color="error" sx={{ ml: 'auto' }} />
      </Box>
      
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ flex: 1 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress size={40} />
            </Box>
          ) : error ? (
            <Box p={2}>
              <Alert severity="error" icon={<ErrorIcon />}>
                {error}
              </Alert>
            </Box>
          ) : (
            <Box>
              {marketInsights.slice(0, MARKET_FEED_COUNT).map((insight, index) => (
                <Box key={index}>
                  <Box sx={{ p: 1.6, '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <Box display="flex" alignItems="flex-start">
                      <FiberManualRecord sx={{ 
                        color: '#4caf50', 
                        fontSize: 6, 
                        mt: 0.8, 
                        mr: 1 
                      }} />
                      <Box flex={1}>
                        <Link 
                          href={insight.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ textDecoration: 'none' }}
                        >
                          <Typography variant="body2" sx={{ 
                            fontWeight: 500,
                            mb: 0.5,
                            fontSize: '0.85rem',
                            lineHeight: 1.3,
                            '&:hover': { color: '#1976d2' }
                          }}>
                            {insight.headline}
                          </Typography>
                        </Link>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="caption" color="primary" sx={{ fontSize: '0.7rem' }}>
                            {insight.source}
                          </Typography>
                          <Launch fontSize="small" sx={{ color: '#9e9e9e', fontSize: '0.9rem' }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  {index < marketInsights.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MarketInsights;
