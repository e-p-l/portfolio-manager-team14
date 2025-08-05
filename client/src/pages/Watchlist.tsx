import React, { useState } from 'react';
import { Typography, Box } from '@mui/material';
import WatchlistTable from '../components/WatchlistTable';
import AssetDetailSidebar from '../components/AssetDetailSidebar';
import ValueChart from '../components/ValueChart';
import { useWatchlist } from '../hooks/useWatchlist';
import { WatchlistItem } from '../types';

const DEFAULT_PORTFOLIO_ID = 1; // Match the same ID used in other components

const Watchlist: React.FC = () => {
  const { 
    watchlist, 
    loading, 
    error, 
    removeFromWatchlist 
  } = useWatchlist(DEFAULT_PORTFOLIO_ID);
  
  // Default to first asset selected
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);

  // Update selected item when watchlist loads
  React.useEffect(() => {
    if (watchlist.length > 0 && !selectedItem) {
      setSelectedItem(watchlist[0]);
    }
  }, [watchlist, selectedItem]);

  const handleAssetClick = (item: WatchlistItem) => {
    setSelectedItem(item);
  };

  const handleRemoveFromWatchlist = async (watchlistId: number) => {
    try {
      await removeFromWatchlist(watchlistId);
      // If we're viewing the removed asset, switch to first remaining asset
      if (selectedItem && selectedItem.id === watchlistId) {
        const remaining = watchlist.filter(item => item.id !== watchlistId);
        setSelectedItem(remaining[0] || null);
      }
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  // Convert WatchlistItem to the format expected by AssetDetailSidebar
  const selectedAssetForSidebar = selectedItem ? {
    symbol: selectedItem.asset_symbol || '',
    name: selectedItem.asset_name || '',
    price: selectedItem.current_price || 0,
    change: selectedItem.day_change || 0,
    changePercent: selectedItem.day_changeP || 0,
    volume: 'N/A', // Volume not available in current backend
    marketCap: 'N/A', // Market cap not available in current backend
    sector: selectedItem.asset_sector || 'Unknown',
    logo: undefined
  } : null;

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
            {watchlist.length}
          </Typography>
        </Box>
      </Box>

      {/* Error message */}
      {error && (
        <Box mb={2} p={2} bgcolor="error.light" borderRadius={1}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* First row - 2:1 ratio */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} sx={{ height: '450px', mb: 3 }}>
        {/* Value Chart - Takes 2/3 of the space */}
        <Box flex={{ xs: 1, md: 2 }} sx={{ height: '100%' }}>
          {selectedItem && selectedItem.asset_symbol && (
            <ValueChart 
              assetSymbol={selectedItem.asset_symbol} 
              title={`${selectedItem.asset_symbol} Price Chart`}
            />
          )}
        </Box>

        {/* Asset Detail Sidebar - Takes 1/3 of the space */}
        <Box flex={{ xs: 1, md: 1 }} sx={{ height: '100%' }}>
          {selectedAssetForSidebar && (
            <AssetDetailSidebar asset={selectedAssetForSidebar} />
          )}
        </Box>
      </Box>

      {/* Second row - Watchlist Table */}
      <Box sx={{ height: '400px' }}>
        <WatchlistTable 
          watchlistItems={watchlist}
          onAssetClick={handleAssetClick}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default Watchlist;