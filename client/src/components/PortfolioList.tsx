import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { usePortfolios } from '../hooks/usePortfolios';

const PortfolioList: React.FC = () => {
  const { portfolios, loading, error, createPortfolio, updatePortfolio, deletePortfolio } = usePortfolios();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = async () => {
    try {
      if (editingPortfolio) {
        await updatePortfolio(editingPortfolio, formData);
      } else {
        await createPortfolio({
          user_id: 1, // Hardcoded for demo
          name: formData.name,
          description: formData.description,
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save portfolio:', error);
    }
  };

  const handleEdit = (portfolio: any) => {
    setEditingPortfolio(portfolio.id);
    setFormData({ name: portfolio.name, description: portfolio.description || '' });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPortfolio(null);
    setFormData({ name: '', description: '' });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Your Portfolios</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsDialogOpen(true)}
          >
            Add Portfolio
          </Button>
        </Box>

        {portfolios.length === 0 ? (
          <Typography color="text.secondary">
            No portfolios found. Create your first portfolio!
          </Typography>
        ) : (
          <List>
            {portfolios.map((portfolio) => (
              <ListItem key={portfolio.id} divider>
                <ListItemText
                  primary={portfolio.name}
                  secondary={portfolio.description || 'No description'}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEdit(portfolio)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => deletePortfolio(portfolio.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingPortfolio ? 'Edit Portfolio' : 'Create New Portfolio'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Portfolio Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingPortfolio ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PortfolioList;
