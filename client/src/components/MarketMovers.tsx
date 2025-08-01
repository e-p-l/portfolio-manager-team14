import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useMarketMovers } from '../hooks/useMarketMovers';

const MarketMovers: React.FC = () => {
  const { marketMovers, loading: loadingMarketMovers } = useMarketMovers();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <TrendingUp sx={{ mr: 1, color: '#4caf50' }} />
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Market Movers
          </Typography>
        </Box>
        
        {loadingMarketMovers ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {marketMovers.map((mover, index) => (
              <Box 
                key={mover.symbol} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  py: 1.5,
                  px: 1,
                  borderBottom: index < marketMovers.length - 1 ? '1px solid #f0f0f0' : 'none',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                    borderRadius: 1,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#1a73e8', fontSize: '0.9rem' }}>
                    {mover.symbol}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                    {mover.name}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                  <Typography variant="body2" fontWeight="600" sx={{ color: mover.day_changeP >= 0 ? '#34a853' : '#ea4335', fontSize: '0.9rem' }}>
                    {mover.day_changeP >= 0 ? '+' : ''}{mover.day_changeP.toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" fontWeight="500" sx={{ color: '#424242', fontSize: '0.85rem', mt: 0.5 }}>
                    ${mover.price?.toFixed(2) || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketMovers;
