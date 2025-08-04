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
import ValueChart from './ValueChart';
import { WatchlistAsset } from './WatchlistTable';

interface AssetDetailViewProps {
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
    description: `${asset.name} is a leading company in the ${asset.sector} sector. This is mock description data that would typically come from yfinance or another financial data provider.`
  };
};

const AssetDetailView: React.FC<AssetDetailViewProps> = ({ asset }) => {
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header Card */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar 
              sx={{ width: 48, height: 48, fontSize: '1.2rem' }}
              src={asset.logo}
            >
              {asset.symbol.charAt(0)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold">
                {asset.symbol}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {asset.name}
              </Typography>
            </Box>
            <Chip 
              label={asset.sector} 
              color="primary" 
              variant="outlined"
            />
          </Box>

          {/* Price Information */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="h4" fontWeight="bold">
              {formatPrice(asset.price)}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {asset.changePercent >= 0 ? (
                <TrendingUp sx={{ color: 'success.main' }} />
              ) : (
                <TrendingDown sx={{ color: 'error.main' }} />
              )}
              <Typography 
                variant="h6" 
                color={asset.changePercent >= 0 ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {formatChange(asset.change)} ({formatPercent(asset.changePercent)})
              </Typography>
            </Box>
          </Box>

          {/* Key Metrics */}
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={2}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Day High
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatPrice(details.dayHigh)}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Day Low
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatPrice(details.dayLow)}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                52W High
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatPrice(details.yearHigh)}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                52W Low
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatPrice(details.yearLow)}
              </Typography>
            </Paper>
          </Box>
        </CardContent>
      </Card>

      {/* Chart Card */}
      <Card sx={{ flex: 1 }}>
        <ValueChart 
          assetSymbol={asset.symbol} 
          title={`${asset.symbol} Price Chart`}
        />
      </Card>

      {/* Additional Details */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Key Statistics
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Market Cap
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatLargeNumber(details.marketCap)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                P/E Ratio
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {details.peRatio}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Dividend Yield
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {details.dividendYield}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                EPS
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                ${details.eps}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Beta
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {details.beta}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Volume
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {details.volume}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            About {asset.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {details.description}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AssetDetailView;
