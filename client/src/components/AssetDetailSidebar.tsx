import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { WatchlistItem } from '../types';

interface AssetDetailSidebarProps {
  asset: WatchlistItem;
}

// Get asset details from backend data
const getAssetDetails = (asset: WatchlistItem) => {
  return {
    ...asset,
    // Use actual backend data
    price: asset.current_price || 0,
    change: asset.day_change || 0,
    changePercent: asset.day_changeP || 0,
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

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Avatar 
            sx={{ width: 40, height: 40, fontSize: '1rem' }}
          >
            {asset.asset_symbol?.charAt(0) || 'N/A'}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              {asset.asset_symbol || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {asset.asset_name || 'Unknown Asset'}
            </Typography>
          </Box>
          <Chip 
            label={asset.asset_sector || 'Other'} 
            size="small"
            color="primary" 
            variant="outlined"
          />
        </Box>

        {/* Price Information */}
        <Box mb={2}>
          <Typography variant="h5" fontWeight="bold">
            {formatPrice(details.price)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Asset Information */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Asset Information
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Asset Type
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {asset.asset_type || 'Unknown'}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Sector
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {asset.asset_sector || 'Other'}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Added to Watchlist
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {new Date(asset.added_date).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssetDetailSidebar;
