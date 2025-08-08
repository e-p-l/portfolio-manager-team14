import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Autocomplete,
  Card,
  CardContent
} from '@mui/material';
import { Add, Remove, TrendingUp, TrendingDown } from '@mui/icons-material';
import { Holding } from '../services/holdingService';
import { AssetService } from '../services/assetService';
import { TransactionService } from '../services/transactionService';
import { PortfolioService } from '../services/portfolioService';
import { Asset } from '../types';

interface HoldingsTableProps {
  holdings: Holding[];
  portfolioId: number;
  loading: boolean;
  onHoldingsChange?: (transactionValue?: number) => void;
  hideActions?: boolean;
  hidePortfolioReturn?: boolean; // New prop to hide portfolio return
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ 
  holdings, 
  portfolioId, 
  loading, 
  onHoldingsChange,
  hideActions = false,
  hidePortfolioReturn = false // Default to false to show portfolio return
}) => {
  const [openBuyDialog, setOpenBuyDialog] = useState(false);
  const [openSellDialog, setOpenSellDialog] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [assetSymbol, setAssetSymbol] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [assetOptions, setAssetOptions] = useState<Asset[]>([]);
  const [assetLoading, setAssetLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<any>(null);

  // Fetch portfolio details for total return - only if we need to show it
  useEffect(() => {
    if (hidePortfolioReturn) return; // Don't fetch if we're not showing it
    
    const fetchPortfolio = async () => {
      try {
        const portfolioData = await PortfolioService.getPortfolio(portfolioId);
        setPortfolio(portfolioData);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    };
    
    fetchPortfolio();
  }, [portfolioId, holdings, hidePortfolioReturn]); // Re-fetch when holdings change

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

  const handleBuyOpen = () => {
    setQuantity(0);
    setAssetSymbol('');
    setSelectedAsset(null);
    setAssetOptions([]);
    setOpenBuyDialog(true);
  };

  const handleSellOpen = (holding: Holding) => {
    setSelectedHolding(holding);
    setQuantity(0);
    setOpenSellDialog(true);
  };

  const handleClose = () => {
    setOpenBuyDialog(false);
    setOpenSellDialog(false);
    setSelectedHolding(null);
    setQuantity(0);
    setAssetSymbol('');
    setSelectedAsset(null);
    setAssetOptions([]);
    setActionLoading(false);
  };

  const handleBuy = async () => {
    if (!selectedAsset || quantity <= 0) return;
    
    try {
      setActionLoading(true);
      
      // Validate that the asset has an ID (should be set when selected from search)
      if (!selectedAsset.id) {
        throw new Error('Selected asset is not properly initialized. Please search and select the asset again.');
      }
      
      // Calculate transaction value (negative for buy)
      const transactionValue = selectedAsset.current_price 
        ? -(selectedAsset.current_price * quantity) 
        : 0;
      
      // Create BUY transaction using TransactionService
      await TransactionService.buyAsset(portfolioId, selectedAsset, quantity);
      
      console.log(`Successfully bought ${quantity} shares of ${selectedAsset.symbol}`);
      handleClose();
      if (onHoldingsChange) onHoldingsChange(transactionValue);
    } catch (error) {
      console.error('Error buying asset:', error);
      alert(error instanceof Error ? error.message : 'Failed to buy asset. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSell = async () => {
    if (!selectedHolding || quantity <= 0) return;
    
    try {
      setActionLoading(true);
      
      // Calculate transaction value (positive for sell)
      const transactionValue = selectedHolding.current_price 
        ? (selectedHolding.current_price * quantity)
        : (selectedHolding.purchase_price * quantity);
      
      // Create SELL transaction using TransactionService
      // Backend requires asset_id even for sell transactions (backend design issue)
      await TransactionService.sellHolding(
        portfolioId, 
        selectedHolding.id, 
        selectedHolding.asset_id,  // Pass asset_id as required by backend
        quantity
      );
      
      console.log(`Successfully sold ${quantity} shares of ${selectedHolding.asset_symbol}`);
      handleClose();
      if (onHoldingsChange) onHoldingsChange(transactionValue);
    } catch (error) {
      console.error('Error selling asset:', error);
      alert(error instanceof Error ? error.message : 'Failed to sell asset. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateTotalValue = (holding: Holding) => {
    return holding.current_price 
      ? holding.quantity * holding.current_price 
      : holding.quantity * holding.purchase_price;
  };

  const formatAssetReturn = (assetReturn: number | undefined | null) => {
    if (assetReturn === null || assetReturn === undefined) return 'N/A';
    const percentage = assetReturn * 100; // Convert to percentage
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {!hideActions && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Your Assets</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={handleBuyOpen}
          >
            Buy Asset
          </Button>
        </Box>
      )}

      {/* Portfolio Total Return Display - only show if not hidden */}
      {!hidePortfolioReturn && portfolio && (
        <Box 
          sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body1" color="text.secondary">
              Portfolio Total Return
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              {(portfolio.return || 0) >= 0 ? (
                <TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 20, color: 'error.main' }} />
              )}
              <Typography 
                variant="h6"
                fontWeight="bold"
                color={portfolio.return && portfolio.return >= 0 ? 'success.main' : 'error.main'}
              >
                {portfolio.return ? `${portfolio.return >= 0 ? '+' : ''}${portfolio.return.toFixed(2)}%` : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      {holdings.length === 0 ? (
        <Box textAlign="center" p={3}>
          <Typography color="textSecondary">
            No holdings found. Start by buying some assets!
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '750px', overflowY: 'auto' }}>
          <Table 
            stickyHeader 
            aria-label="holdings table" 
            size="small"
            sx={{
              '& .MuiTableCell-root': {
                paddingTop: '8px',
                paddingBottom: '8px',
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total Value</TableCell>
                <TableCell align="right">Return</TableCell>
                {!hideActions && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={holding.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" sx={{ color: '#1a73e8' }}>
                      {holding.asset_symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>{holding.asset_name}</TableCell>
                  <TableCell align="right">{holding.quantity}</TableCell>
                  <TableCell align="right">
                    ${holding.current_price !== undefined && holding.current_price !== null
                      ? holding.current_price.toFixed(2)
                      : holding.purchase_price.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">${calculateTotalValue(holding).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                      {(holding.asset_return || 0) >= 0 ? (
                        <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                      ) : (
                        <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                      )}
                      <Typography 
                        variant="body2" 
                        color={(holding.asset_return || 0) >= 0 ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {formatAssetReturn(holding.asset_return)}
                      </Typography>
                    </Box>
                  </TableCell>
                  {/* <TableCell align="right" sx={{
                    color: calculateGainLoss(holding) >= 0 ? 'success.main' : 'error.main'
                  }}>
                    {calculateGainLoss(holding).toFixed(2)}%
                  </TableCell> */}
                  {!hideActions && (
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleSellOpen(holding)}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'error.light',
                            color: 'white'
                          }
                        }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Buy Dialog - only render when actions are not hidden */}
      {!hideActions && (
        <>
            <Dialog open={openBuyDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Buy Asset</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Search for an asset and enter quantity
          </Typography>
          
          {!selectedAsset ? (
            <Autocomplete
              options={assetOptions}
              getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
              value={selectedAsset}
              onChange={(event, newValue) => {
                setSelectedAsset(newValue);
                // Clear search input when asset is selected to prevent further searches
                if (newValue) {
                  setAssetSymbol('');
                  setAssetOptions([]); // Clear options to close dropdown
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
                    <Typography variant="body2" color="textSecondary">
                      {option.name}
                    </Typography>
                    {option.current_price && (
                      <Typography variant="caption" color="primary">
                        ${option.current_price.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            />
          ) : (
            <Box mt={2} mb={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="grey.50" borderRadius={1} border="1px solid" borderColor="grey.300">
                <Box>
                  <Typography variant="h6" color="primary">
                    {selectedAsset.symbol} - {selectedAsset.name}
                  </Typography>
                  {selectedAsset.current_price && (
                    <Typography variant="body2" color="textSecondary">
                      Current Price: ${selectedAsset.current_price.toFixed(2)}
                    </Typography>
                  )}
                </Box>
                <Button 
                  variant="outlined"
                  size="small" 
                  onClick={() => {
                    setSelectedAsset(null);
                    setAssetSymbol('');
                  }}
                  color="primary"
                >
                  Change Asset
                </Button>
              </Box>
            </Box>
          )}
          
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            inputProps={{ min: 1 }}
          />
          
          {selectedAsset && selectedAsset.current_price && (
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="body2" color="textSecondary">
                Current Price: <strong>${selectedAsset.current_price.toFixed(2)}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Cost: <strong>${(selectedAsset.current_price * quantity).toFixed(2)}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleBuy} 
            color="primary" 
            disabled={quantity <= 0 || !selectedAsset || actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Buy Asset'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog open={openSellDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Sell {selectedHolding?.asset_symbol}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Sell shares of {selectedHolding?.asset_name} ({selectedHolding?.asset_symbol})
          </Typography>
          <Typography variant="body2" gutterBottom>
            You currently own: {selectedHolding?.quantity} shares
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Quantity to Sell"
            type="number"
            fullWidth
            variant="outlined"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            error={selectedHolding ? quantity > selectedHolding.quantity : false}
            helperText={selectedHolding && quantity > selectedHolding.quantity ? "Cannot sell more than you own" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSell} 
            color="primary" 
            disabled={!selectedHolding || quantity <= 0 || quantity > selectedHolding.quantity || actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Sell Asset'}
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </>
  );
};

export default HoldingsTable;