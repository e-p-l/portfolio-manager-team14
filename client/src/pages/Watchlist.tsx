import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Autocomplete, 
  CircularProgress 
} from '@mui/material';
import { Add } from '@mui/icons-material';
import WatchlistTable from '../components/WatchlistTable';
import AssetDetailSidebar from '../components/AssetDetailSidebar';
import ValueChart from '../components/ValueChart';
import { useWatchlist } from '../hooks/useWatchlist';
import { WatchlistItem, Asset } from '../types';
import { AssetService } from '../services/assetService';

const DEFAULT_PORTFOLIO_ID = 1; // Match the same ID used in other components

const Watchlist: React.FC = () => {
  const { 
    watchlist, 
    loading, 
    error, 
    addToWatchlist,
    removeFromWatchlist 
  } = useWatchlist(DEFAULT_PORTFOLIO_ID);
  
  // Default to first asset selected
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  
  // Add to watchlist dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [assetSymbol, setAssetSymbol] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetOptions, setAssetOptions] = useState<Asset[]>([]);
  const [assetLoading, setAssetLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Update selected item when watchlist loads
  React.useEffect(() => {
    if (watchlist.length > 0 && !selectedItem) {
      setSelectedItem(watchlist[0]);
    }
  }, [watchlist, selectedItem]);

  // Search for assets when user types
  const searchAssets = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 1) {
      setAssetOptions([]);
      return;
    }

    try {
      setAssetLoading(true);
      const assets = await AssetService.searchAssets(searchTerm);
      setAssetOptions(assets);
    } catch (error) {
      console.error('Error searching assets:', error);
      setAssetOptions([]);
    } finally {
      setAssetLoading(false);
    }
  };

  // Debounced search - only search when manually typing, not when selecting
  useEffect(() => {
    // Don't search if an asset is already selected
    if (selectedAsset) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      searchAssets(assetSymbol);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [assetSymbol, selectedAsset]);

  const handleAddOpen = () => {
    setAssetSymbol('');
    setSelectedAsset(null);
    setAssetOptions([]);
    setOpenAddDialog(true);
  };

  const handleAddClose = () => {
    setOpenAddDialog(false);
    setAssetSymbol('');
    setSelectedAsset(null);
    setAssetOptions([]);
    setActionLoading(false);
  };

  const handleAddToWatchlist = async () => {
    if (!selectedAsset || !selectedAsset.id) return;
    
    try {
      setActionLoading(true);
      
      await addToWatchlist({
        asset_id: selectedAsset.id
      });
      
      console.log(`Successfully added ${selectedAsset.symbol} to watchlist`);
      handleAddClose();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert(error instanceof Error ? error.message : 'Failed to add to watchlist. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssetClick = (item: WatchlistItem) => {
    setSelectedItem(item);
  };

  const handleRemoveFromWatchlist = async (assetId: number) => {
    try {
      await removeFromWatchlist(assetId);
      
      // If we're viewing the removed asset, switch to first remaining asset
      if (selectedItem && selectedItem.asset_id === assetId) {
        const remaining = watchlist.filter(item => item.asset_id !== assetId);
        setSelectedItem(remaining[0] || null);
      }
      
      console.log(`Successfully removed asset from watchlist`);
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      // Error is already handled by the WatchlistTable component
      throw error;
    }
  };

  // Convert WatchlistItem to the format expected by AssetDetailSidebar
  const selectedAssetForSidebar = selectedItem;

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
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleAddOpen}
        >
          Add to Watchlist
        </Button>
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
          {selectedItem && selectedItem.asset_id && (
            <ValueChart 
              assetId={selectedItem.asset_id} 
              title={`${selectedItem.asset_symbol} Price Chart`}
              currentPrice={selectedItem.current_price}
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
      <Box>
        <WatchlistTable
          portfolioId={DEFAULT_PORTFOLIO_ID}
          watchlistItems={watchlist}
          onAssetClick={handleAssetClick}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          loading={loading}
        />
      </Box>

      {/* Add to Watchlist Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Asset to Watchlist</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Search for an asset to add to your watchlist
          </Typography>
          
          {!selectedAsset ? (
            <Autocomplete
              options={assetOptions}
              getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
              value={selectedAsset}
              onChange={(event, newValue) => {
                setSelectedAsset(newValue);
                // Clear search input when asset is selected
                if (newValue) {
                  setAssetSymbol(`${newValue.symbol} - ${newValue.name}`);
                }
              }}
              inputValue={assetSymbol}
              onInputChange={(event, newInputValue, reason) => {
                // Only update search when user is typing manually
                if (reason === 'input') {
                  setAssetSymbol(newInputValue);
                }
                // Don't trigger search when clearing or selecting
              }}
              loading={assetLoading}
              loadingText="Searching assets..."
              noOptionsText="No assets found"
              filterOptions={(x) => x} // Disable built-in filtering
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="dense"
                  label="Search Asset (e.g., AAPL or Apple)"
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {assetLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {option.symbol}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.name}
                    </Typography>
                    {option.sector && (
                      <Typography variant="caption" color="text.secondary">
                        {option.sector}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            />
          ) : (
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mt: 1 }}>
              <Typography variant="h6">{selectedAsset.symbol}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedAsset.name}</Typography>
              {selectedAsset.sector && (
                <Typography variant="caption" color="text.secondary">
                  Sector: {selectedAsset.sector}
                </Typography>
              )}
              <Button 
                size="small" 
                onClick={() => {
                  setSelectedAsset(null);
                  setAssetSymbol('');
                }} 
                sx={{ mt: 1 }}
              >
                Choose Different Asset
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddToWatchlist} 
            color="primary" 
            disabled={!selectedAsset || actionLoading}
            variant="contained"
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Add to Watchlist'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Watchlist;