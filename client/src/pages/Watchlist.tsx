import React, { useState } from 'react';
import { Typography, Box } from '@mui/material';
import WatchlistTable, { WatchlistAsset } from '../components/WatchlistTable';
import AssetDetailSidebar from '../components/AssetDetailSidebar';
import ValueChart from '../components/ValueChart';

// Mock watchlist data - easily replaceable with real API data
const mockWatchlistAssets: WatchlistAsset[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.50,
    change: 2.15,
    changePercent: 1.15,
    volume: '58.2M',
    marketCap: '2.98T',
    sector: 'Technology',
    logo: undefined
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.73,
    change: -5.42,
    changePercent: -2.13,
    volume: '42.1M',
    marketCap: '791.5B',
    sector: 'Consumer Cyclical',
    logo: undefined
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.28,
    change: 18.95,
    changePercent: 2.21,
    volume: '24.8M',
    marketCap: '2.16T',
    sector: 'Technology',
    logo: undefined
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 142.81,
    change: 1.23,
    changePercent: 0.87,
    volume: '31.5M',
    marketCap: '1.48T',
    sector: 'Consumer Cyclical',
    logo: undefined
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 162.35,
    change: -0.89,
    changePercent: -0.55,
    volume: '18.7M',
    marketCap: '2.04T',
    sector: 'Communication Services',
    logo: undefined
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 427.12,
    change: 3.87,
    changePercent: 0.91,
    volume: '22.3M',
    marketCap: '3.17T',
    sector: 'Technology',
    logo: undefined
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 498.37,
    change: 7.21,
    changePercent: 1.47,
    volume: '15.9M',
    marketCap: '1.26T',
    sector: 'Communication Services',
    logo: undefined
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    price: 127.63,
    change: -2.14,
    changePercent: -1.65,
    volume: '38.4M',
    marketCap: '206.8B',
    sector: 'Technology',
    logo: undefined
  }
];

const Watchlist: React.FC = () => {
  const [watchlistAssets, setWatchlistAssets] = useState<WatchlistAsset[]>(mockWatchlistAssets);
  // Default to first asset selected
  const [selectedAsset, setSelectedAsset] = useState<WatchlistAsset | null>(mockWatchlistAssets[0] || null);

  const handleAssetClick = (asset: WatchlistAsset) => {
    setSelectedAsset(asset);
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlistAssets(prev => prev.filter(asset => asset.symbol !== symbol));
    // If we're viewing the removed asset, switch to first remaining asset
    if (selectedAsset && selectedAsset.symbol === symbol) {
      const remaining = watchlistAssets.filter(asset => asset.symbol !== symbol);
      setSelectedAsset(remaining[0] || null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '8px',
        marginBottom: '24px'
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 500, 
          color: '#1976d2',
        }}>
          Watchlist
        </Typography>
        
        <Box textAlign="right">
          <Typography variant="body2" color="textSecondary">
            Total Assets
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary">
            {watchlistAssets.length}
          </Typography>
        </Box>
      </Box>

      {/* First row - 2:1 ratio */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} sx={{ height: '450px', mb: 3 }}>
        {/* Value Chart - Takes 2/3 of the space */}
        <Box flex={{ xs: 1, md: 2 }} sx={{ height: '100%' }}>
          {selectedAsset && (
            <ValueChart 
              assetSymbol={selectedAsset.symbol} 
              title={`${selectedAsset.symbol} Price Chart`}
            />
          )}
        </Box>

        {/* Asset Detail Sidebar - Takes 1/3 of the space */}
        <Box flex={{ xs: 1, md: 1 }} sx={{ height: '100%' }}>
          {selectedAsset && (
            <AssetDetailSidebar asset={selectedAsset} />
          )}
        </Box>
      </Box>

      {/* Second row - Watchlist Table */}
      <Box sx={{ height: '400px' }}>
        <WatchlistTable 
          assets={watchlistAssets}
          onAssetClick={handleAssetClick}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
        />
      </Box>
    </Box>
  );
};

export default Watchlist;