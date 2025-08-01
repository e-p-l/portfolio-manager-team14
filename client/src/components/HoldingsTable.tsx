import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import { Add, Remove, Edit, Delete } from '@mui/icons-material';
import { HoldingService, Holding } from '../services/holdingService';

interface HoldingsTableProps {
  holdings: Holding[];
  portfolioId: number;
  loading: boolean;
  onHoldingsChange?: () => void;
  hideActions?: boolean;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ 
  holdings, 
  portfolioId, 
  loading, 
  onHoldingsChange,
  hideActions = false
}) => {
  const [openBuyDialog, setOpenBuyDialog] = useState(false);
  const [openSellDialog, setOpenSellDialog] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [assetId, setAssetId] = useState(0);
  const [assetSymbol, setAssetSymbol] = useState('');

  const handleBuyOpen = () => {
    setQuantity(0);
    setPrice(0);
    setAssetId(0);
    setAssetSymbol('');
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
  };

  const handleBuy = async () => {
    try {
      await HoldingService.createHolding(portfolioId, assetId, quantity, price);
      if (onHoldingsChange) onHoldingsChange();
      handleClose();
    } catch (error) {
      console.error('Error buying asset:', error);
    }
  };

  const handleSell = async () => {
    if (!selectedHolding) return;
    
    try {
      // If selling all, delete the holding
      if (quantity >= selectedHolding.quantity) {
        await HoldingService.deleteHolding(selectedHolding.id);
      } else {
        // Otherwise update the quantity
        await HoldingService.updateHolding(selectedHolding.id, {
          quantity: selectedHolding.quantity - quantity
        });
      }
      if (onHoldingsChange) onHoldingsChange();
      handleClose();
    } catch (error) {
      console.error('Error selling asset:', error);
    }
  };

  const calculateTotalValue = (holding: Holding) => {
    return holding.current_price 
      ? holding.quantity * holding.current_price 
      : holding.quantity * holding.purchase_price;
  };

  const calculateGainLoss = (holding: Holding) => {
    if (!holding.current_price) return 0;
    const costBasis = holding.quantity * holding.purchase_price;
    const currentValue = holding.quantity * holding.current_price;
    return ((currentValue - costBasis) / costBasis) * 100;
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
      
      {holdings.length === 0 ? (
        <Box textAlign="center" p={3}>
          <Typography color="textSecondary">
            No holdings found. Start by buying some assets!
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="holdings table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total Value</TableCell>
                {/* <TableCell align="right">Gain/Loss</TableCell> */}
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
                  <TableCell align="right">${holding.purchase_price.toFixed(2)}</TableCell>
                  <TableCell align="right">${calculateTotalValue(holding).toFixed(2)}</TableCell>
                  {/* <TableCell align="right" sx={{
                    color: calculateGainLoss(holding) >= 0 ? 'success.main' : 'error.main'
                  }}>
                    {calculateGainLoss(holding).toFixed(2)}%
                  </TableCell> */}
                  {!hideActions && (
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleSellOpen(holding)}
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
          <Dialog open={openBuyDialog} onClose={handleClose}>
        <DialogTitle>Buy Asset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Asset Symbol"
            fullWidth
            variant="outlined"
            value={assetSymbol}
            onChange={(e) => setAssetSymbol(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Asset ID"
            type="number"
            fullWidth
            variant="outlined"
            value={assetId}
            onChange={(e) => setAssetId(Number(e.target.value))}
          />
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <TextField
            margin="dense"
            label="Price per Share"
            type="number"
            fullWidth
            variant="outlined"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleBuy} color="primary" disabled={quantity <= 0 || price <= 0 || assetId <= 0}>
            Buy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog open={openSellDialog} onClose={handleClose}>
        <DialogTitle>Sell {selectedHolding?.asset_symbol}</DialogTitle>
        <DialogContent>
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
            disabled={!selectedHolding || quantity <= 0 || quantity > selectedHolding.quantity}
          >
            Sell
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </>
  );
};

export default HoldingsTable;