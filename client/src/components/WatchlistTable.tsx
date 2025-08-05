import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import { WatchlistItem } from '../types';

interface WatchlistTableProps {
  watchlistItems: WatchlistItem[];
  onAssetClick: (item: WatchlistItem) => void;
  onRemoveFromWatchlist?: (watchlistId: number) => void;
  loading?: boolean;
}

const WatchlistTable: React.FC<WatchlistTableProps> = ({ 
  watchlistItems, 
  onAssetClick, 
  onRemoveFromWatchlist,
  loading = false
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'always',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(change);
  };

  const formatPercent = (percent: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'always',
    }).format(percent / 100);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" component="h2">
            Watchlist
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your favorite assets
          </Typography>
        </Box>
        
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Asset</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Change</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Volume</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Sector</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : watchlistItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No assets in watchlist</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                watchlistItems.map((item) => (
                  <TableRow 
                    key={item.id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                    onClick={() => onAssetClick(item)}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar 
                          sx={{ width: 32, height: 32, fontSize: '0.75rem' }}
                        >
                          {item.asset_symbol?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {item.asset_symbol}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {item.asset_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {item.current_price ? formatPrice(item.current_price) : 'N/A'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box display="flex" flexDirection="column" alignItems="flex-end">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          {(item.day_changeP || 0) >= 0 ? (
                            <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                          <Typography 
                            variant="body2" 
                            color={(item.day_changeP || 0) >= 0 ? 'success.main' : 'error.main'}
                            fontWeight="medium"
                          >
                            {item.day_change ? formatChange(item.day_change) : 'N/A'}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="caption" 
                          color={(item.day_changeP || 0) >= 0 ? 'success.main' : 'error.main'}
                        >
                          {item.day_changeP ? formatPercent(item.day_changeP) : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip 
                        label={item.asset_sector || 'Unknown'} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      {onRemoveFromWatchlist && (
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => onRemoveFromWatchlist(item.id)}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'error.light',
                              color: 'white'
                            }
                          }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default WatchlistTable;
