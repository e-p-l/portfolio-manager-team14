import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar,
  Paper
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { WatchlistAsset } from './WatchlistTable';

interface AssetDetailSidebarProps {
  asset: WatchlistAsset;
}

// Mock additional asset info (would come from yfinance in real implementation)
const getAssetDetails = (asset: WatchlistAsset) => {
  return {
    ...asset,
    // Additional mock data
    marketCap: asset.marketCap,
    peRatio: Math.round((Math.random() * 25 + 10) * 100) / 100,
    dividendYield: Math.round((Math.random() * 5) * 100) / 100,
    eps: Math.round((Math.random() * 10 + 1) * 100) / 100,
    beta: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
    dayHigh: asset.price * (1 + Math.random() * 0.05),
    dayLow: asset.price * (1 - Math.random() * 0.05),
    yearHigh: asset.price * (1 + Math.random() * 0.3 + 0.1),
    yearLow: asset.price * (1 - Math.random() * 0.4),
    avgVolume: asset.volume,
  };
};

const AssetDetailSidebar: React.FC<AssetDetailSidebarProps> = ({ asset }) => {
  const details = getAssetDetails(asset);

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

  const formatLargeNumber = (num: string) => {
    // Convert string like "1.2B" to formatted display
    return num;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Avatar 
            sx={{ width: 40, height: 40, fontSize: '1rem' }}
            src={asset.logo}
          >
            {asset.symbol.charAt(0)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              {asset.symbol}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {asset.name}
            </Typography>
          </Box>
          <Chip 
            label={asset.sector} 
            size="small"
            color="primary" 
            variant="outlined"
          />
        </Box>

        {/* Price Information */}
        <Box mb={2}>
          <Typography variant="h5" fontWeight="bold">
            {formatPrice(asset.price)}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            {asset.changePercent >= 0 ? (
              <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography 
              variant="body2" 
              color={asset.changePercent >= 0 ? 'success.main' : 'error.main'}
              fontWeight="medium"
            >
              {formatChange(asset.change)} ({formatPercent(asset.changePercent)})
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Quick Stats */}
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5} mb={2}>
          <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              52W High
            </Typography>
            <Typography variant="body2" fontWeight="bold" fontSize="0.8rem">
              {formatPrice(details.yearHigh)}
            </Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              52W Low
            </Typography>
            <Typography variant="body2" fontWeight="bold" fontSize="0.8rem">
              {formatPrice(details.yearLow)}
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Key Metrics */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Key Statistics
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Market Cap
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {formatLargeNumber(details.marketCap)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                P/E Ratio
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {details.peRatio}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Dividend Yield
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {details.dividendYield}%
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Beta
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {details.beta}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Volume
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {details.volume}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssetDetailSidebar;
