import React, { useState, useEffect } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

// Hook to manage balance notifications
export const useBalanceNotification = () => {
  const [notification, setNotification] = useState<{
    amount: number;
    visible: boolean;
  }>({ amount: 0, visible: false });

  const showNotification = (amount: number) => {
    setNotification({ amount, visible: true });
  };

  const hideNotification = () => {
    setNotification({ amount: 0, visible: false });
  };

  return {
    notification,
    showNotification,
    hideNotification,
  };
};

interface BalanceNotificationProps {
  amount: number;
  visible: boolean;
  onComplete?: () => void;
}

const BalanceNotification: React.FC<BalanceNotificationProps> = ({ 
  amount, 
  visible, 
  onComplete 
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible && amount !== 0) {
      setShow(true);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          onComplete?.();
        }, 300); // Wait for fade out animation
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, amount, onComplete]);

  const isPositive = amount > 0;
  const formatAmount = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (amount === 0) return null;

  return (
    <Fade in={show} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: '155px',
          right: '20px',
          zIndex: 10000,
          bgcolor: isPositive ? 'success.light' : 'error.light',
          color: isPositive ? 'success.contrastText' : 'error.contrastText',
          borderRadius: '12px',
          padding: '12px 20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          border: `2px solid ${isPositive ? '#4caf50' : '#f44336'}`,
          background: isPositive 
            ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
            : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
          minWidth: '140px',
          justifyContent: 'center',
          animation: 'slideInBounce 0.5s ease-out',
          '@keyframes slideInBounce': {
            '0%': {
              transform: 'translateX(100%) scale(0.8)',
              opacity: 0,
            },
            '60%': {
              transform: 'translateX(-10px) scale(1.05)',
              opacity: 1,
            },
            '100%': {
              transform: 'translateX(0) scale(1)',
              opacity: 1,
            },
          },
        }}
      >
        {isPositive ? (
          <TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />
        ) : (
          <TrendingDown sx={{ fontSize: 20, color: 'error.main' }} />
        )}
        <Typography 
          variant="body1" 
          fontWeight="bold"
          sx={{ 
            color: isPositive ? 'success.main' : 'error.main',
            fontSize: '16px'
          }}
        >
          {isPositive ? '+' : '-'}${formatAmount}
        </Typography>
      </Box>
    </Fade>
  );
};

export default BalanceNotification;